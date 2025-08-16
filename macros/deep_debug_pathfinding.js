/**
 * Deep Debug Pathfinding
 * This will show us exactly what routinglib is seeing during pathfinding
 */

console.log("🔍 DEEP PATHFINDING DEBUG");
console.log("=========================");

// Get selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn("Please select a token first!");
    return;
}

console.log(`🎯 Token: ${selectedToken.name}`);
console.log(`📍 Position: (${selectedToken.x}, ${selectedToken.y})`);
console.log(`📏 Size: ${selectedToken.document.width}x${selectedToken.document.height}`);
console.log(`🏔️ Elevation: ${selectedToken.document.elevation}`);

// Test coordinates - let's pick a path that DEFINITELY has walls
const tokenPos = { x: selectedToken.x, y: selectedToken.y };

// Convert to grid using both methods to compare
const oldMethod = {
    x: Math.floor(tokenPos.x / canvas.grid.size),
    y: Math.floor(tokenPos.y / canvas.grid.size)
};

const newMethod = canvas.grid.getOffset({ x: tokenPos.x, y: tokenPos.y });
const newMethodGrid = { x: newMethod.i, y: newMethod.j };

console.log("\n📐 COORDINATE CONVERSION COMPARISON:");
console.log(`Pixel position: (${tokenPos.x}, ${tokenPos.y})`);
console.log(`Old method: (${oldMethod.x}, ${oldMethod.y})`);
console.log(`New method: (${newMethodGrid.x}, ${newMethodGrid.y})`);
console.log(`Difference: (${newMethodGrid.x - oldMethod.x}, ${newMethodGrid.y - oldMethod.y})`);

// Choose test destination that should have walls in between
const testDest = {
    x: newMethodGrid.x + 15,  // Move 15 squares right
    y: newMethodGrid.y        // Same Y level
};

const testDestPixel = canvas.grid.getCenterPoint({ i: testDest.x, j: testDest.y });

console.log(`\n🎯 TEST PATH:`);
console.log(`From: Grid (${newMethodGrid.x}, ${newMethodGrid.y}) = Pixel (${tokenPos.x}, ${tokenPos.y})`);
console.log(`To:   Grid (${testDest.x}, ${testDest.y}) = Pixel (${testDestPixel.x}, ${testDestPixel.y})`);

// Check walls in the path area with extra detail
const pathArea = {
    minX: Math.min(newMethodGrid.x, testDest.x) - 3,
    maxX: Math.max(newMethodGrid.x, testDest.x) + 3,
    minY: Math.min(newMethodGrid.y, testDest.y) - 3,
    maxY: Math.max(newMethodGrid.y, testDest.y) + 3
};

console.log(`\n🔍 ANALYZING WALLS IN PATH AREA: (${pathArea.minX}, ${pathArea.minY}) to (${pathArea.maxX}, ${pathArea.maxY})`);

const wallsInArea = canvas.walls.placeables.filter(wall => {
    const startOffset = canvas.grid.getOffset({x: wall.document.c[0], y: wall.document.c[1]});
    const endOffset = canvas.grid.getOffset({x: wall.document.c[2], y: wall.document.c[3]});
    
    const wallMinX = Math.min(startOffset.i, endOffset.i);
    const wallMaxX = Math.max(startOffset.i, endOffset.i);
    const wallMinY = Math.min(startOffset.j, endOffset.j);
    const wallMaxY = Math.max(startOffset.j, endOffset.j);
    
    return !(wallMaxX < pathArea.minX || wallMinX > pathArea.maxX || wallMaxY < pathArea.minY || wallMinY > pathArea.maxY);
});

console.log(`Found ${wallsInArea.length} walls in path area:`);
wallsInArea.slice(0, 10).forEach((wall, i) => {  // Show first 10 walls
    const startOffset = canvas.grid.getOffset({x: wall.document.c[0], y: wall.document.c[1]});
    const endOffset = canvas.grid.getOffset({x: wall.document.c[2], y: wall.document.c[3]});
    console.log(`  Wall ${i}: Grid (${startOffset.i},${startOffset.j}) to (${endOffset.i},${endOffset.j}) | Move: ${wall.document.move} | Door: ${wall.document.door}/${wall.document.ds}`);
});

if (wallsInArea.length > 10) {
    console.log(`  ... and ${wallsInArea.length - 10} more walls`);
}

// Enable VERY verbose debugging for specific positions
const debugPositions = [];
for (let x = newMethodGrid.x; x <= testDest.x; x++) {
    debugPositions.push({ x, y: newMethodGrid.y });
}

