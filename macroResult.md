VM1987:8 🔍 FOCUSED PATHFINDING DEBUG
VM1987:9 ============================
foundry.mjs:114954  Please select a token first! 
#fetch @ foundry.mjs:114954
notify @ foundry.mjs:114813
warn @ foundry.mjs:114840
eval @ VM1987:14
#executeScript @ foundry.mjs:45459
execute @ foundry.mjs:45401
#onExecute @ foundry.mjs:114256
#onClickAction @ foundry.mjs:28132
#onClick @ foundry.mjs:28085
main.js:353 [routing-token] Token Aaliyah Johnson selected for pathfinding
VM2000:8 🔍 FOCUSED PATHFINDING DEBUG
VM2000:9 ============================
VM2000:18 🎯 Token: Aaliyah Johnson
VM2000:19 📍 Position: (11568, 24902)
VM2000:20 📏 Size: 1x1
cache.js:121 [RoutingLib] Pixel (11568, 24902) → Grid (77, 166)
VM2000:38 
📐 COORDINATE CONVERSION COMPARISON:
VM2000:39 Pixel position: (11568, 24902)
VM2000:40 Simple division: (77, 166)
VM2000:41 v13 getOffset(): (24902, 11568)
VM2000:42 Routinglib conversion: (77, 166)
VM2000:47 All methods give same result: false
VM2000:50  ⚠️ COORDINATE CONVERSION MISMATCH DETECTED!
eval @ VM2000:50
#executeScript @ foundry.mjs:45459
execute @ foundry.mjs:45401
#onExecute @ foundry.mjs:114256
#onClickAction @ foundry.mjs:28132
#onClick @ foundry.mjs:28085
VM2000:51 This could explain why pathfinding isn't working properly.
VM2000:58 
🎯 TEST PATH:
VM2000:59 From: (77, 166)
VM2000:60 To:   (87, 166)
cache.js:130 [RoutingLib] Grid (77, 165) → Pixel (11625, 24825)
cache.js:130 [RoutingLib] Grid (77, 166) → Pixel (11625, 24975)
cache.js:130 [RoutingLib] Grid (77, 167) → Pixel (11625, 25125)
cache.js:130 [RoutingLib] Grid (78, 165) → Pixel (11775, 24825)
cache.js:130 [RoutingLib] Grid (78, 166) → Pixel (11775, 24975)
cache.js:130 [RoutingLib] Grid (78, 167) → Pixel (11775, 25125)
cache.js:130 [RoutingLib] Grid (79, 165) → Pixel (11925, 24825)
cache.js:130 [RoutingLib] Grid (79, 166) → Pixel (11925, 24975)
cache.js:130 [RoutingLib] Grid (79, 167) → Pixel (11925, 25125)
cache.js:130 [RoutingLib] Grid (80, 165) → Pixel (12075, 24825)
cache.js:130 [RoutingLib] Grid (80, 166) → Pixel (12075, 24975)
cache.js:130 [RoutingLib] Grid (80, 167) → Pixel (12075, 25125)
cache.js:130 [RoutingLib] Grid (81, 165) → Pixel (12225, 24825)
cache.js:130 [RoutingLib] Grid (81, 166) → Pixel (12225, 24975)
cache.js:130 [RoutingLib] Grid (81, 167) → Pixel (12225, 25125)
cache.js:130 [RoutingLib] Grid (82, 165) → Pixel (12375, 24825)
cache.js:130 [RoutingLib] Grid (82, 166) → Pixel (12375, 24975)
cache.js:130 [RoutingLib] Grid (82, 167) → Pixel (12375, 25125)
cache.js:130 [RoutingLib] Grid (83, 165) → Pixel (12525, 24825)
cache.js:130 [RoutingLib] Grid (83, 166) → Pixel (12525, 24975)
cache.js:130 [RoutingLib] Grid (83, 167) → Pixel (12525, 25125)
cache.js:130 [RoutingLib] Grid (84, 165) → Pixel (12675, 24825)
cache.js:130 [RoutingLib] Grid (84, 166) → Pixel (12675, 24975)
cache.js:130 [RoutingLib] Grid (84, 167) → Pixel (12675, 25125)
cache.js:130 [RoutingLib] Grid (85, 165) → Pixel (12825, 24825)
cache.js:130 [RoutingLib] Grid (85, 166) → Pixel (12825, 24975)
cache.js:130 [RoutingLib] Grid (85, 167) → Pixel (12825, 25125)
cache.js:130 [RoutingLib] Grid (86, 165) → Pixel (12975, 24825)
cache.js:130 [RoutingLib] Grid (86, 166) → Pixel (12975, 24975)
cache.js:130 [RoutingLib] Grid (86, 167) → Pixel (12975, 25125)
cache.js:130 [RoutingLib] Grid (87, 165) → Pixel (13125, 24825)
cache.js:130 [RoutingLib] Grid (87, 166) → Pixel (13125, 24975)
cache.js:130 [RoutingLib] Grid (87, 167) → Pixel (13125, 25125)
VM2000:92 
🧱 WALLS DETECTED IN PATH AREA:
VM2000:97 Found 33 grid positions with walls:
VM2000:99   Grid (77, 165) has 201 nearby walls
VM2000:99   Grid (77, 166) has 237 nearby walls
VM2000:99   Grid (77, 167) has 232 nearby walls
VM2000:99   Grid (78, 165) has 240 nearby walls
VM2000:99   Grid (78, 166) has 276 nearby walls
VM2000:104 
🐛 ENABLING DEBUG FOR SPECIFIC POSITIONS...
cache.js:46 [RoutingLib] Debug enabled for positions: (4) [{…}, {…}, {…}, {…}]
cache.js:47 [RoutingLib] Debug options: {verboseCollision: true, wallIntersections: true, squeezing: false, summaryOnly: false, blockedMovements: true, …}
VM2000:122 Debug enabled for positions: (4) [{…}, {…}, {…}, {…}]
VM2000:125 
🚀 TESTING PATHFINDING...
VM2000:196 
💡 WHAT TO WATCH FOR:
VM2000:197 1. Are coordinate conversions consistent?
VM2000:198 2. Are walls detected in the path area?
VM2000:199 3. Do collision detection messages show 'BLOCKED' movements?
VM2000:200 4. Red line = direct path (problem), Green = pathfinding worked
VM2000:201 
⏳ Results will appear above in 2-3 seconds...
VM2000:131 
📊 PATHFINDING RESULT:
VM2000:134 ✅ Path found with 2 waypoints:
VM2000:137   1: Grid (77, 166)
VM2000:137   2: Grid (87, 166)
VM2000:142 
❌ DIRECT PATH - NO OBSTACLES DETECTED
VM2000:143 DIAGNOSIS:
VM2000:149   → Walls exist but collision detection isn't working
VM2000:150   → Check collision detection debug messages above
VM2000:151   → Possible coordinate system or API mismatch
cache.js:130 [RoutingLib] Grid (77, 166) → Pixel (11625, 24975)
cache.js:130 [RoutingLib] Grid (87, 166) → Pixel (13125, 24975)
