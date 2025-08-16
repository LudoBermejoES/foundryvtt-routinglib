/**
 * Focused Debug Test
 * Let's test pathfinding step by step to see exactly what's happening
 */

console.log("🔍 FOCUSED PATHFINDING DEBUG");
console.log("============================");

// Get selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn("Please select a token first!");
    return;
}

console.log(`🎯 Token: ${selectedToken.name}`);
console.log(`📍 Position: (${selectedToken.x}, ${selectedToken.y})`);
console.log(`📏 Size: ${selectedToken.document.width}x${selectedToken.document.height}`);

// Step 1: Test coordinate conversion methods
const tokenPixelPos = { x: selectedToken.x, y: selectedToken.y };

// Method 1: Simple division (what routing-token used to do)
const simpleGrid = {
    x: Math.floor(tokenPixelPos.x / canvas.grid.size),
    y: Math.floor(tokenPixelPos.y / canvas.grid.size)
};

// Method 2: v13 API method (what we changed it to)
const v13Offset = canvas.grid.getOffset({ x: tokenPixelPos.x, y: tokenPixelPos.y });
const v13Grid = { x: v13Offset.i, y: v13Offset.j };

// Method 3: What routinglib's own conversion does (from cache.js)
const routinglibGrid = window.routinglib.pixelToGrid(tokenPixelPos.x, tokenPixelPos.y);

console.log("\n📐 COORDINATE CONVERSION COMPARISON:");
console.log(`Pixel position: (${tokenPixelPos.x}, ${tokenPixelPos.y})`);
console.log(`Simple division: (${simpleGrid.x}, ${simpleGrid.y})`);
console.log(`v13 getOffset(): (${v13Grid.x}, ${v13Grid.y})`);
console.log(`Routinglib conversion: (${routinglibGrid.x}, ${routinglibGrid.y})`);

// Check if they're all the same
const allSame = (simpleGrid.x === v13Grid.x && v13Grid.x === routinglibGrid.x && 
                 simpleGrid.y === v13Grid.y && v13Grid.y === routinglibGrid.y);
console.log(`All methods give same result: ${allSame}`);

if (!allSame) {
    console.warn("⚠️ COORDINATE CONVERSION MISMATCH DETECTED!");
    console.log("This could explain why pathfinding isn't working properly.");
}

// Step 2: Pick a test destination with walls between
const startGrid = routinglibGrid;  // Use routinglib's own conversion
const endGrid = { x: startGrid.x + 10, y: startGrid.y };  // 10 squares right

console.log(`\n🎯 TEST PATH:`);
console.log(`From: (${startGrid.x}, ${startGrid.y})`);
console.log(`To:   (${endGrid.x}, ${endGrid.y})`);

// Step 3: Check for walls manually in this area
const wallsInPath = [];
for (let checkX = Math.min(startGrid.x, endGrid.x); checkX <= Math.max(startGrid.x, endGrid.x); checkX++) {
    for (let checkY = Math.min(startGrid.y, endGrid.y) - 1; checkY <= Math.max(startGrid.y, endGrid.y) + 1; checkY++) {
        // Convert grid position to pixel
        const pixelCheck = window.routinglib.gridToPixel(checkX, checkY);
        
        // Find walls near this position
        const nearbyWalls = canvas.walls.placeables.filter(wall => {
            const wallStartX = wall.document.c[0];
            const wallStartY = wall.document.c[1];
            const wallEndX = wall.document.c[2];
            const wallEndY = wall.document.c[3];
            
            // Check if wall is near this grid position
            const gridSize = canvas.grid.size;
            return (Math.abs(wallStartX - pixelCheck.x) < gridSize * 2 || Math.abs(wallStartY - pixelCheck.y) < gridSize * 2 ||
                    Math.abs(wallEndX - pixelCheck.x) < gridSize * 2 || Math.abs(wallEndY - pixelCheck.y) < gridSize * 2);
        });
        
        if (nearbyWalls.length > 0) {
            wallsInPath.push({
                grid: {x: checkX, y: checkY},
                pixel: pixelCheck,
                wallCount: nearbyWalls.length
            });
        }
    }
}

