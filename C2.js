// C2 — PSYCHEDELIC RAINBOW CASCADE (124px)
var N = 124
var PI2 = PI * 2

// ===== Default Settings =====
var DEF_top0 = 0.83, DEF_top1 = 0.70
var DEF_skt0 = 0.55, DEF_skt1 = 0.45
var driftSpeed = 0.12 

var top0Hue = DEF_top0, top1Hue = DEF_top1
var skt0Hue = DEF_skt0, skt1Hue = DEF_skt1

var craziness = 0.5  
var pulseWidth = 3   

// ---------- Mapping ----------
var pixelT = array(N); var globalRow = array(N)
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
    var rowArr = LED_MAP[r]; if (rowArr == 0) continue 
    var cols = (r < 5) ? 8 : 12
    for (var c = 0; c < cols; c++) {
      var idx = rowArr[c]
      if (idx >= 0 && idx < N) {
        pixelT[idx] = c / cols
        globalRow[idx] = r / 11 
      }
    }
  }
}
buildMapping()

// ---------- UI / Controls ----------
var t_t0U=0, t_t0D=0, t_t1U=0, t_t1D=0
var t_s0U=0, t_s0D=0, t_s1U=0, t_s1D=0
var t_reset=0, t_crazyUp=0, t_crazyDn=0
var l_t0U=0, l_t0D=0, l_t1U=0, l_t1D=0
var l_s0U=0, l_s0D=0, l_s1U=0, l_s1D=0
var l_reset=0, l_crazyUp=0, l_crazyDn=0

export function toggleTop0HueUp(v){ t_t0U = v }
export function toggleTop0HueDown(v){ t_t0D = v }
export function toggleTop1HueUp(v){ t_t1U = v }
export function toggleTop1HueDown(v){ t_t1D = v }
export function toggleSkirt0HueUp(v){ t_s0U = v }
export function toggleSkirt0HueDown(v){ t_s0D = v }
export function toggleSkirt1HueUp(v){ t_s1U = v }
export function toggleSkirt1HueDown(v){ t_s1D = v }
export function toggleCrazinessUp(v){ t_crazyUp = v }
export function toggleCrazinessDown(v){ t_crazyDn = v }
export function toggleReset(v){ t_reset = v }

export function gaugeTop0(){ return top0Hue }
export function gaugeTop1(){ return top1Hue }
export function gaugeSkirt0(){ return skt0Hue }
export function gaugeSkirt1(){ return skt1Hue }
export function gaugeCraziness(){ return craziness }

function onFlip(v, last) { return (v > 0 && last == 0) }
function frac(x) { return x - floor(x) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t_vScan, t_hScan, t_rainbow, t_crazyOsc
export function beforeRender(delta) {
  if(onFlip(t_t0U, l_t0U)) top0Hue = frac(top0Hue + 0.05)
  if(onFlip(t_t0D, l_t0D)) top0Hue = frac(top0Hue - 0.05)
  if(onFlip(t_t1U, l_t1U)) top1Hue = frac(top1Hue + 0.05)
  if(onFlip(t_t1D, l_t1D)) top1Hue = frac(top1Hue - 0.05)
  if(onFlip(t_s0U, l_s0U)) skt0Hue = frac(skt0Hue + 0.05)
  if(onFlip(t_s0D, l_s0D)) skt0Hue = frac(skt0Hue - 0.05)
  if(onFlip(t_s1U, l_s1U)) skt1Hue = frac(skt1Hue + 0.05)
  if(onFlip(t_s1D, l_s1D)) skt1Hue = frac(skt1Hue - 0.05)
  
  if(onFlip(t_crazyUp, l_crazyUp)) craziness = clamp(craziness + 0.1, 0, 1)
  if(onFlip(t_crazyDn, l_crazyDn)) craziness = clamp(craziness - 0.1, 0, 1)
  
  if(onFlip(t_reset, l_reset)) {
    top0Hue = DEF_top0; top1Hue = DEF_top1; skt0Hue = DEF_skt0; skt1Hue = DEF_skt1; craziness = 0.5
  }
  
  l_t0U=t_t0U; l_t0D=t_t0D; l_t1U=t_t1U; l_t1D=t_t1D
  l_s0U=t_s0U; l_s0D=t_s0D; l_s1U=t_s1U; l_s1D=t_s1D
  l_reset=t_reset; l_crazyUp=t_crazyUp; l_crazyDn=t_crazyDn

  t_vScan = time(driftSpeed)
  t_hScan = time(driftSpeed * 1.35) 
  t_rainbow = time(0.01) // Even faster for craziness
  t_crazyOsc = time(0.03) // High frequency shimmer
}

export function render(index) {
  if (index >= N) return
  
  var id = nodeId() 
  var row = globalRow[index]
  var col = pixelT[index]
  var isTop = (index < 40)

  // --- NEW CRAZINESS LOGIC ---
  // We use craziness to shift the 'spatial' coordinates of the LEDs. 
  // High craziness = pixels 'steal' coordinates from neighbors.
  var noise = wave(t_crazyOsc + index * 0.5) * craziness
  var warpedRow = row + (noise * 0.2)
  var warpedCol = col + (noise * 0.2)

  // 1. Rainbow Pulse Logic (Using warped coordinates)
  var pos = (id == 0) ? (t_vScan + warpedRow) : (t_hScan + warpedCol)
  var pulse = pow(triangle(pos), pulseWidth) 

  // 2. Background (Brighter floor + Craziness interference)
  var bgGlow = 0.35 + (craziness * 0.3 * sin(t_crazyOsc * PI2 + index * 0.8))

  // 3. Color Selection
  var baseHue = isTop ? (id == 0 ? top0Hue : top1Hue) : (id == 0 ? skt0Hue : skt1Hue)
  
  // The Pulse IS a rainbow. At high craziness, the rainbow speed itself oscillates.
  var rainbowCycle = t_rainbow + (craziness * wave(t_crazyOsc))
  var rainbowColor = frac(rainbowCycle + pos)
  
  // 4. Mixing
  var h = mix(baseHue, rainbowColor, pulse)
  var s = 1.0 - (pulse * 0.3 * craziness) // Desaturate more at high craziness for "glitch" feel
  var v = bgGlow + (pulse * 0.75) 
  
  // Sparkle Layer
  var sparkle = wave(t_crazyOsc + index) * pulse * craziness
  v += sparkle

  hsv(h, clamp(s, 0, 1), clamp(v * v, 0, 1)) 
}