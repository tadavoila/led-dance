// D1 & D2 — Resonant Inferno (124px)
var N = 124
var PI2 = PI * 2

// ===== Default Constants =====
var DEF_speed = 0.3     // Slightly faster base
var DEF_heat = 0.4      // Brighter start
var DEF_d2Burst = 0.8   
var DEF_d2Hue = 0.66    

// ===== State Variables =====
var flameSpeed = DEF_speed
var heatIntensity = DEF_heat
var isD2Active = 0
var d2Burst = DEF_d2Burst
var d2Hue = DEF_d2Hue

// --- Internal Timers ---
var t_fire, t_flicker, t_pulse, t_windOsc

// --- Mapping (124 LEDs: 8-wide Top, 12-wide Skirt) ---
var coordsX = array(N), coordsY = array(N)
var LED_MAP = [
  [ 0,  9, 10, 19, 20, 29, 30, 39], // 0-4 Top
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],
  [46, 47, 60, 61, 74, 75, 88, 89, 102, 103, 116, 117], // 5-11 Skirt
  [45, 48, 59, 62, 73, 76, 87, 90, 101, 104, 115, 118],
  [44, 49, 58, 63, 72, 77, 86, 91, 100, 105, 114, 119],
  [43, 50, 57, 64, 71, 78, 85, 92,  99, 106, 113, 120],
  [42, 51, 56, 65, 70, 79, 84, 93,  98, 107, 112, 121],
  [41, 52, 55, 66, 69, 80, 83, 94,  97, 108, 111, 122],
  [40, 53, 54, 67, 68, 81, 82, 95,  96, 109, 110, 123]
]

function buildMapping() {
  for (var r = 0; r < 12; r++) {
    var rowArr = LED_MAP[r]
    var cols = (r < 5) ? 8 : 12
    for (var c = 0; c < cols; c++) {
      var idx = rowArr[c]
      if (idx < N) {
        coordsX[idx] = c / (cols - 1)
        coordsY[idx] = r / 11
      }
    }
  }
}
buildMapping()

// ---------- UI CONTROLS ----------
var t_fsU=0, t_fsD=0, t_hU=0, t_hD=0, t_reset=0
var t_d2bU=0, t_d2bD=0, t_d2hU=0, t_d2hD=0
var l_fsU=0, l_fsD=0, l_hU=0, l_hD=0, l_reset=0
var l_d2bU=0, l_d2bD=0, l_d2hU=0, l_d2hD=0

export function toggleSpeedUp(v) { t_fsU = v }
export function toggleSpeedDn(v) { t_fsD = v }
export function toggleHeatUp(v) { t_hU = v }
export function toggleHeatDn(v) { t_hD = v }
export function toggleReset(v) { t_reset = v }

export function toggleD2(v) { isD2Active = v }
export function toggleBurstUp(v) { t_d2bU = v } 
export function toggleBurstDn(v) { t_d2bD = v }
export function toggleD2HueUp(v) { t_d2hU = v }
export function toggleD2HueDn(v) { t_d2hD = v }

export function gaugeSpeed() { return 1 - flameSpeed }
export function gaugeHeat() { return heatIntensity }
export function gaugeD2Burst() { return d2Burst }
export function gaugeD2Hue() { return d2Hue }

function onFlip(v, last) { return (v > 0 && last == 0) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  if(onFlip(t_fsU, l_fsU)) flameSpeed=clamp(flameSpeed-0.05, 0.05, 0.9)
  if(onFlip(t_fsD, l_fsD)) flameSpeed=clamp(flameSpeed+0.05, 0.05, 0.9)
  if(onFlip(t_hU, l_hU)) heatIntensity=clamp(heatIntensity+0.1, 0.1, 2)
  if(onFlip(t_hD, l_hD)) heatIntensity=clamp(heatIntensity-0.1, 0.1, 2)

  if(onFlip(t_d2bU, l_d2bU)) d2Burst=clamp(d2Burst+0.1, 0, 1)
  if(onFlip(t_d2bD, l_d2bD)) d2Burst=clamp(d2Burst-0.1, 0, 1)
  if(onFlip(t_d2hU, l_d2hU)) d2Hue=frac(d2Hue+0.05)
  if(onFlip(t_d2hD, l_d2hD)) d2Hue=frac(d2Hue-0.05)

  if(onFlip(t_reset, l_reset)){
    flameSpeed = DEF_speed; heatIntensity = DEF_heat;
    d2Burst = DEF_d2Burst; d2Hue = DEF_d2Hue;
  }

  l_fsU=t_fsU; l_fsD=t_fsD; l_hU=t_hU; l_hD=t_hD; l_reset=t_reset
  l_d2bU=t_d2bU; l_d2bD=t_d2bD; l_d2hU=t_d2hU; l_d2hD=t_d2hD

  t_fire = time(flameSpeed) 
  t_flicker = time(flameSpeed / 6) // Faster flicker
  t_pulse = time(0.2) // Fixed aggressive tempo
  t_windOsc = time(1.5) // Automatic wind fluctuation cycle
}

export function render(index) {
  var r = coordsY[index]
  var c = coordsX[index]

  // --- 1. Automatic Wind & Waiver ---
  var currentWind = sin(t_windOsc * PI2) * 0.4
  var waver = sin(t_fire * PI2 + (r * 2)) * 0.2
  
  // Normalized horizontal distance from center (shifted by wind)
  var distFromCenter = abs(c - 0.5 - (currentWind * r) - waver)
  
  // --- 2. Flame Dynamics ---
  var flameHeight = (1.1 - r) - (distFromCenter * 1.5)
  var flicker = wave(t_flicker + (index / N)) * 1.2
  
  var snareBeat = pow(wave(t_pulse), 16) // Sharper pulse
  
  var effectiveHeat = isD2Active ? heatIntensity + (snareBeat * d2Burst) : heatIntensity
  var intensity = clamp((flameHeight + flicker) * effectiveHeat, 0, 1)

  // --- 3. Color Logic ---
  var h, s, v
  // Shift hue based on intensity (Yellow tip -> Red base)
  h = 0.12 - (intensity * 0.12) 
  s = 1.0
  v = pow(intensity, 2.0) // Lower power = more mid-tone brightness

  // --- 4. D2 Rhythmic Overlay ---
  if (isD2Active) {
    // Brighter ambient "undercurrent" base
    var bgV = 0.2 * r * (1 - v) 
    var pulseBurst = snareBeat * d2Burst * r 
    
    if (v < 0.15) { 
        h = d2Hue + (snareBeat * 0.05)
        s = 0.8
        v = bgV + pulseBurst
    } else {
        // Chromatic distortion during high intensity hit
        h = h + (pulseBurst * 0.1) 
        s = 1.0 - (pulseBurst * 0.5)
    }
  }

  // Dazzle sparks
  if (v > 0.1 && random(1) > 0.98) v += 0.3

  hsv(frac(h), s, clamp(v, 0, 1))
}