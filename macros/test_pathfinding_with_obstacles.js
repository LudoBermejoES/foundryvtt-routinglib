/**
 * Test Pathfinding With Known Obstacles
 * Creates a scenario where pathfinding is definitely needed
 */

console.log("🚧 PATHFINDING WITH OBSTACLES TEST");
console.log("===================================");

// Get selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn("Please select a token first!");
    return;
}

console.log(`🎯 Test Token: ${selectedToken.name}`);
console.log(`📍 Current Position: (${selectedToken.x}, ${selectedToken.y})`);

// Enable debug mode and auto-follow
game.settings.set("routing-token", "debugMode", true);
game.settings.set("routing-token", "autoFollowPath", true);

console.log("🐛 Debug mode enabled");
console.log("🔄 Auto-follow path enabled");

// First, let's test the pathfinding calculation directly
const currentPos = { x: selectedToken.x, y: selectedToken.y };

// Test multiple distances to find one that requires pathfinding
const testDistances = [300, 600, 900, 1200, 1500]; // Different distances to try
let testIndex = 0;

async function testPathfindingDistance() {
    if (testIndex >= testDistances.length) {
        console.log("❌ No pathfinding required for any test distance");
        console.log("💡 Try positioning the token in a more complex area with walls");
        return;
    }
    
    const distance = testDistances[testIndex];
    const targetPos = {
        x: currentPos.x + distance,
        y: currentPos.y
    };
    
    console.log(`\n🧪 TEST ${testIndex + 1}: Distance ${distance}px`);
    console.log(`From: (${currentPos.x}, ${currentPos.y})`);
    console.log(`To: (${targetPos.x}, ${targetPos.y})`);
    
    // Test pathfinding calculation directly
    try {
        const gridFrom = window.routinglib.pixelToGrid(currentPos.x, currentPos.y);
        const gridTo = window.routinglib.pixelToGrid(targetPos.x, targetPos.y);
        
        console.log(`Grid from: (${gridFrom.x}, ${gridFrom.y})`);
        console.log(`Grid to: (${gridTo.x}, ${gridTo.y})`);
        
        const result = await window.routinglib.calculatePath(gridFrom, gridTo, {
            token: selectedToken,
            maxDistance: 2000
        });
        
        if (result && result.path) {
            console.log(`📊 Path calculated: ${result.path.length} waypoints`);
            
            if (result.path.length > 2) {
                console.log("✅ PATHFINDING REQUIRED! Testing automatic movement...");
                
                // Show the calculated path
                result.path.forEach((point, i) => {
                    console.log(`  ${i + 1}: Grid (${point.x}, ${point.y})`);
                });
                
                // Test the actual movement
                await testMovementWithObstacles(targetPos, result.path.length);
                return;
                
            } else {
                console.log("ℹ️ Direct path available, trying next distance...");
                testIndex++;
                setTimeout(testPathfindingDistance, 1000);
            }
        } else {
            console.log("❌ No path found, trying next distance...");
            testIndex++;
            setTimeout(testPathfindingDistance, 1000);
        }
        
    } catch (error) {
        console.error("💥 Pathfinding calculation error:", error);
        testIndex++;
        setTimeout(testPathfindingDistance, 1000);
    }
}

async function testMovementWithObstacles(targetPos, expectedWaypoints) {
    console.log("\n🚀 TESTING AUTOMATIC MOVEMENT");
    console.log("==============================");
    
    let moveCount = 0;
    const moves = [];
    
    // Hook to monitor all token movements
    const moveHookId = Hooks.on("preUpdateToken", (tokenDoc, change, options, userId) => {
        if (tokenDoc.id === selectedToken.id && (change.x !== undefined || change.y !== undefined)) {
            moveCount++;
            const movePos = {
                x: change.x !== undefined ? change.x : tokenDoc.x,
                y: change.y !== undefined ? change.y : tokenDoc.y
            };
            moves.push(movePos);
            console.log(`📍 Move ${moveCount}: Redirected to (${movePos.x}, ${movePos.y})`);
        }
    });
    
    // Monitor completed movements
    const updateHookId = Hooks.on("updateToken", (tokenDoc, change, options, userId) => {
        if (tokenDoc.id === selectedToken.id && (change.x !== undefined || change.y !== undefined)) {
            const finalPos = {
                x: change.x !== undefined ? change.x : tokenDoc.x,
                y: change.y !== undefined ? change.y : tokenDoc.y
            };
            console.log(`✅ Move completed: Token at (${finalPos.x}, ${finalPos.y})`);
            
            // Check if we've reached the target
            const distance = Math.sqrt(
                Math.pow(finalPos.x - targetPos.x, 2) + 
                Math.pow(finalPos.y - targetPos.y, 2)
            );
            
            if (distance < 50) {
                console.log(`🎉 TARGET REACHED in ${moveCount} moves!`);
                Hooks.off("preUpdateToken", moveHookId);
                Hooks.off("updateToken", updateHookId);
                
                console.log("\n📊 MOVEMENT ANALYSIS:");
                console.log(`Expected waypoints: ${expectedWaypoints}`);
                console.log(`Actual moves: ${moveCount}`);
                
                if (moveCount > 1) {
                    console.log("✅ SUCCESS: Multi-step pathfinding worked!");
                    console.log("The token followed waypoints instead of moving directly.");
                } else if (moveCount === 1) {
                    console.log("ℹ️ Single move: Either direct path or pathfinding didn't activate");
                } else {
                    console.log("❌ No moves detected");
                }
            }
        }
    });
    
    // Execute the movement
    setTimeout(async () => {
        try {
            console.log(`🎯 Executing movement to (${targetPos.x}, ${targetPos.y})...`);
            await selectedToken.document.update({
                x: targetPos.x,
                y: targetPos.y
            });
            
            // Timeout check
            setTimeout(() => {
                if (moveCount === 0) {
                    console.warn("⚠️ No movements detected after 3 seconds");
                    Hooks.off("preUpdateToken", moveHookId);
                    Hooks.off("updateToken", updateHookId);
                }
            }, 3000);
            
        } catch (error) {
            console.error("❌ Movement execution failed:", error);
            Hooks.off("preUpdateToken", moveHookId);
            Hooks.off("updateToken", updateHookId);
        }
    }, 500);
}

// Start the test
console.log("\n🔄 Starting pathfinding obstacle test...");
console.log("This will test different distances to find one requiring pathfinding");
testPathfindingDistance();