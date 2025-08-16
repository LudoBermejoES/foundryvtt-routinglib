/**
 * Quick Wall Configuration Check
 * This macro quickly checks common wall configuration issues that prevent pathfinding
 */

console.log("🔧 ROUTINGLIB WALL CONFIGURATION CHECK");
console.log("======================================");

// Check if routinglib is loaded
if (!window.routinglib) {
    console.error("❌ Routinglib is not loaded!");
    ui.notifications.error("Routinglib is not available!");
    return;
}

console.log("✅ Routinglib is loaded and available");

// Check wall count
const wallCount = canvas.walls.placeables.length;
console.log(`📊 Found ${wallCount} walls in scene`);

if (wallCount === 0) {
    console.warn("⚠️  No walls found - pathfinding will work but won't route around obstacles");
    ui.notifications.warn("No walls found in scene!");
    return;
}

// Check wall configurations
let movementBlockingWalls = 0;
let doorWalls = 0;
let openDoorWalls = 0;
let wallHeightWalls = 0;
let problemWalls = [];

canvas.walls.placeables.forEach((wall, index) => {
    const doc = wall.document;
    
    // Check movement blocking
    if (doc.move === CONST.WALL_MOVEMENT_TYPES.NORMAL) {
        movementBlockingWalls++;
    }
    
    // Check doors
    if (doc.door !== CONST.WALL_DOOR_TYPES.NONE) {
        doorWalls++;
        if (doc.ds === CONST.WALL_DOOR_STATES.OPEN) {
            openDoorWalls++;
        }
    }
    
    // Check wall height
    if (doc.flags && doc.flags["wall-height"]) {
        wallHeightWalls++;
    }
    
    // Check for potential problems
    if (doc.move === CONST.WALL_MOVEMENT_TYPES.NONE) {
        problemWalls.push({
            index,
            issue: "Wall doesn't block movement",
            details: `Wall ${index} has move=${doc.move} (NONE) - won't block pathfinding`
        });
    }
    
    // Check for zero-length walls
    const start = {x: doc.c[0], y: doc.c[1]};
    const end = {x: doc.c[2], y: doc.c[3]};
    const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    
    if (length < 1) {
        problemWalls.push({
            index,
            issue: "Zero-length wall",
            details: `Wall ${index} is too short (${length.toFixed(2)} pixels) - may not work properly`
        });
    }
});

console.log(`📈 Wall Statistics:`);
console.log(`   🚧 Movement-blocking walls: ${movementBlockingWalls}/${wallCount}`);
console.log(`   🚪 Door walls: ${doorWalls} (${openDoorWalls} open)`);
console.log(`   📏 Wall-height walls: ${wallHeightWalls}`);

// Report problems
if (problemWalls.length > 0) {
    console.warn(`⚠️  Found ${problemWalls.length} potential wall issues:`);
    problemWalls.forEach(problem => {
        console.warn(`   ❌ ${problem.issue}: ${problem.details}`);
    });
} else {
    console.log("✅ No obvious wall configuration problems found");
}

// Check grid type
const gridType = canvas.grid.type;
const gridTypeNames = {
    [CONST.GRID_TYPES.SQUARE]: "Square Grid",
    [CONST.GRID_TYPES.HEXAGONAL]: "Hexagonal Grid", 
    [CONST.GRID_TYPES.GRIDLESS]: "Gridless"
};

console.log(`🏁 Grid Type: ${gridTypeNames[gridType] || gridType} (${canvas.grid.size}px per unit)`);

// Test a simple pathfinding calculation if possible
const selectedToken = canvas.tokens.controlled[0];
if (selectedToken) {
    console.log("\n🧪 TESTING BASIC PATHFINDING...");
    console.log(`Selected token: ${selectedToken.name}`);
    
    // Test pathfinding from token position to a nearby point
    const tokenGridPos = window.routinglib.pixelToGrid(selectedToken.x, selectedToken.y);
    const testDestination = {
        x: tokenGridPos.x + 3,
        y: tokenGridPos.y + 3
    };
    
    console.log(`Testing path: (${tokenGridPos.x}, ${tokenGridPos.y}) → (${testDestination.x}, ${testDestination.y})`);
    
    window.routinglib.calculatePath(tokenGridPos, testDestination, {
        token: selectedToken,
        maxDistance: 100
    }).then(result => {
        if (result && result.path && result.path.length > 0) {
            console.log(`✅ Basic pathfinding test PASSED - found path with ${result.path.length} waypoints`);
            ui.notifications.info(`✅ Basic pathfinding works! Found ${result.path.length} waypoints.`);
        } else {
            console.warn("⚠️  Basic pathfinding test FAILED - no path found");
            ui.notifications.warn("⚠️ Basic pathfinding test failed - check wall configuration");
        }
    }).catch(error => {
        console.error("❌ Basic pathfinding test ERROR:", error);
        ui.notifications.error(`❌ Pathfinding error: ${error.message}`);
    });
} else {
    console.log("💡 Select a token to run basic pathfinding test");
    ui.notifications.info("Select a token to test pathfinding!");
}

// Provide recommendations
console.log("\n💡 RECOMMENDATIONS:");
if (movementBlockingWalls < wallCount * 0.5) {
    console.log("   📝 Consider setting more walls to block movement (Wall Movement: Normal)");
}
if (problemWalls.length > 0) {
    console.log("   🔧 Fix the wall configuration issues listed above");
}
console.log("   🐛 Use debug_wall_pathfinding.js macro for detailed pathfinding analysis");
console.log("   📖 Check FoundryVTT wall documentation for proper wall setup");

console.log("\n✅ Wall configuration check complete!");