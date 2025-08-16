/**
 * Debug Wall Pathfinding Issues
 * This macro helps diagnose why routinglib is not finding paths around walls
 * 
 * Usage:
 * 1. Select a token
 * 2. Run this macro
 * 3. Click two points on the map to test pathfinding between them
 * 4. Check console for detailed debugging information
 */

// Step 1: Analyze walls in the current scene
console.log("🔍 ROUTINGLIB PATHFINDING DIAGNOSTICS");
console.log("=====================================");

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

console.log(`📍 Selected token: ${selectedToken.name} at (${selectedToken.x}, ${selectedToken.y})`);
console.log(`📏 Token size: ${selectedToken.document.width}x${selectedToken.document.height}`);

// Step 2: Analyze all walls
console.log("\n🧱 ANALYZING WALLS IN SCENE");
const walls = window.routinglib.analyzeWalls();

// Step 3: Enable debugging for pathfinding
console.log("\n🐛 ENABLING PATHFINDING DEBUG MODE");

// Enable comprehensive debugging - this will show all collision detection
window.routinglib.enableDebugForPositions([], {
    verboseCollision: false,      // Too noisy, but can be enabled if needed
    wallIntersections: true,      // Show wall intersection details
    squeezing: true,             // Show creature size movement rules
    graphConstruction: false,    // Graph building (noisy)
    summaryOnly: false,          // Show detailed results
    blockedMovements: true,      // Always show blocked movements
    allowedMovements: false      // Show allowed movements (can be noisy)
});

// Step 4: Set up interactive pathfinding test
let clickCount = 0;
let startPoint = null;
let endPoint = null;

function onCanvasClick(event) {
    const pos = event.interactionData.getLocalPosition(canvas.tokens);
    
    if (clickCount === 0) {
        startPoint = {x: pos.x, y: pos.y};
        clickCount++;
        
        // Convert to grid coordinates for display
        const gridStart = window.routinglib.pixelToGrid(pos.x, pos.y);
        console.log(`\n🎯 START POINT: Pixel (${Math.round(pos.x)}, ${Math.round(pos.y)}) = Grid (${gridStart.x}, ${gridStart.y})`);
        ui.notifications.info(`Start point set at (${gridStart.x}, ${gridStart.y}). Click destination point.`);
        
        // Draw start point marker
        const startMarker = new PIXI.Graphics();
        startMarker.beginFill(0x00ff00, 0.8);
        startMarker.drawCircle(pos.x, pos.y, 10);
        startMarker.endFill();
        startMarker.name = "pathfinding-start";
        canvas.stage.addChild(startMarker);
        
    } else if (clickCount === 1) {
        endPoint = {x: pos.x, y: pos.y};
        clickCount++;
        
        // Convert to grid coordinates for display
        const gridEnd = window.routinglib.pixelToGrid(pos.x, pos.y);
        const gridStart = window.routinglib.pixelToGrid(startPoint.x, startPoint.y);
        
        console.log(`🎯 END POINT: Pixel (${Math.round(pos.x)}, ${Math.round(pos.y)}) = Grid (${gridEnd.x}, ${gridEnd.y})`);
        ui.notifications.info(`End point set at (${gridEnd.x}, ${gridEnd.y}). Testing pathfinding...`);
        
        // Draw end point marker
        const endMarker = new PIXI.Graphics();
        endMarker.beginFill(0xff0000, 0.8);
        endMarker.drawCircle(pos.x, pos.y, 10);
        endMarker.endFill();
        endMarker.name = "pathfinding-end";
        canvas.stage.addChild(endMarker);
        
        // Draw direct line
        const directLine = new PIXI.Graphics();
        directLine.lineStyle(2, 0xff0000, 0.5);
        directLine.moveTo(startPoint.x, startPoint.y);
        directLine.lineTo(endPoint.x, endPoint.y);
        directLine.name = "pathfinding-direct";
        canvas.stage.addChild(directLine);
        
        // Step 5: Test pathfinding
        testPathfinding(gridStart, gridEnd);
        
        // Cleanup click handler
        canvas.stage.off('pointerdown', onCanvasClick);
    }
}

