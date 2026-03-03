// C3 — FLAMBOYANT RAINBOW VORTEX (124px)
// Adapted from C2 architecture with C3 Spiral Math
var N = 124
var PI2 = PI * 2

// ===== Default Settings =====
var DEF_h0 = 0.66, DEF_h1 = 0.94 // Background Hues
var DEF_speed = 0.15, DEF_crazy = 0.4
var hue0 = DEF_h0, hue1 = DEF_h1
var pulseSpeed = DEF_speed
var craziness = DEF_crazy
var pulseWidth = 3 // Width of the rainbow arms

// ---------- Mapping (124 LEDs) ----------
var coordsX = array(N), coordsY = array(N)
var isTopSection = array(N)

var LED_MAP = [
  // --- TOP (5 rows, 8 cols) ---
  [ 0,  9, 10, 19, 20, 29, 30, 39],
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],

  // --- SKIRT (7 rows, 12 cols) ---
  [46, 47, 60, 61, 74, 75, 88, 89,102,103,116,117],
  [45, 48, 59, 62, 73, 76, 87, 90,101,104,115,118],
  [44, 49, 58, 63, 72, 77, 86, 91,100,105,114,119],
  [43, 50, 57, 64, 71, 78, 85, 92, 99,106,113,120],
  [42, 51, 56, 65, 70, 79, 84, 93, 98,107,112,121],
  [41, 52, 55, 66, 69, 80, 83, 94, 97,108,111,122],
  [40, 53, 54, 67, 68, 81, 82, 95, 96,109,110,123],
]


function buildMapping() {
  for (var r = 0; r < 12; r++) {
    var rowArr = LED_MAP[r]
    var cols = (r < 5) ? 8 : 12
    for (var c = 0; c < cols; c++) {
      var idx = rowArr[c]
      if (idx < N) {
        coordsX[idx] = (c - (cols/2)) / (cols/2) // Normalized X [-1, 1]
        coordsY[idx] = (r - 5.5) / 5.5           // Normalized Y [-1, 1]
        isTopSection[idx] = (r < 5)
      }
    }
  }
}
buildMapping()

// ---------- UI CONTROLS & GAUGES ----------
var t_h0U=0, t_h0D=0, t_h1U=0, t_h1D=0
var t_spU=0, t_spD=0, t_czU=0, t_czD=0, t_reset=0
var l_h0U=0, l_h0D=0, l_h1U=0, l_h1D=0
var l_spU=0, l_spD=0, l_czU=0, l_czD=0, l_reset=0

export function toggleHue0Up(v){ t_h0U = v }
export function toggleHue0Down(v){ t_h0D = v }
export function toggleHue1Up(v){ t_h1U = v }
export function toggleHue1Down(v){ t_h1D = v }
export function toggleSpeedUp(v){ t_spU = v }
export function toggleSpeedDown(v){ t_spD = v }
export function toggleCrazinessUp(v){ t_czU = v }
export function toggleCrazinessDown(v){ t_czD = v }
export function toggleReset(v){ t_reset = v }

export function gaugeHue0(){ return hue0 }
export function gaugeHue1(){ return hue1 }
export function gaugeSpeed(){ return 1 - pulseSpeed }
export function gaugeCraziness(){ return craziness }

function onFlip(v, last){ return (v > 0 && last == 0) }
function frac(x) { return x - floor(x) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t_vortex, t_rainbow, t_glitch
export function beforeRender(delta) {
  if(onFlip(t_h0U, l_h0U)) hue0 = frac(hue0 + 0.05)
  if(onFlip(t_h0D, l_h0D)) hue0 = frac(hue0 - 0.05)
  if(onFlip(t_h1U, l_h1U)) hue1 = frac(hue1 + 0.05)
  if(onFlip(t_h1D, l_h1D)) hue1 = frac(hue1 - 0.05)
  if(onFlip(t_spU, l_spU)) pulseSpeed = clamp(pulseSpeed - 0.02, 0.02, 0.5)
  if(onFlip(t_spD, l_spD)) pulseSpeed = clamp(pulseSpeed + 0.02, 0.02, 0.5)
  if(onFlip(t_czU, l_czU)) craziness = clamp(craziness + 0.1, 0, 1)
  if(onFlip(t_czD, l_czD)) craziness = clamp(craziness - 0.1, 0, 1)
  if(onFlip(t_reset, l_reset)){ hue0=DEF_h0; hue1=DEF_h1; pulseSpeed=DEF_speed; craziness=DEF_crazy }

  l_h0U=t_h0U; l_h0D=t_h0D; l_h1U=t_h1U; l_h1D=t_h1D
  l_spU=t_spU; l_spD=t_spD; l_czU=t_czU; l_czD=t_czD; l_reset=t_reset

  t_vortex = time(pulseSpeed)
  t_rainbow = time(0.01)
  t_glitch = time(0.03)
}

export function render(index) {
  var id = nodeId()
  var x = coordsX[index]
  var y = coordsY[index]

  // --- CRAZINESS: Spatial Distortion ---
  var gNoise = wave(t_glitch + index * 0.15) * craziness
  var r = sqrt(x*x + y*y) + (gNoise * 0.2)
  var theta = atan2(y, x) / PI2 + (gNoise * 0.3 * craziness)

  // Shatter effect: Breaks the spiral arms into segments
  if (craziness > 0.5) {
    var segments = 16 - (craziness * 12)
    theta = floor(theta * segments) / segments
  }

  // --- VORTEX LOGIC ---
  // Node 0 spirals CW, Node 1 spirals CCW
  var spiralPos = (id == 0) ? (t_vortex + r + theta) : (t_vortex - r - theta)
  var pulse = pow(triangle(spiralPos), pulseWidth)

  // --- COLOR ENGINE ---
  var bgGlow = 0.3 + (craziness * 0.25 * sin(t_glitch * PI2 + index * 0.5))
  var rainbowHue = frac(t_rainbow + spiralPos)
  var baseHue = (id == 0) ? hue0 : hue1
  
  var h = mix(baseHue, rainbowHue, pulse)
  var s = 1.0 - (pulse * 0.3 * craziness)
  var v = bgGlow + (pulse * 0.7)
  
  // White glint at pulse peaks
  if (pulse > 0.9) { s *= 0.5; v += 0.2 }

  hsv(h, s, v * v)
}