console.log(`\n🐛 ENABLING VERBOSE DEBUG for ${debugPositions.length} grid positions along the path`);
window.routinglib.enableDebugForPositions(debugPositions, {
    verboseCollision: true,        // Show detailed collision detection
    wallIntersections: true,       // Show wall intersection details
    squeezing: true,              // Show creature size logic
    graphConstruction: true,      // Show graph building
    summaryOnly: false,           // Show all details
    blockedMovements: true,       // Show blocked movements
    allowedMovements: true        // Show allowed movements
});

console.log("\n🔬 TESTING SINGLE STEP COLLISION DETECTION:");
// Test a few individual steps to see what's happening
const testSteps = [
    { from: newMethodGrid, to: { x: newMethodGrid.x + 1, y: newMethodGrid.y } },
    { from: newMethodGrid, to: { x: newMethodGrid.x + 2, y: newMethodGrid.y } },
    { from: newMethodGrid, to: { x: newMethodGrid.x + 3, y: newMethodGrid.y } }
];

testSteps.forEach((step, i) => {
    console.log(`\n--- Testing Step ${i + 1}: (${step.from.x}, ${step.from.y}) → (${step.to.x}, ${step.to.y}) ---`);
    
    // We can't directly call stepCollidesWithWall as it's not exported, but we can see what routinglib sees
    const tokenData = {
        width: selectedToken.document.width,
        height: selectedToken.document.height,
        elevation: selectedToken.document.elevation
    };
    
    console.log(`Token data for collision:`, tokenData);
});

// Now run the full pathfinding with all debug enabled
console.log("\n🚀 RUNNING PATHFINDING WITH FULL DEBUG...");

window.routinglib.calculatePath(newMethodGrid, testDest, {
    token: selectedToken,
    maxDistance: 1000
}).then(result => {
    console.log("\n📊 PATHFINDING RESULT WITH FULL DEBUG:");
    
    if (result && result.path) {
        console.log(`Path found with ${result.path.length} waypoints:`);
        result.path.forEach((point, i) => {
            const pixelPoint = canvas.grid.getCenterPoint({ i: point.x, j: point.y });
            console.log(`  ${i + 1}: Grid (${point.x}, ${point.y}) = Pixel (${Math.round(pixelPoint.x)}, ${Math.round(pixelPoint.y)})`);
        });
        
        // Visual debugging - draw the path
        const g = new PIXI.Graphics();
        g.lineStyle(6, result.path.length === 2 ? 0xff0000 : 0x00ff00, 0.9);
        g.name = "deep-debug-path";
        
        const firstPixel = canvas.grid.getCenterPoint({ i: result.path[0].x, j: result.path[0].y });
        g.moveTo(firstPixel.x, firstPixel.y);
        
        for (let i = 1; i < result.path.length; i++) {
            const pixelPoint = canvas.grid.getCenterPoint({ i: result.path[i].x, j: result.path[i].y });
            g.lineTo(pixelPoint.x, pixelPoint.y);
            
            // Add waypoint markers
            g.beginFill(0xffff00, 0.8);
            g.drawCircle(pixelPoint.x, pixelPoint.y, 8);
            g.endFill();
        }
        
        canvas.stage.addChild(g);
        
        // Clean up after 15 seconds
        setTimeout(() => {
            const existing = canvas.stage.getChildByName("deep-debug-path");
            if (existing) {
                canvas.stage.removeChild(existing);
                existing.destroy();
            }
            window.routinglib.disableDebug();
            console.log("🧹 Debug cleanup completed");
        }, 15000);
        
        // Analysis
        if (result.path.length === 2) {
            console.log("\n❌ ANALYSIS: DIRECT PATH DETECTED");
            console.log("This means routinglib believes there are NO obstacles between start and end.");
            console.log("Possible causes:");
            console.log("  1. Wall collision detection is not working");
            console.log("  2. Coordinate system mismatch");
            console.log("  3. Token data not being passed correctly");
            console.log("  4. Wall height or other module conflicts");
            console.log("\n🔍 Check the collision detection messages above for clues!");
        } else {
            console.log("\n✅ ANALYSIS: PATHFINDING IS WORKING!");
            console.log(`Found ${result.path.length - 2} intermediate waypoints, indicating obstacle avoidance.`);
        }
        
    } else {
        console.error("❌ NO PATH FOUND AT ALL!");
        console.log("This suggests a more serious pathfinding failure.");
    }
    
}).catch(error => {
    console.error("💥 PATHFINDING ERROR:", error);
    window.routinglib.disableDebug();
});

console.log("\n💡 WHAT TO LOOK FOR:");
console.log("1. Collision detection messages - do they show walls being detected?");
console.log("2. 'BLOCKED' vs 'ALLOWED' messages - are movements being blocked?");
console.log("3. Coordinate mismatches - are pixel/grid conversions correct?");
console.log("4. Wall intersection details - are walls actually intersecting the path?");
console.log("\n🎨 VISUAL: Red line = direct path (problem), Green line = pathfound (good)");