async function testPathfinding(gridStart, gridEnd) {
    console.log(`\n🧮 TESTING PATHFINDING: (${gridStart.x}, ${gridStart.y}) → (${gridEnd.x}, ${gridEnd.y})`);
    console.log("===============================================================");
    
    // Find walls in the path area
    const minX = Math.min(gridStart.x, gridEnd.x) - 2;
    const maxX = Math.max(gridStart.x, gridEnd.x) + 2;
    const minY = Math.min(gridStart.y, gridEnd.y) - 2;
    const maxY = Math.max(gridStart.y, gridEnd.y) + 2;
    
    console.log(`🔍 Checking walls in area: (${minX}, ${minY}) to (${maxX}, ${maxY})`);
    const wallsInArea = window.routinglib.findWallsInArea(minX, minY, maxX, maxY);
    
    try {
        console.log("\n🚀 STARTING PATHFINDING CALCULATION...");
        
        const result = await window.routinglib.calculatePath(gridStart, gridEnd, {
            token: selectedToken,
            maxDistance: 1000
        });
        
        console.log("\n✅ PATHFINDING RESULT:");
        if (result && result.path && result.path.length > 0) {
            console.log(`✅ Path found with ${result.path.length} waypoints:`);
            result.path.forEach((point, i) => {
                const pixelPoint = window.routinglib.gridToPixel(point.x, point.y);
                console.log(`   ${i}: Grid (${point.x}, ${point.y}) = Pixel (${Math.round(pixelPoint.x)}, ${Math.round(pixelPoint.y)})`);
            });
            
            // Draw the calculated path
            drawCalculatedPath(result.path);
            ui.notifications.info(`✅ Path found with ${result.path.length} waypoints! Check console for details.`);
        } else {
            console.log("❌ No path found!");
            console.log("📊 DEBUGGING SUGGESTIONS:");
            console.log("   1. Check if walls are properly configured to block movement");
            console.log("   2. Verify token size and wall placement");
            console.log("   3. Look for wall intersection issues in the debug output above");
            console.log("   4. Try a shorter path or different route");
            
            ui.notifications.error("❌ No path found! Check console for debugging information.");
        }
    } catch (error) {
        console.error("💥 PATHFINDING ERROR:", error);
        ui.notifications.error(`Pathfinding error: ${error.message}`);
    }
    
    // Clean up markers after 30 seconds
    setTimeout(() => {
        cleanupMarkers();
    }, 30000);
}

function drawCalculatedPath(path) {
    if (!path || path.length < 2) return;
    
    const pathGraphics = new PIXI.Graphics();
    pathGraphics.lineStyle(4, 0x00ff00, 0.8);
    pathGraphics.name = "pathfinding-result";
    
    // Convert first point and move to it
    const firstPixel = window.routinglib.gridToPixel(path[0].x, path[0].y);
    pathGraphics.moveTo(firstPixel.x, firstPixel.y);
    
    // Draw lines to each subsequent point
    for (let i = 1; i < path.length; i++) {
        const pixelPoint = window.routinglib.gridToPixel(path[i].x, path[i].y);
        pathGraphics.lineTo(pixelPoint.x, pixelPoint.y);
    }
    
    // Add waypoint markers
    path.forEach((point, index) => {
        const pixelPoint = window.routinglib.gridToPixel(point.x, point.y);
        const isStart = index === 0;
        const isEnd = index === path.length - 1;
        
        pathGraphics.beginFill(isStart ? 0x00ff00 : (isEnd ? 0xff0000 : 0xffff00), 0.9);
        pathGraphics.drawCircle(pixelPoint.x, pixelPoint.y, isStart || isEnd ? 8 : 5);
        pathGraphics.endFill();
    });
    
    canvas.stage.addChild(pathGraphics);
}

function cleanupMarkers() {
    // Remove all pathfinding debug markers
    const markersToRemove = [
        "pathfinding-start",
        "pathfinding-end", 
        "pathfinding-direct",
        "pathfinding-result"
    ];
    
    markersToRemove.forEach(name => {
        const marker = canvas.stage.getChildByName(name);
        if (marker) {
            canvas.stage.removeChild(marker);
            marker.destroy();
        }
    });
    
    console.log("🧹 Debug markers cleaned up");
}

// Step 6: Start interactive testing
console.log("\n🎮 INTERACTIVE PATHFINDING TEST");
console.log("Click on the canvas to set start point, then click again to set destination.");
console.log("Pathfinding debugging is now enabled - all collision detection will be logged.");

ui.notifications.info("Pathfinding debug mode enabled! Click start point on canvas.");

// Add click handler
canvas.stage.on('pointerdown', onCanvasClick);

// Provide cleanup function
window.cleanupPathfindingDebug = function() {
    canvas.stage.off('pointerdown', onCanvasClick);
    cleanupMarkers();
    window.routinglib.disableDebug();
    console.log("🔧 Pathfinding debug mode disabled");
    ui.notifications.info("Pathfinding debug mode disabled");
};

console.log("\n💡 TIP: Run 'window.cleanupPathfindingDebug()' to disable debug mode and clean up markers");