// D1 & D2 — Flame Ignition & Resonant Surge
// 84 LEDs | 12x7 Zig-Zag | High Contrast & Rhythmic Pulses
var N = 84
var PI2 = PI * 2

// ===== Default Constants =====
var DEF_speed = 0.4, DEF_wind = 0.0, DEF_heat = 0.1
var DEF_d2Tempo = 0.5   // Slow "March"
var DEF_d2Burst = 0.7   // Pulse intensity
var DEF_d2Hue = 0.66    // Starting Deep Blue/Cyan

// ===== State Variables =====
var flameSpeed = DEF_speed, windForce = DEF_wind, heatIntensity = DEF_heat
var isD2Active = 0
var d2Tempo = DEF_d2Tempo
var d2Burst = DEF_d2Burst
var d2Hue = DEF_d2Hue

// --- Internal Timers ---
var t_fire = 0, t_flicker = 0, t_pulse = 0

// --- Mapping ---
var coordsX = array(N), coordsY = array(N)
var rowData = [[0,13,14,27,28,41,42,55,56,69,70,83],[1,12,15,26,29,40,43,54,57,68,71,82],[2,11,16,25,30,39,44,53,58,67,72,81],[3,10,17,24,31,38,45,52,59,66,73,80],[4,9,18,23,32,37,46,51,60,65,74,79],[5,8,19,22,33,36,47,50,61,64,75,78],[6,7,20,21,34,35,48,49,62,63,76,77]]
for (var r = 0; r < 7; r++) {
  for (var c = 0; c < 12; c++) {
    var p = rowData[r][c]; if (p < N) { coordsX[p] = c; coordsY[p] = r }
  }
}

// ---------- UI CONTROLS & GAUGES ----------
var t_fsU=0, t_fsD=0, t_wL=0, t_wR=0, t_hU=0, t_hD=0, t_reset=0
var t_d2sU=0, t_d2sD=0, t_d2bU=0, t_d2bD=0, t_d2hU=0, t_d2hD=0
var l_fsU=0, l_fsD=0, l_wL=0, l_wR=0, l_hU=0, l_hD=0, l_reset=0
var l_d2sU=0, l_d2sD=0, l_d2bU=0, l_d2bD=0, l_d2hU=0, l_d2hD=0

export function toggleSpeedUp(v) { t_fsU = v }
export function toggleSpeedDn(v) { t_fsD = v }
export function toggleWindLeft(v) { t_wL = v }
export function toggleWindRight(v) { t_wR = v }
export function toggleHeatUp(v) { t_hU = v }
export function toggleHeatDn(v) { t_hD = v }
export function toggleReset(v) { t_reset = v }

// D2 Controls
export function toggleD2(v) { isD2Active = v }
export function toggleTempoUp(v) { t_d2sU = v } // March -> Run
export function toggleTempoDn(v) { t_d2sD = v }
export function toggleBurstUp(v) { t_d2bU = v } 
export function toggleBurstDn(v) { t_d2bD = v }
export function toggleD2HueUp(v) { t_d2hU = v }
export function toggleD2HueDn(v) { t_d2hD = v }

export function gaugeSpeed() { return 1 - flameSpeed }
export function gaugeWind() { return (windForce + 1) / 2 } 
export function gaugeHeat() { return heatIntensity }
export function gaugeD2Tempo() { return 1 - (d2Tempo) } 
export function gaugeD2Burst() { return d2Burst }
export function gaugeD2Hue() { return d2Hue }

function onFlip(v, last) { return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  if(onFlip(t_fsU, l_fsU)){ l_fsU=t_fsU; flameSpeed=clamp(flameSpeed-0.05, 0.05, 0.9) }
  if(onFlip(t_fsD, l_fsD)){ l_fsD=t_fsD; flameSpeed=clamp(flameSpeed+0.05, 0.05, 0.9) }
  if(onFlip(t_wL, l_wL)){ l_wL=t_wL; windForce=clamp(windForce-0.1, -1, 1) }
  if(onFlip(t_wR, l_wR)){ l_wR=t_wR; windForce=clamp(windForce+0.1, -1, 1) }
  if(onFlip(t_hU, l_hU)){ l_hU=t_hU; heatIntensity=clamp(heatIntensity+0.05, 0.05, 1) }
  if(onFlip(t_hD, l_hD)){ l_hD=t_hD; heatIntensity=clamp(heatIntensity-0.05, 0.05, 1) }

  // D2 Controls
  if(onFlip(t_d2sU, l_d2sU)){ l_d2sU=t_d2sU; d2Tempo=clamp(d2Tempo-0.05, 0.05, 1) }
  if(onFlip(t_d2sD, l_d2sD)){ l_d2sD=t_d2sD; d2Tempo=clamp(d2Tempo+0.05, 0.05, 1) }
  if(onFlip(t_d2bU, l_d2bU)){ l_d2bU=t_d2bU; d2Burst=clamp(d2Burst+0.1, 0, 1) }
  if(onFlip(t_d2bD, l_d2bD)){ l_d2bD=t_d2bD; d2Burst=clamp(d2Burst-0.1, 0, 1) }
  if(onFlip(t_d2hU, l_d2hU)){ l_d2hU=t_d2hU; d2Hue=frac(d2Hue+0.05) }
  if(onFlip(t_d2hD, l_d2hD)){ l_d2hD=t_d2hD; d2Hue=frac(d2Hue-0.05) }

  if(onFlip(t_reset, l_reset)){
    l_reset = t_reset; flameSpeed = DEF_speed; windForce = DEF_wind; heatIntensity = DEF_heat;
    d2Tempo = DEF_d2Tempo; d2Burst = DEF_d2Burst; d2Hue = DEF_d2Hue;
  }

  t_fire = time(flameSpeed) 
  t_flicker = time(flameSpeed / 4)
  t_pulse = time(d2Tempo) 
}

export function render(index) {
  if (index >= N) return
  var r = coordsY[index]; var c = coordsX[index]

  // --- 1. Base D1 Calculations ---
  var waver = sin(t_fire * PI2 + (r / 3)) * 0.8
  var windShift = windForce * (6 - r) * 0.5 
  var xPos = c + waver + windShift
  var distFromCenter = abs(xPos - 5.5)
  var flameHeight = (7 - r) - (distFromCenter * 0.8)
  var flicker = wave(t_flicker + (c / 12)) * 1.5
  
  var snareBeat = pow(wave(t_pulse), 12) 
  
  var effectiveHeat = isD2Active ? heatIntensity + (snareBeat * d2Burst) : heatIntensity
  var intensity = clamp((flameHeight + flicker) * effectiveHeat / 3, 0, 1)

  // --- 2. Color & Dark Logic ---
  var h, s, v
  h = clamp(0.08 - (intensity * 0.08), 0, 1)
  s = 1.0
  v = pow(intensity, 3.0) 

  // --- 3. D2 Rhythmic Overlay ---
  if (isD2Active) {
    var underCurrentV = (1 - v) * 0.15 * (r / 6) 
    var pulseBurst = snareBeat * d2Burst * (r / 6) 
    
    if (v < 0.1) { 
        h = d2Hue + (snareBeat * 0.1) // Now uses adjustable d2Hue
        s = 0.9
        v = underCurrentV + pulseBurst
    } else {
        // Cyan/Hue-shift heat during high-intensity snare hit
        h = h - (pulseBurst * 0.1) 
    }
  }

  if (v > 0.05 && random(1) > 0.99) v += 0.2

  hsv(frac(h), s, v)
}