/**
 * Check Routing-Token Module Status
 * Verifies if the modified routing-token code is loaded
 */

console.log("🔍 ROUTING-TOKEN VERSION CHECK");
console.log("===============================");

// Check if routing-token module is available
const routingTokenModule = game.modules.get("routing-token");
console.log(`📦 Module Found: ${routingTokenModule ? 'YES' : 'NO'}`);
console.log(`🔋 Module Active: ${routingTokenModule?.active ? 'YES' : 'NO'}`);

if (!routingTokenModule?.active) {
    console.error("❌ routing-token module is not active!");
    return;
}

// Check if the SmartRouting instance exists
const smartRouting = routingTokenModule.smartRouting;
console.log(`🤖 SmartRouting Instance: ${smartRouting ? 'EXISTS' : 'MISSING'}`);

if (smartRouting) {
    // Check if new methods exist
    const hasCalculateAndRedirect = typeof smartRouting.calculateAndRedirectMovement === 'function';
    const hasContinueStoredPath = typeof smartRouting.continueStoredPath === 'function';
    const hasStoreRemainingPath = typeof smartRouting.storeRemainingPath === 'function';
    
    console.log(`🔧 New Methods Available:`);
    console.log(`  calculateAndRedirectMovement: ${hasCalculateAndRedirect ? '✅' : '❌'}`);
    console.log(`  continueStoredPath: ${hasContinueStoredPath ? '✅' : '❌'}`);
    console.log(`  storeRemainingPath: ${hasStoreRemainingPath ? '✅' : '❌'}`);
    
    // Check settings
    try {
        const autoFollowPath = game.settings.get("routing-token", "autoFollowPath");
        console.log(`⚙️ autoFollowPath setting: ${autoFollowPath ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
        console.warn(`⚠️ autoFollowPath setting not found:`, error.message);
    }
    
    if (hasCalculateAndRedirect && hasContinueStoredPath && hasStoreRemainingPath) {
        console.log("\n✅ ALL NEW FUNCTIONALITY IS LOADED!");
        console.log("The routing-token modifications are active and ready to use.");
    } else {
        console.log("\n❌ NEW FUNCTIONALITY IS MISSING!");
        console.log("The routing-token module needs to be reloaded for changes to take effect.");
        console.log("\n🔧 SOLUTIONS:");
        console.log("1. Refresh the page (F5) to reload all modules");
        console.log("2. Or disable and re-enable the routing-token module");
        console.log("3. Or restart FoundryVTT");
    }
} else {
    console.error("❌ SmartRouting instance not found!");
    console.log("The routing-token module may not be properly initialized.");
}

console.log("\n📋 Module Information:");
console.log(`Version: ${routingTokenModule?.version || 'Unknown'}`);
console.log(`ID: ${routingTokenModule?.id || 'Unknown'}`);

// Test basic functionality
if (window.routinglib) {
    console.log("🔗 RoutingLib: Available ✅");
} else {
    console.log("🔗 RoutingLib: Missing ❌");
}