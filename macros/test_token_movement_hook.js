/**
 * Test Token Movement Hook
 * Check if routing-token is actually intercepting token movement
 */

console.log("🎯 TOKEN MOVEMENT HOOK TEST");
console.log("===========================");

// Get selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn("Please select a token first!");
    return;
}

console.log(`🎯 Test Token: ${selectedToken.name}`);
console.log(`📍 Current Position: (${selectedToken.x}, ${selectedToken.y})`);

// Enable routing-token debug mode
game.settings.set("routing-token", "debugMode", true);
console.log("🐛 Enabled routing-token debug mode");

// Test manual token movement to see if hook is triggered
console.log("\n📋 MOVEMENT TEST:");
console.log("1. I will now move your token programmatically");
console.log("2. Watch for [routing-token] debug messages");
console.log("3. This will test if the preUpdateToken hook is working");

// Calculate a target position (move token 300 pixels right)
const currentPos = { x: selectedToken.x, y: selectedToken.y };
const targetPos = { x: currentPos.x + 300, y: currentPos.y };

console.log(`\n🚀 Moving token from (${currentPos.x}, ${currentPos.y}) to (${targetPos.x}, ${targetPos.y})`);
console.log("Watch console for routing-token messages...");

// Hook into preUpdateToken temporarily to monitor
const hookId = Hooks.on("preUpdateToken", (tokenDoc, change, options, userId) => {
    if (tokenDoc.id === selectedToken.id) {
        console.log(`🔗 preUpdateToken hook triggered for ${tokenDoc.name}`);
        console.log(`  Change:`, change);
        console.log(`  UserId: ${userId}, Current User: ${game.user.id}`);
        console.log(`  Match: ${userId === game.user.id ? 'YES' : 'NO'}`);
    }
});

// Perform the movement
setTimeout(async () => {
    try {
        console.log("⏳ Executing token movement...");
        await selectedToken.document.update({
            x: targetPos.x,
            y: targetPos.y
        });
        console.log("✅ Token movement completed");
        
        // Check if token actually moved
        const newPos = { x: selectedToken.x, y: selectedToken.y };
        console.log(`📍 New position: (${newPos.x}, ${newPos.y})`);
        
        if (newPos.x === targetPos.x && newPos.y === targetPos.y) {
            console.log("✅ Token moved to target position");
        } else {
            console.log("⚠️ Token did not reach target position");
        }
        
    } catch (error) {
        console.error("❌ Movement failed:", error);
    }
    
    // Clean up
    setTimeout(() => {
        Hooks.off("preUpdateToken", hookId);
        game.settings.set("routing-token", "debugMode", false);
        console.log("🔧 Cleanup completed - debug mode restored");
    }, 2000);
}, 1000);

console.log("\n💡 What to expect:");
console.log("- You should see 'preUpdateToken hook triggered' message");
console.log("- You should see [routing-token] debug messages if the module is working");
console.log("- The token should move and potentially show path visualization");
console.log("- If no [routing-token] messages appear, the integration isn't working");