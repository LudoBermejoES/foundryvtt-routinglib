/**
 * Test Automatic Pathfinding
 * Tests the new auto-follow path functionality in routing-token
 */

console.log("🤖 AUTOMATIC PATHFINDING TEST");
console.log("==============================");

// Get selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn("Please select a token first!");
    return;
}

console.log(`🎯 Test Token: ${selectedToken.name}`);
console.log(`📍 Current Position: (${selectedToken.x}, ${selectedToken.y})`);

// Check if routing-token is available and configured
const routingTokenModule = game.modules.get("routing-token");
if (!routingTokenModule?.active) {
    console.error("❌ routing-token module is not active!");
    return;
}

// Enable auto-follow path setting
const autoFollowEnabled = game.settings.get("routing-token", "autoFollowPath");
console.log(`🔄 Auto-Follow Path: ${autoFollowEnabled ? 'ENABLED' : 'DISABLED'}`);

if (!autoFollowEnabled) {
    console.log("🔧 Enabling auto-follow path setting...");
    game.settings.set("routing-token", "autoFollowPath", true);
}

// Enable debug mode for testing
const debugMode = game.settings.get("routing-token", "debugMode");
if (!debugMode) {
    console.log("🐛 Enabling debug mode...");
    game.settings.set("routing-token", "debugMode", true);
}

console.log("\n📋 TEST SCENARIOS:");
console.log("1. Test movement that requires pathfinding around obstacles");
console.log("2. Test direct movement (no obstacles)");
console.log("3. Test blocked movement (no valid path)");

// Test 1: Movement around obstacles
console.log("\n🧪 TEST 1: Movement Around Obstacles");
console.log("=====================================");

const currentPos = { x: selectedToken.x, y: selectedToken.y };

// Calculate a position that likely requires pathfinding (far to the right)
const testTargetFar = { 
    x: currentPos.x + 750,  // 5 grid squares away (150px per square)
    y: currentPos.y 
};

console.log(`Moving token from (${currentPos.x}, ${currentPos.y}) to (${testTargetFar.x}, ${testTargetFar.y})`);
console.log("🔍 Watch for:");
console.log("- [routing-token] debug messages showing path calculation");
console.log("- Token moving in steps rather than directly");
console.log("- Path visualization showing the route");

// Hook to monitor token updates
let moveCount = 0;
const testHookId = Hooks.on("updateToken", (tokenDoc, change, options, userId) => {
    if (tokenDoc.id === selectedToken.id && (change.x !== undefined || change.y !== undefined)) {
        moveCount++;
        const newPos = { 
            x: change.x !== undefined ? change.x : tokenDoc.x, 
            y: change.y !== undefined ? change.y : tokenDoc.y 
        };
        console.log(`📍 Move ${moveCount}: Token moved to (${newPos.x}, ${newPos.y})`);
        
        // Check if we've reached the final destination
        const distance = Math.sqrt(
            Math.pow(newPos.x - testTargetFar.x, 2) + 
            Math.pow(newPos.y - testTargetFar.y, 2)
        );
        
        if (distance < 10) {
            console.log(`✅ Final destination reached in ${moveCount} moves!`);
            Hooks.off("updateToken", testHookId);
            
            // Test cleanup
            setTimeout(() => {
                if (!debugMode) {
                    game.settings.set("routing-token", "debugMode", false);
                }
                console.log("🧹 Test completed - settings restored");
            }, 3000);
        }
    }
});

// Perform the test movement
setTimeout(async () => {
    try {
        console.log("🚀 Executing pathfinding test movement...");
        await selectedToken.document.update({
            x: testTargetFar.x,
            y: testTargetFar.y
        });
        
        // Timeout check in case pathfinding doesn't work
        setTimeout(() => {
            if (moveCount === 0) {
                console.warn("⚠️ No intermediate moves detected - pathfinding may not be working");
                Hooks.off("updateToken", testHookId);
            } else if (moveCount === 1) {
                console.log("ℹ️ Single move detected - either direct path or pathfinding didn't trigger");
            }
        }, 2000);
        
    } catch (error) {
        console.error("❌ Test movement failed:", error);
        Hooks.off("updateToken", testHookId);
    }
}, 1000);

console.log("\n💡 EXPECTED BEHAVIOR:");
console.log("✅ With auto-pathfinding ENABLED:");
console.log("  - Multiple move events as token follows waypoints");
console.log("  - Path visualization showing route around obstacles");  
console.log("  - Debug messages showing path calculation and redirection");
console.log("");
console.log("❌ Without auto-pathfinding:");
console.log("  - Single move event (direct movement)");
console.log("  - Token may be blocked by walls");
console.log("  - Only path visualization, no movement redirection");

console.log("\n⏳ Test starting in 1 second... Watch the console and canvas!");