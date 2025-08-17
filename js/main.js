import {initializeBackground, createAsyncPathfinder, cancelJob} from "./background.js";
import {cache, GriddedCache, initializeCaches, wipeCaches, enableDebugForPositions, disableDebug, debugNarrowPassages, debugHorizontalBarrier, debugSummary, analyzeWalls, findWallsInArea, setDebugEnabled, initializeDebugConfig, stepCollidesWithWall} from "./cache.js";
import {GriddedPathfinder, GridlessPathfinder} from "./pathfinder.js";
import {coordinateHelper, pixelToGrid, gridToPixel, pixelPosToGrid, gridPosToPixel} from "./coordinate_helper.js";

import initGridlessPathfinding from "../wasm/gridless_pathfinding.js";
import {getAltOrientationFlagForToken, getHexTokenSize, isModuleActive} from "./util.js";

let foundryReady = false;
let wasmReady = false;

// ---------------------------------------------------------------------------
//  Build identifier – bump manually when you make local changes and want to
//  confirm the browser has reloaded the latest code.  A simple integer or
//  date-string works fine.
// ---------------------------------------------------------------------------
export const BUILD_ID = "2025-07-15a";

function initializePathfinder(from, to, options) {
	const token = options.token;

	let elevation = options.elevation;
	/** @type {any} */ let tokenData;

	if (token) {
		tokenData = {width: token.document.width, height: token.document.height};
		if (!elevation) {
			elevation = isModuleActive("wall-height") && token.losHeight !== undefined
				? token.losHeight
				: token.document.elevation;
		}
		if (canvas.grid.isHexagonal) {
			tokenData.size = getHexTokenSize(token);
			tokenData.altOrientation = getAltOrientationFlagForToken(token, tokenData.size);
		}
	} else {
		tokenData = {width: 1, height: 1};
		elevation = elevation ?? 0;
		if (canvas.grid.isHexagonal) {
			tokenData.size = 1;
			tokenData.altOrientation = false;
		}
	}

	tokenData.elevation = elevation;

	const levelIndex = cache.getLevelIndexForElevation(elevation);
	
	// Only show debug info if debug logging is enabled
	const debugEnabled = game?.settings?.get("routinglib", "enableDebugLogging") ?? false;
	if (debugEnabled) {
		console.log(`[RoutingLib] DEBUG: canvas.grid.type = ${canvas.grid.type}, CONST.GRID_TYPES =`, CONST.GRID_TYPES);
		console.log(`[RoutingLib] DEBUG: canvas.grid.size = ${canvas.grid.size}`);
		console.log(`[RoutingLib] DEBUG: canvas.scene.grid =`, canvas.scene.grid);
		console.log(`[RoutingLib] DEBUG: canvas.grid =`, canvas.grid);
	}
	
	if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
		if (debugEnabled) {
			console.log(`[RoutingLib] Using GridlessPathfinder`);
		}
		const tokenSize = Math.max(tokenData.width, tokenData.height);
		const graph = cache.getGraphFor(tokenSize, levelIndex, elevation);
		return new GridlessPathfinder(graph, from, to, options);
	} else {
		if (debugEnabled) {
			console.log(`[RoutingLib] Using GriddedPathfinder with sizeIndex calculation`);
		}
		const sizeIndex = GriddedCache.getSnapPointIndexForTokenData(tokenData);
		if (debugEnabled) {
			console.log(`[RoutingLib] Calculated sizeIndex=${sizeIndex}, levelIndex=${levelIndex}`);
		}
		return new GriddedPathfinder(sizeIndex, levelIndex, from, to, token, tokenData, options);
	}
}

function calculatePath(from, to, options = {}) {
	const pathfinder = initializePathfinder(from, to, options);
	return createAsyncPathfinder(pathfinder);
}

function calculatePathBlocking(from, to, options = {}) {
	if (!options.maxDistance) {
		throw "A maximum distance (options.maxDistance) must be specified when calling `calculatePathBlocking`. To calculte long paths, please use the ";
	}
	const pathfinder = initializePathfinder(from, to, options);

	let path = undefined;
	while (path === undefined) {
		path = pathfinder.step();
	}

	if (path === null) {
		return null;
	}

	return pathfinder.postProcessResult(path);
}

Hooks.once("init", async () => {
	game.settings.register("routinglib", "gridlessTokenSizeRatio", {
		scope: "world",
		config: false,
		type: Number,
		default: 0.9,
		onChange: () => {
			if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
				cache.reset();
			}
		},
	});

	game.settings.register("routinglib", "enableDebugLogging", {
		name: "Enable Debug Logging",
		hint: "Enable detailed debug logging for pathfinding operations. Warning: This can generate a lot of console output.",
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Update the debug configuration when setting changes
			if (window.routinglib && window.routinglib.setDebugEnabled) {
				window.routinglib.setDebugEnabled(value);
			}
		}
	});
});