console.log(`\n🧱 WALLS DETECTED IN PATH AREA:`);
if (wallsInPath.length === 0) {
    console.warn("❌ NO WALLS FOUND in path area!");
    console.log("This explains why pathfinding gives direct path - no obstacles detected.");
} else {
    console.log(`Found ${wallsInPath.length} grid positions with walls:`);
    wallsInPath.slice(0, 5).forEach(pos => {
        console.log(`  Grid (${pos.grid.x}, ${pos.grid.y}) has ${pos.wallCount} nearby walls`);
    });
}

// Step 4: Enable targeted debugging and test
console.log("\n🐛 ENABLING DEBUG FOR SPECIFIC POSITIONS...");

// Debug just a few positions in the direct path
const debugPositions = [
    startGrid,
    { x: startGrid.x + 3, y: startGrid.y },
    { x: startGrid.x + 6, y: startGrid.y },
    endGrid
];

window.routinglib.enableDebugForPositions(debugPositions, {
    verboseCollision: true,
    wallIntersections: true,
    blockedMovements: true,
    allowedMovements: false,  // Only show blocked movements to reduce noise
    summaryOnly: false
});

console.log("Debug enabled for positions:", debugPositions);

// Step 5: Test pathfinding
console.log("\n🚀 TESTING PATHFINDING...");

window.routinglib.calculatePath(startGrid, endGrid, {
    token: selectedToken,
    maxDistance: 500
}).then(result => {
    console.log("\n📊 PATHFINDING RESULT:");
    
    if (result && result.path) {
        console.log(`✅ Path found with ${result.path.length} waypoints:`);
        
        result.path.forEach((point, i) => {
            console.log(`  ${i + 1}: Grid (${point.x}, ${point.y})`);
        });
        
        // Analysis
        if (result.path.length === 2) {
            console.log("\n❌ DIRECT PATH - NO OBSTACLES DETECTED");
            console.log("DIAGNOSIS:");
            if (wallsInPath.length === 0) {
                console.log("  → No walls found in path area - this is the problem!");
                console.log("  → Check if walls exist between these positions");
                console.log("  → Check wall placement and configuration");
            } else {
                console.log("  → Walls exist but collision detection isn't working");
                console.log("  → Check collision detection debug messages above");
                console.log("  → Possible coordinate system or API mismatch");
            }
        } else {
            console.log("✅ PATHFINDING WORKING - obstacles detected and avoided!");
        }
        
        // Visual result
        const g = new PIXI.Graphics();
        g.lineStyle(4, result.path.length === 2 ? 0xff0000 : 0x00ff00, 0.8);
        g.name = "focused-debug-path";
        
        for (let i = 0; i < result.path.length; i++) {
            const pixelPoint = window.routinglib.gridToPixel(result.path[i].x, result.path[i].y);
            if (i === 0) {
                g.moveTo(pixelPoint.x, pixelPoint.y);
            } else {
                g.lineTo(pixelPoint.x, pixelPoint.y);
            }
            
            // Mark waypoints
            g.beginFill(i === 0 ? 0x00ff00 : (i === result.path.length - 1 ? 0xff0000 : 0xffff00), 0.9);
            g.drawCircle(pixelPoint.x, pixelPoint.y, 6);
            g.endFill();
        }
        
        canvas.stage.addChild(g);
        
        setTimeout(() => {
            const existing = canvas.stage.getChildByName("focused-debug-path");
            if (existing) {
                canvas.stage.removeChild(existing);
                existing.destroy();
            }
            window.routinglib.disableDebug();
        }, 10000);
        
    } else {
        console.error("❌ NO PATH FOUND!");
    }
    
}).catch(error => {
    console.error("💥 ERROR:", error);
    window.routinglib.disableDebug();
});

console.log("\n💡 WHAT TO WATCH FOR:");
console.log("1. Are coordinate conversions consistent?");
console.log("2. Are walls detected in the path area?");
console.log("3. Do collision detection messages show 'BLOCKED' movements?");
console.log("4. Red line = direct path (problem), Green = pathfinding worked");
console.log("\n⏳ Results will appear above in 2-3 seconds...");