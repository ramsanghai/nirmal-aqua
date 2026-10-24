// 52 products. art = [drawerType, ...drawerArgs]. Brand "Nirmal" is a fictional house brand.
const W = '#f4f6f7', K = '#2b2f33', S = '#cdd3d8', CU = '#e9dccb', NAVY = '#27415a';
const BLUE = '#2f7fd6', TEAL = '#25b3a5', AMB = '#E8A33D', VIO = '#8a6fd1';

// [category, id, name, mrp, price, desc, specs[], art[], featured?]
const rows = [
  // ---- Purifiers (12)
  ['Purifiers', 'ro-uv-wall-10l', 'Nirmal Pure RO+UV Wall Mount 10 L', 17990, 13490, 'Seven-stage RO+UV+TDS control purifier for borewell and municipal water. Silent pump and a 10 litre tank.', ['10 L storage', '15 L/hr flow', 'RO + UV + UF', 'Wall mount'], ['wall', W, BLUE, 'RO+UV', 'RO + UV + TDS'], 1],
  ['Purifiers', 'ro-uf-tds-12l', 'Nirmal Pure RO+UF 12 L with TDS Control', 19990, 14990, 'Bigger tank for larger families. Tap-water TDS up to 2000 ppm handled with automatic mineral balance.', ['12 L storage', '18 L/hr flow', 'RO + UF', 'Smart LED'], ['wall', W, TEAL, 'RO+UF', 'RO + UF + TDS'], 1],
  ['Purifiers', 'slim-ro-black-8l', 'Nirmal Slim RO 8 L Matte Black', 15990, 11990, 'Slim 28 cm profile that fits a narrow kitchen wall. Matte finish hides fingerprints.', ['8 L storage', '12 L/hr flow', 'RO + UV', 'Slim body'], ['wall', K, AMB, 'SLIM', 'SLIM RO · MATTE'], 0],
  ['Purifiers', 'copper-ro-9l', 'Nirmal Copper+ RO 9 L', 18490, 13990, 'Copper-infused storage with mineralised output. Auto-flush keeps the membrane fresh.', ['9 L storage', '14 L/hr flow', 'RO + Copper', 'Auto flush'], ['wall', CU, AMB, 'CU+', 'COPPER+ RO'], 0],
  ['Purifiers', 'alkaline-ro-10l', 'Nirmal Alkaline RO 10 L Silver', 20990, 15990, 'Raises pH to 8.5 and adds calcium and magnesium after RO. Suited to hard water.', ['10 L storage', 'pH 8.5 boost', 'RO + Alkaline', 'Steel finish'], ['wall', S, VIO, 'ALK', 'ALKALINE RO'], 1],
  ['Purifiers', 'under-sink-ro-75', 'Nirmal Under-Sink RO 75 GPD', 14990, 10990, 'Fits inside the sink cabinet. Chrome faucet for the counter, 12 L pressurised tank.', ['75 GPD membrane', '12 L pressure tank', 'Under sink', 'Chrome tap'], ['under', W, AMB, 'U75', 'UNDER-SINK RO 75'], 0],
  ['Purifiers', 'under-sink-ro-uv-100', 'Nirmal Under-Sink RO+UV 100 GPD', 17490, 12990, 'Heavier membrane for faster fill and a UV stage for bacteria. For homes with 4+ members.', ['100 GPD membrane', 'UV stage', 'Under sink', 'Auto shutoff'], ['under', W, BLUE, 'U100', 'UNDER-SINK RO+UV 100', true], 0],
  ['Purifiers', 'gravity-uf-18l', 'Nirmal Gravity UF 18 L (No Electricity)', 5990, 3990, 'Works without power or pressure. Ideal for low-TDS municipal supply.', ['18 L capacity', 'No electricity', 'UF + carbon', 'Food-grade ABS'], ['gravity', '#e9f0f4', BLUE, 'GRAVITY', 'GRAVITY UF · 18 L'], 0],
  ['Purifiers', 'gravity-steel-22l', 'Nirmal Gravity Steel 22 L', 7990, 5490, 'Stainless steel body with a see-through top tank. Keeps water cool through summer.', ['22 L capacity', 'SS 304 body', 'UF + silver carbon', 'No power'], ['gravity', '#cfd5da', AMB, 'STEEL', 'GRAVITY STEEL · 22 L', true], 0],
  ['Purifiers', 'countertop-uv-6l', 'Nirmal Countertop UV 6 L', 8990, 6490, 'Sits on the counter with no installation. UV kills 99.99% bacteria in the 6 L jug.', ['6 L storage', 'UV-C stage', 'Counter top', 'No installation'], ['counter', W, BLUE, 'UV', 'COUNTER UV · 6 L'], 0],
  ['Purifiers', 'commercial-ro-25', 'Nirmal Commercial RO 25 LPH', 38990, 29990, 'For shops, clinics and small offices. SS frame, pressure gauges and a 4-membrane set.', ['25 L/hr output', 'SS frame', '4 membranes', 'Gauges fitted'], ['commercial', '#d6dbe0', AMB, 'C25', '25 LPH'], 0],
  ['Purifiers', 'commercial-ro-50', 'Nirmal Commercial RO 50 LPH', 58990, 44990, 'High output plant for restaurants and small institutions. Auto-flush and low-pressure cut-off.', ['50 L/hr output', 'SS frame', 'Auto flush', 'LP cut-off'], ['commercial', '#d6dbe0', BLUE, 'C50', '50 LPH'], 0],

  // ---- Dispensers (8)
  ['Dispensers', 'floor-hot-cold-white', 'Nirmal Floor Hot & Cold Dispenser', 13990, 9990, 'Top-load dispenser with a lower cabinet. Child-safe hot tap, compressor cooling.', ['Hot 90°C', 'Cold 8°C', '20 L bottle', 'Child lock'], ['floor', W, AMB, 'HC', 'HOT · COLD'], 1],
  ['Dispensers', 'floor-hot-normal-cold-black', 'Nirmal Floor Hot, Normal & Cold (Black)', 16990, 12490, 'Three temperatures from one unit. Stainless steel tanks and a drip tray with level float.', ['3 temperature taps', 'SS tanks', '20 L bottle', 'Compressor'], ['floor', K, BLUE, 'HNC', 'HOT · NORMAL · COLD'], 0],
  ['Dispensers', 'bottom-load-silver', 'Nirmal Bottom-Load Hot & Cold Silver', 21990, 16490, 'No lifting heavy bottles — the bottle sits in the base cabinet and a pump lifts the water.', ['Bottom loading', 'Hot & Cold', 'LED level', 'Child lock'], ['floor', S, BLUE, 'BL', 'BOTTOM LOAD', { bottom: true }], 1],
  ['Dispensers', 'bottom-load-cabinet-white', 'Nirmal Bottom-Load with Fridge Cabinet', 25990, 19490, 'Dispenser with a 20 L storage cabinet for fruit and drinks. Stays quiet under 42 dB.', ['Bottom loading', 'Fridge cabinet', 'Hot & Cold', '42 dB'], ['floor', W, TEAL, 'BLC', 'BOTTOM · CABINET', { bottom: true }], 0],
  ['Dispensers', 'table-hot-cold', 'Nirmal Tabletop Hot & Cold', 8990, 6490, 'Compact dispenser for desks and small kitchens. Electronic cooling, no compressor noise.', ['Hot 90°C', 'Cold 10°C', 'Electronic cooling', '20 L bottle'], ['tabletop', W, AMB, 'TH', 'HOT · COLD'], 0],
  ['Dispensers', 'table-normal-cold', 'Nirmal Tabletop Normal & Cold', 7490, 5290, 'Normal and chilled water for offices. Leakproof bottle seat and removable tray.', ['Normal & cold', 'Electronic cooling', '20 L bottle', 'Removable tray'], ['tabletop', '#e9eff3', BLUE, 'TN', 'NORMAL · COLD'], 0],
  ['Dispensers', 'electric-bottle-pump-20l', 'Nirmal Rechargeable 20 L Bottle Pump', 1490, 990, 'USB-rechargeable pump that fits standard 20 L cans. One charge dispenses about 40 bottles.', ['USB charge', 'Fits 20 L cans', '40 cans/charge', 'Food grade'], ['bottlepump', W, AMB], 0],
  ['Dispensers', 'touchless-floor-dispenser', 'Nirmal Touchless Hot & Cold Dispenser', 22990, 17490, 'Infrared sensor dispenses a set quantity without touching the tap. Good for clinics and offices.', ['IR sensor', 'Set quantity', 'Hot & Cold', 'SS tank'], ['floor', W, TEAL, 'TOUCH', 'TOUCHLESS', { sensor: true }], 0],

  // ---- Pumps (8)
  ['Pumps', 'monoblock-05hp', 'Nirmal Monoblock Pump 0.5 HP', 4990, 3590, 'Domestic monoblock pump for overhead tank filling. Copper winding, ISI mark.', ['0.5 HP', '28 m head', 'Copper winding', '1 yr warranty'], ['monoblock', BLUE, AMB, 'MB', '0.5 HP'], 1],
  ['Pumps', 'monoblock-1hp', 'Nirmal Monoblock Pump 1 HP', 6990, 4990, 'More head for 2–3 floor houses. Thermal overload protection built in.', ['1 HP', '42 m head', 'Thermal cut-out', '1 yr warranty'], ['monoblock', '#1f6f5d', AMB, 'MB', '1 HP'], 0],
  ['Pumps', 'self-priming-1hp', 'Nirmal Self-Priming Pump 1 HP', 7990, 5790, 'Primes itself from 7 m suction depth. Cast-iron casing for long life.', ['1 HP', '7 m suction', 'Cast-iron body', 'Self priming'], ['monoblock', '#b2342a', AMB, 'SP', '1 HP'], 0],
  ['Pumps', 'jet-pump-1hp', 'Nirmal Shallow Well Jet Pump 1 HP', 9490, 6990, 'Jet pump for open wells up to 25 m. Strong suction for gardens and farm use.', ['1 HP', '25 m depth', 'Jet assembly', 'Brass impeller'], ['monoblock', '#2f6f8f', AMB, 'JET', '1 HP', true], 0],
  ['Pumps', 'submersible-borewell-1hp', 'Nirmal Borewell Submersible 1 HP', 14990, 10990, 'For 4″ borewells. Stainless steel body with strainer and a 20 m cable included.', ['1 HP', '4″ borewell', 'SS body', '20 m cable'], ['submersible', '#b2342a', AMB, 'sub', '1 HP'], 1],
  ['Pumps', 'submersible-borewell-15hp', 'Nirmal Borewell Submersible 1.5 HP', 18990, 13990, 'Higher head borewell pump with dry-run protection. Fits 4″ and 6″ bore.', ['1.5 HP', '85 m head', 'Dry-run guard', 'SS body'], ['submersible', '#1f5fbf', AMB, 'sub', '1.5 HP'], 0],
  ['Pumps', 'booster-pump-05hp', 'Nirmal Pressure Booster Pump 0.5 HP', 8490, 6190, 'Auto on/off with a flow switch. Lifts shower and tap pressure on upper floors.', ['0.5 HP', 'Auto flow switch', '2.5 bar boost', 'Quiet motor'], ['booster', '#1f6f5d', AMB, 'bst', '0.5 HP'], 0],
  ['Pumps', 'openwell-submersible-05hp', 'Nirmal Openwell Submersible 0.5 HP', 8990, 6590, 'Compact openwell and sump pump. Float cable and corrosion-proof impeller.', ['0.5 HP', 'Openwell', 'Float option', 'Noryl impeller'], ['submersible', '#2b2f33', AMB, 'sub', '0.5 HP'], 0],

  // ---- Filters (12)
  ['Filters', 'ceramic-candle-10', 'Ceramic Candle Filter 10″', 590, 390, 'Removes cysts and silt from gravity purifiers. Washable and reusable.', ['10 inch', '0.3 micron', 'Washable', 'Fits gravity units'], ['candle', '#f4efe3'], 0],
  ['Filters', 'sediment-spun-10', 'Sediment Spun Filter 10″ (5 micron)', 190, 120, 'First-stage spun polypropylene cartridge. Catches sand, rust and silt.', ['10 inch', '5 micron', 'PP spun', 'Stage 1'], ['spun', '#f4f1e8', BLUE, '5μ', 'SEDIMENT 10″'], 1],
  ['Filters', 'carbon-block-10', 'Activated Carbon Block 10″', 340, 230, 'Removes chlorine, odour and organics. Pressed carbon block with end caps.', ['10 inch', 'CTO block', 'Removes chlorine', 'Stage 2'], ['spun', '#33383c', AMB, 'CTO', 'CARBON BLOCK', true], 0],
  ['Filters', 'ro-membrane-75', 'RO Membrane 75 GPD', 1190, 790, 'Thin-film composite membrane for domestic RO. 98% TDS rejection.', ['75 GPD', '1812 size', '98% rejection', 'TFC'], ['membrane', W, BLUE, 'RO', '75'], 1],
  ['Filters', 'ro-membrane-100', 'RO Membrane 100 GPD', 1390, 950, 'Higher flow membrane for tank-less and under-sink systems.', ['100 GPD', '1812 size', '98% rejection', 'TFC'], ['membrane', W, '#d1432f', 'RO', '100'], 0],
  ['Filters', 'uv-lamp-11w', 'UV Lamp 11 W', 790, 520, 'Replacement UV-C lamp for wall-mount purifiers. Change every 12 months.', ['11 W', 'UV-C 254 nm', '4-pin base', '12 month life'], ['uvlamp', '#eaf2ff', BLUE, 'UV', '11 W'], 0],
  ['Filters', 'uv-lamp-6w', 'UV Lamp 6 W', 540, 360, 'Replacement lamp for countertop and compact UV purifiers.', ['6 W', 'UV-C 254 nm', '2-pin base', '9 month life'], ['uvlamp', '#eaf2ff', BLUE, 'UV', '6 W'], 0],
  ['Filters', 'inline-post-carbon', 'Inline Post-Carbon Filter', 260, 170, 'Polishes taste after the RO stage. Quick-connect ports for ¼″ tubing.', ['¼″ ports', 'Coconut carbon', 'Taste polish', 'Final stage'], ['inline', '#e9eef0', TEAL, 'POST', 'POST CARBON'], 0],
  ['Filters', 'alkaline-mineral-cartridge', 'Alkaline Mineral Cartridge', 490, 330, 'Restores minerals and lifts pH after RO. Adds a mild natural taste.', ['¼″ ports', 'pH 8–9', 'Ca & Mg', 'Final stage'], ['inline', '#e5deef', VIO, 'ALK', 'ALKALINE'], 0],
  ['Filters', 'big-blue-housing-20', 'Big Blue Filter Housing 20″', 3290, 2390, 'Whole-house pre-filter housing with pressure-relief button. Takes 20″ cartridges.', ['20 inch', '1″ ports', 'Pressure relief', '6 bar rated'], ['housing', '#1f5fbf', '#1f5fbf', 'BB', '20″ BIG BLUE', true], 0],
  ['Filters', 'spin-down-sediment-10', 'Spin-Down Sediment Filter 10″', 1590, 1090, 'Transparent housing with a washable cartridge. See when it needs cleaning.', ['10 inch', 'Clear bowl', 'Washable', '¾″ ports'], ['housing', '#2a6fd1', '#2a6fd1', 'SD', '10″ SPIN'], 0],
  ['Filters', 'pp-pleated-sediment-10', 'Pleated Sediment Cartridge 10″', 420, 280, 'Washable pleated cartridge with larger surface area for hard-water use.', ['10 inch', '10 micron', 'Washable', 'Stage 1'], ['spun', '#eef0e4', TEAL, '10μ', 'PLEATED 10″'], 0],

  // ---- Spares (12)
  ['Spares', 'solenoid-valve-24v', 'Solenoid Valve 24 V', 340, 220, 'Controls inlet water in RO systems. Push-fit ¼″ ports, copper coil.', ['24 V DC', '¼″ ports', 'Copper coil', 'Normally closed'], ['solenoid'], 0],
  ['Spares', 'smps-24v-1-5a', 'SMPS Adapter 24 V 1.5 A', 450, 310, 'Power adapter for RO pump and solenoid. Short-circuit and over-load cut-out.', ['24 V / 1.5 A', '100–240 V AC', 'Short-circuit guard', 'DC jack'], ['smps'], 1],
  ['Spares', 'ro-booster-pump-100', 'RO Booster Pump 100 GPD', 1190, 820, 'Diaphragm pump head for domestic RO. Runs quiet at 70 psi.', ['100 GPD', '24 V DC', '70 psi', 'Diaphragm'], ['diaphragm'], 0],
  ['Spares', 'chrome-ro-faucet', 'Chrome RO Faucet', 330, 220, 'Gooseneck faucet for under-sink RO. Ceramic cartridge and ¼″ push-fit.', ['Chrome plated', 'Ceramic valve', '¼″ push-fit', 'Under sink'], ['faucet'], 0],
  ['Spares', 'float-shutoff-valve', 'Float Shut-off Valve', 260, 170, 'Stops the inlet when the tank is full. Fits ¼″ and ⅜″ inlet lines.', ['¼″ inlet', 'Float arm', 'Auto shut-off', 'ABS body'], ['floatv'], 0],
  ['Spares', 'pressure-tank-12l', 'Pressure Tank 12 L', 1450, 990, 'Pressurised storage tank for under-sink and tank-less RO systems.', ['12 L', 'Air pre-charge', '¼″ port', 'Steel shell'], ['tank'], 0],
  ['Spares', 'ro-tubing-quarter-10m', 'RO Tubing ¼″ (10 m Roll)', 280, 190, 'Food-grade LLDPE tubing for all RO connections. Blue, 10 metre roll.', ['¼ inch', '10 m', 'Food grade', 'Blue'], ['tubing'], 0],
  ['Spares', 'push-fit-fittings-set', 'Push-Fit Fittings Assortment', 360, 240, 'Elbows, tees and straight connectors in ¼″. Twenty pieces with a spare O-ring set.', ['¼ inch', '20 pieces', 'Elbow · Tee · Straight', 'Acetal'], ['fittings'], 0],
  ['Spares', 'tds-meter-digital', 'Digital TDS Meter', 399, 270, 'Pocket TDS tester with a 0–9990 ppm range. Hold button and auto-off.', ['0–9990 ppm', '±2% accuracy', 'Hold button', 'Auto off'], ['tds'], 1],
  ['Spares', 'pressure-gauge-100psi', 'Pressure Gauge 0–100 psi', 450, 310, 'Fit after the pump to read RO line pressure. Brass ¼″ bottom stem.', ['0–100 psi', 'Brass stem', '¼″ thread', '63 mm dial'], ['gauge'], 0],
  ['Spares', 'flow-restrictor-300', 'Flow Restrictor 300 ml', 140, 90, 'Sets the reject water ratio. Common sizes 300, 400 and 500 ml/min sold as a set.', ['300 ml/min', 'Push-fit', 'Set of 3', 'Acetal'], ['flowres'], 0],
  ['Spares', 'ss-uv-chamber', 'SS UV Chamber', 1290, 890, 'Stainless steel 316 UV chamber with quartz sleeve. Fits 11 W lamps.', ['SS 316', 'Quartz sleeve', '11 W lamp', '½″ ports'], ['uvchamber'], 0],
];

const MIN_BULK = { Purifiers: 3, Dispensers: 3, Pumps: 3, Filters: 10, Spares: 10 };
const STOCK = (i) => 12 + ((i * 7) % 38);

export const products = rows.map((r, i) => {
  const [category, id, name, mrp, price, description, specs, art, featured] = r;
  const wholesalePrice = Math.round((price * 0.74) / 10) * 10;
  const [type, ...args] = art;
  return {
    id, name, brand: 'Nirmal', category, description, specs,
    mrp, price, wholesalePrice, minBulkQty: MIN_BULK[category],
    stock: STOCK(i), rating: +(4 + ((i * 37) % 10) / 12).toFixed(1), reviews: 24 + ((i * 53) % 480),
    featured: !!featured, _art: { type, args },
  };
});
