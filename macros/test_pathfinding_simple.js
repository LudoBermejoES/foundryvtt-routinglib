/**
 * Simple Pathfinding Test
 * Quick test to see if routinglib can detect walls and calculate paths
 */

console.log("🔍 SIMPLE PATHFINDING TEST");
console.log("==========================");

// Check if routinglib is available
if (!window.routinglib) {
    ui.notifications.error("Routinglib is not available!");
    return;
}

// Get selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn("Please select a token first!");
    return;
}

console.log(`🎯 Testing token: ${selectedToken.name}`);
console.log(`📍 Token position: (${selectedToken.x}, ${selectedToken.y})`);
console.log(`📏 Token size: ${selectedToken.document.width}x${selectedToken.document.height}`);

// Step 1: Check walls
const wallCount = canvas.walls.placeables.length;
console.log(`🧱 Found ${wallCount} walls in scene`);

if (wallCount === 0) {
    console.warn("⚠️ No walls found - pathfinding will just show direct paths");
    ui.notifications.warn("No walls found in scene!");
}

// Step 2: Check wall configuration
let movementBlockingWalls = 0;
canvas.walls.placeables.forEach(wall => {
    if (wall.document.move === CONST.WALL_MOVEMENT_TYPES.NORMAL) {
        movementBlockingWalls++;
    }
});

console.log(`🚧 Movement-blocking walls: ${movementBlockingWalls}/${wallCount}`);

if (movementBlockingWalls === 0) {
    console.error("❌ NO WALLS BLOCK MOVEMENT!");
    console.log("💡 FIX: Select walls and set 'Wall Movement' to 'Normal' in wall configuration");
    ui.notifications.error("No walls are configured to block movement! Check wall settings.");
    return;
}

// Step 3: Test pathfinding with a simple scenario
console.log("\n🧪 TESTING PATHFINDING...");

// Get token's current grid position
const tokenPixelPos = { x: selectedToken.x, y: selectedToken.y };
const tokenGridPos = window.routinglib.pixelToGrid(tokenPixelPos.x, tokenPixelPos.y);

// Test destination: move token 10 grid squares to the right
const testDestGridPos = {
    x: tokenGridPos.x + 10,
    y: tokenGridPos.y
};
const testDestPixelPos = window.routinglib.gridToPixel(testDestGridPos.x, testDestGridPos.y);

console.log(`📏 Testing path:`);
console.log(`   From: Grid (${tokenGridPos.x}, ${tokenGridPos.y}) = Pixel (${tokenPixelPos.x}, ${tokenPixelPos.y})`);
console.log(`   To:   Grid (${testDestGridPos.x}, ${testDestGridPos.y}) = Pixel (${testDestPixelPos.x}, ${testDestPixelPos.y})`);

// Check if there are walls in the path area
const pathMinX = Math.min(tokenGridPos.x, testDestGridPos.x) - 2;
const pathMaxX = Math.max(tokenGridPos.x, testDestGridPos.x) + 2;
const pathMinY = Math.min(tokenGridPos.y, testDestGridPos.y) - 2;
const pathMaxY = Math.max(tokenGridPos.y, testDestGridPos.y) + 2;

console.log(`🔍 Checking for walls in path area: (${pathMinX}, ${pathMinY}) to (${pathMaxX}, ${pathMaxY})`);
const wallsInPath = window.routinglib.findWallsInArea(pathMinX, pathMinY, pathMaxX, pathMaxY);

if (wallsInPath.length === 0) {
    console.warn("⚠️ No walls found in the test path area - pathfinding will show direct line");
}

// Step 4: Enable debugging for this specific test
window.routinglib.enableDebugForPositions([tokenGridPos, testDestGridPos], {
    blockedMovements: true,
    allowedMovements: true,
    wallIntersections: true,
    squeezing: false,
    summaryOnly: false
});

// Step 5: Run the pathfinding test
console.log("\n🚀 RUNNING PATHFINDING TEST...");

window.routinglib.calculatePath(tokenGridPos, testDestGridPos, {
    token: selectedToken,
    maxDistance: 500
}).then(result => {
    console.log("\n📊 PATHFINDING RESULT:");
    
    if (result && result.path && result.path.length > 0) {
        console.log(`✅ Path found with ${result.path.length} waypoints:`);
        
        result.path.forEach((point, i) => {
            const pixelPoint = window.routinglib.gridToPixel(point.x, point.y);
            console.log(`   ${i + 1}: Grid (${point.x}, ${point.y}) = Pixel (${Math.round(pixelPoint.x)}, ${Math.round(pixelPoint.y)})`);
        });
        
        // Analyze the result
        if (result.path.length === 2) {
            console.warn("⚠️ Only 2 waypoints found - this is likely a DIRECT PATH");
            console.log("💡 This means either:");
            console.log("   - No walls are blocking the path");
            console.log("   - Wall detection is not working properly");
            console.log("   - Walls are not configured to block movement");
        } else {
            console.log("✅ Multiple waypoints found - pathfinding is working!");
        }
        
        // Create simple visualization
        const g = new PIXI.Graphics();
        g.lineStyle(4, result.path.length === 2 ? 0xff0000 : 0x00ff00, 0.8);
        
        const firstPixel = window.routinglib.gridToPixel(result.path[0].x, result.path[0].y);
        g.moveTo(firstPixel.x, firstPixel.y);
        
        for (let i = 1; i < result.path.length; i++) {
            const pixelPoint = window.routinglib.gridToPixel(result.path[i].x, result.path[i].y);
            g.lineTo(pixelPoint.x, pixelPoint.y);
        }
        
        g.name = "pathfinding-test-result";
        canvas.stage.addChild(g);
        
        // Clean up after 10 seconds
        setTimeout(() => {
            const existing = canvas.stage.getChildByName("pathfinding-test-result");
            if (existing) {
                canvas.stage.removeChild(existing);
                existing.destroy();
            }
            window.routinglib.disableDebug();
        }, 10000);
        
        ui.notifications.info(result.path.length === 2 
            ? `⚠️ Direct path found (${result.path.length} waypoints) - check walls!` 
            : `✅ Pathfinding working (${result.path.length} waypoints)!`
        );
        
    } else {
        console.error("❌ NO PATH FOUND!");
        console.log("💡 This could mean:");
        console.log("   - The destination is completely unreachable");
        console.log("   - Routinglib configuration issue");
        console.log("   - Wall height or other advanced settings blocking");
        
        ui.notifications.error("❌ No path found!");
    }
}).catch(error => {
    console.error("💥 PATHFINDING ERROR:", error);
    ui.notifications.error(`Pathfinding error: ${error.message}`);
    window.routinglib.disableDebug();
});

console.log("\n💡 TIPS:");
console.log("- Watch the console for wall collision detection messages");
console.log("- Red line = direct path (no obstacles detected)");
console.log("- Green line = pathfinding worked (obstacles avoided)");
console.log("- Check that walls have 'Wall Movement: Normal' setting");