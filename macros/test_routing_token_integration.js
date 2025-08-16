/**
 * Test Routing-Token Integration 
 * Checks if routing-token module is properly integrated with routinglib
 */

console.log("🔍 ROUTING-TOKEN INTEGRATION TEST");
console.log("==================================");

// Check if routing-token module is loaded and active
const routingTokenModule = game.modules.get("routing-token");
console.log(`📦 Routing-Token Module: ${routingTokenModule ? 'Found' : 'NOT FOUND'}`);
console.log(`🔋 Routing-Token Active: ${routingTokenModule?.active ? 'YES' : 'NO'}`);

if (!routingTokenModule?.active) {
    console.error("❌ PROBLEM: routing-token module is not active!");
    console.log("💡 Solution: Enable the routing-token module in FoundryVTT's module management");
    return;
}

// Check if routinglib is available
console.log(`🔗 RoutingLib Available: ${window.routinglib ? 'YES' : 'NO'}`);

if (!window.routinglib) {
    console.error("❌ PROBLEM: routinglib is not available!");
    console.log("💡 Solution: Make sure routinglib module is active and loaded");
    return;
}

// Check routing-token settings
const pathfindingEnabled = game.settings.get("routing-token", "enablePathfinding");
const debugMode = game.settings.get("routing-token", "debugMode");
const visualizePath = game.settings.get("routing-token", "visualizePath");
const maxDistance = game.settings.get("routing-token", "maxPathDistance");

console.log("\n⚙️ ROUTING-TOKEN SETTINGS:");
console.log(`  Pathfinding Enabled: ${pathfindingEnabled}`);
console.log(`  Debug Mode: ${debugMode}`);
console.log(`  Visualize Path: ${visualizePath}`);
console.log(`  Max Distance: ${maxDistance}`);

if (!pathfindingEnabled) {
    console.warn("⚠️ WARNING: Pathfinding is disabled in routing-token settings!");
    console.log("💡 Solution: Enable pathfinding in the routing-token module settings");
}

// Check for selected token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    console.warn("⚠️ WARNING: No token selected for testing");
    console.log("💡 Please select a token and run this test again");
    return;
}

console.log(`\n🎯 Test Token: ${selectedToken.name}`);
console.log(`📍 Current Position: (${selectedToken.x}, ${selectedToken.y})`);

// Test coordinate conversion consistency
const tokenPos = { x: selectedToken.x, y: selectedToken.y };

// Get routing-token's conversion
const smartRouting = routingTokenModule.smartRouting;
if (smartRouting) {
    const rtGridPos = smartRouting.pixelsToGridPosition(tokenPos);
    const rtPixelPos = smartRouting.gridToPixelPosition(rtGridPos);
    
    // Get routinglib's conversion  
    const rlGridPos = window.routinglib.pixelToGrid(tokenPos.x, tokenPos.y);
    const rlPixelPos = window.routinglib.gridToPixel(rlGridPos.x, rlGridPos.y);
    
    console.log("\n📐 COORDINATE CONVERSION TEST:");
    console.log(`Original Pixel: (${tokenPos.x}, ${tokenPos.y})`);
    console.log(`Routing-Token Grid: (${rtGridPos.x}, ${rtGridPos.y})`);
    console.log(`RoutingLib Grid: (${rlGridPos.x}, ${rlGridPos.y})`);
    console.log(`Routing-Token Back to Pixel: (${rtPixelPos.x}, ${rtPixelPos.y})`);
    console.log(`RoutingLib Back to Pixel: (${rlPixelPos.x}, ${rlPixelPos.y})`);
    
    const coordsMatch = (rtGridPos.x === rlGridPos.x && rtGridPos.y === rlGridPos.y);
    console.log(`Coordinate Conversion Match: ${coordsMatch ? '✅ YES' : '❌ NO'}`);
    
    if (!coordsMatch) {
        console.error("❌ COORDINATE MISMATCH DETECTED!");
        console.log("This could cause pathfinding issues between routing-token and routinglib");
    }
} else {
    console.error("❌ PROBLEM: Cannot access routing-token's SmartRouting instance");
}

// Enable debug mode temporarily for testing
if (!debugMode) {
    console.log("\n🐛 Enabling debug mode temporarily...");
    game.settings.set("routing-token", "debugMode", true);
}

// Instructions for manual testing
console.log("\n📋 MANUAL TEST INSTRUCTIONS:");
console.log("1. Make sure the selected token has walls around it");
console.log("2. Try to drag the token to a position that requires going around walls");
console.log("3. Watch the console for debug messages from routing-token");
console.log("4. You should see path visualization if visualizePath is enabled");
console.log("5. Check if the token follows the calculated path or goes directly");

console.log("\n🔍 THINGS TO LOOK FOR:");
console.log("- Console messages starting with '[routing-token]'");
console.log("- Path visualization lines on the canvas (orange/green lines)");
console.log("- Whether token movement respects walls");

// Test API availability
console.log("\n🔌 API TEST:");
const api = window.SmartTokenRouting?.api;
if (api) {
    console.log(`✅ SmartTokenRouting API available`);
    console.log(`  Available: ${api.isAvailable()}`);
    console.log(`  Version: ${api.getVersion()}`);
} else {
    console.warn("⚠️ SmartTokenRouting API not found");
}

console.log("\n💡 DIAGNOSTIC SUMMARY:");
console.log("- If you see routing-token debug messages when moving tokens, the integration is working");
console.log("- If tokens still go directly through walls, check the pathfinding calculation results");
console.log("- Make sure both modules are using the same coordinate system (should be identical now)");

// Restore debug mode setting
setTimeout(() => {
    if (!debugMode) {
        game.settings.set("routing-token", "debugMode", false);
        console.log("🔧 Debug mode restored to original setting");
    }
}, 5000);