Hooks.once("ready", async () => {
	foundryReady = true;
	initializeIfReady();
});

initGridlessPathfinding().then(() => {
	wasmReady = true;
	initializeIfReady();
});

function initializeIfReady() {
	if (!foundryReady || !wasmReady) return;
	initializeCaches();
	initializeBackground();
	
	// Initialize debug configuration from Foundry setting
	initializeDebugConfig();

	// ────────────────────────────
	//  Fancy banner so users (and devs) know RoutingLib is active
	// ────────────────────────────
	const version = game.modules.get("routinglib")?.version ?? "dev";
	const banner = String.raw`
 ██▀███   ▒█████   █    ██ ▄▄▄█████▓ ██▓ ███▄    █   ▄████  ██▓     ██▓ ▄▄▄▄   
▓██ ▒ ██▒▒██▒  ██▒ ██  ▓██▒▓  ██▒ ▓▒▓██▒ ██ ▀█   █  ██▒ ▀█▒▓██▒    ▓██▒▓█████▄ 
▓██ ░▄█ ▒▒██░  ██▒▓██  ▒██░▒ ▓██░ ▒░▒██▒▓██  ▀█ ██▒▒██░▄▄▄░▒██░    ▒██▒▒██▒ ▄██
▒██▀▀█▄  ▒██   ██░▓▓█  ░██░░ ▓██▓ ░ ░██░▓██▒  ▐▌██▒░▓█  ██▓▒██░    ░██░▒██░█▀  
░██▓ ▒██▒░ ████▓▒░▒▒█████▓   ▒██▒ ░ ░██░▒██░   ▓██░░▒▓███▀▒░██████▒░██░░▓█  ▀█▓
░ ▒▓ ░▒▓░░ ▒░▒░▒░ ░▒▓▒ ▒ ▒   ▒ ░░   ░▓  ░ ▒░   ▒ ▒  ░▒   ▒ ░ ▒░▓  ░░▓  ░▒▓███▀▒
  ░▒ ░ ▒░  ░ ▒ ▒░ ░░▒░ ░ ░     ░     ▒ ░░ ░░   ░ ▒░  ░   ░ ░ ░ ▒  ░ ▒ ░▒░▒   ░ 
  ░░   ░ ░ ░ ░ ▒   ░░░ ░ ░   ░       ▒ ░   ░   ░ ░ ░ ░   ░   ░ ░    ▒ ░ ░    ░ 
   ░         ░ ░     ░               ░           ░       ░     ░  ░ ░   ░      
                                                                             ░ `;

	// Print with a green monospace style
	// eslint-disable-next-line no-console
	console.log(`%c${banner}`, "color:#4caf50; font-family:monospace;");
	// eslint-disable-next-line no-console
	console.log(`%cRoutingLib v${version}  build ${BUILD_ID} loadedx`, "color:#4caf50; font-family:monospace;");

	window.routinglib = {
		calculatePath, 
		calculatePathBlocking, 
		cancelPathfinding,
		// Debug functions
		enableDebugForPositions,
		disableDebug,
		debugNarrowPassages,
		debugHorizontalBarrier,
		debugSummary,
		setDebugEnabled,
		// Coordinate helper (centralized coordinate system)
		coordinateHelper,
		// Legacy coordinate functions (backward compatibility)
		pixelToGrid,
		gridToPixel,
		pixelPosToGrid,
		gridPosToPixel,
		// Wall analysis
		analyzeWalls,
		findWallsInArea,
		// Cache management (for debugging)
		wipeCaches,
		// Collision detection
		stepCollidesWithWall
	};

	Hooks.on("canvasInit", wipeCaches);
	// TODO There's no point in re-running jobs when switching scenes. Better cancel them all in that case
	Hooks.on("canvasReady", initializeCaches);
	Hooks.on("createWall", wipeCaches);
	Hooks.on("updateWall", wipeCaches);
	Hooks.on("deleteWall", wipeCaches);

	// Rebuild path-finding graphs automatically when the Scene grid
	// configuration is changed (size, type, etc.).  Otherwise a stale
	// cache from the previous grid resolution can lead to phantom blockers.
	Hooks.on("updateScene", (scene, diff) => {
		if (diff.grid || diff.gridSize || diff.gridType) {
			const debugEnabled = game?.settings?.get("routinglib", "enableDebugLogging") ?? false;
			if (debugEnabled) {
				console.log("[RoutingLib] Grid settings changed – rebuilding caches");
			}
			wipeCaches();        // drops all graphs immediately
			initializeCaches();  // rebuild for the new grid
		}
	});

	Hooks.callAll("routinglib.ready");
}

function cancelPathfinding(promise) {
	return cancelJob(promise);
}
