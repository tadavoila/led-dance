// 124px — B4 The Dichromatic Garden (4-Quadrant Edition + Row-by-Row Overdrive)
// Top 0: Smooth Flowing Wave | Top 1: Digital Stepped Wave
// Skirt 0: Intersecting Sines | Skirt 1: Sharp Sawtooth Waves
// Overdrive: 12-Level Solid Takeover (Steps through LED_MAP arrays one by one)

var N = 124
var TOP_COUNT = 40
var SKIRT_COUNT = 84
var PI2 = PI * 2

// ===== Default States (4 Distinct Quadrants) =====
var DEF_t0 = 0.60  // Top 0: Ocean Blue
var DEF_t1 = 0.80  // Top 1: Digital Pink
var DEF_s0 = 0.38  // Skirt 0: Midnight Green
var DEF_s1 = 0.17  // Skirt 1: Neon Yellow

var top0Hue = DEF_t0
var top1Hue = DEF_t1
var skt0Hue = DEF_s0
var skt1Hue = DEF_s1

var overdriveLevel = 0 // Updated to 0-12 to match LED_MAP rows
var overdriveHue = 0.15 // Default Neon Yellow

// ===== Timing variables =====
var tMove = 0

// ---------- Internal Mapping ----------
var pixelT = array(N), pixelY = array(N)
var globalRow = array(N) // Tracks row from 0 (top) to 11 (bottom)

var LED_MAP = [
  // --- TOP (5 rows, 8 cols) ---
  [ 4,  5, 14, 15, 24, 25, 34, 35],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 0,  9, 10, 19, 20, 29, 30, 39],
  
  // --- SKIRT (7 rows, 12 cols) ---
  [40, 53, 54, 67, 68, 81, 82, 95, 96,109,110,123],
  [41, 52, 55, 66, 69, 80, 83, 94, 97,108,111,122],
  [42, 51, 56, 65, 70, 79, 84, 93, 98,107,112,121],
  [43, 50, 57, 64, 71, 78, 85, 92, 99,106,113,120],
  [44, 49, 58, 63, 72, 77, 86, 91,100,105,114,119],
  [45, 48, 59, 62, 73, 76, 87, 90,101,104,115,118],
  [46, 47, 60, 61, 74, 75, 88, 89,102,103,116,117],
]

function buildTY() {
  for (var r = 0; r < 12; r++) {
    var rowArr = LED_MAP[r]
    var cols = (r < 5) ? 8 : 12 
    
    for (var c = 0; c < cols; c++) {
      var idx = rowArr[c]
      if (idx < N) {
        pixelT[idx] = c / cols
        if (r < 5) {
          pixelY[idx] = r / 4 
        } else {
          pixelY[idx] = (r - 5) / 6 
        }
        globalRow[idx] = r
      }
    }
  }
}
buildTY()

// ---------- Syncable Toggles & Gauges ----------
var t_t0U=0, t_t0D=0, t_t1U=0, t_t1D=0
var t_s0U=0, t_s0D=0, t_s1U=0, t_s1D=0
var t_ohU=0, t_ohD=0, t_odU=0, t_odD=0, t_reset=0

var l_t0U=0, l_t0D=0, l_t1U=0, l_t1D=0
var l_s0U=0, l_s0D=0, l_s1U=0, l_s1D=0
var l_ohU=0, l_ohD=0, l_odU=0, l_odD=0, l_reset=0

export function toggleTop0HueUp(v){ t_t0U = v }
export function toggleTop0HueDown(v){ t_t0D = v }
export function toggleTop1HueUp(v){ t_t1U = v }
export function toggleTop1HueDown(v){ t_t1D = v }

export function toggleSkirt0HueUp(v){ t_s0U = v }
export function toggleSkirt0HueDown(v){ t_s0D = v }
export function toggleSkirt1HueUp(v){ t_s1U = v }
export function toggleSkirt1HueDown(v){ t_s1D = v }

export function toggleOverdriveHueUp(v){ t_ohU = v }
export function toggleOverdriveHueDown(v){ t_ohD = v }
export function toggleOverdriveLevelUp(v){ t_odU = v }
export function toggleOverdriveLevelDown(v){ t_odD = v }

export function toggleReset(v){ t_reset = v }

export function gaugeTop0(){ return frac(top0Hue) }
export function gaugeTop1(){ return frac(top1Hue) }
export function gaugeSkirt0(){ return frac(skt0Hue) }
export function gaugeSkirt1(){ return frac(skt1Hue) }
export function gaugeOverdriveHue(){ return frac(overdriveHue) }
export function gaugeOverdriveLevel(){ return overdriveLevel / 12.0 }

// ---------- Helpers ----------
function onFlip(v, last){ return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }
function frac(x) { return x - floor(x) }

export function beforeRender(delta) {
  if(onFlip(t_t0U, l_t0U)){ l_t0U=t_t0U; top0Hue = frac(top0Hue + 0.02) }
  if(onFlip(t_t0D, l_t0D)){ l_t0D=t_t0D; top0Hue = frac(top0Hue - 0.02 + 1) }
  if(onFlip(t_t1U, l_t1U)){ l_t1U=t_t1U; top1Hue = frac(top1Hue + 0.02) }
  if(onFlip(t_t1D, l_t1D)){ l_t1D=t_t1D; top1Hue = frac(top1Hue - 0.02 + 1) }
  
  if(onFlip(t_s0U, l_s0U)){ l_s0U=t_s0U; skt0Hue = frac(skt0Hue + 0.02) }
  if(onFlip(t_s0D, l_s0D)){ l_s0D=t_s0D; skt0Hue = frac(skt0Hue - 0.02 + 1) }
  if(onFlip(t_s1U, l_s1U)){ l_s1U=t_s1U; skt1Hue = frac(skt1Hue + 0.02) }
  if(onFlip(t_s1D, l_s1D)){ l_s1D=t_s1D; skt1Hue = frac(skt1Hue - 0.02 + 1) }
  
  if(onFlip(t_ohU, l_ohU)){ l_ohU=t_ohU; overdriveHue = frac(overdriveHue + 0.05) }
  if(onFlip(t_ohD, l_ohD)){ l_ohD=t_ohD; overdriveHue = frac(overdriveHue - 0.05 + 1) }
  if(onFlip(t_odU, l_odU)){ l_odU=t_odU; overdriveLevel = clamp(overdriveLevel + 1, 0, 12) }
  if(onFlip(t_odD, l_odD)){ l_odD=t_odD; overdriveLevel = clamp(overdriveLevel - 1, 0, 12) }
  
  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; 
    top0Hue = DEF_t0; top1Hue = DEF_t1;
    skt0Hue = DEF_s0; skt1Hue = DEF_s1;
    overdriveHue = 0.15; overdriveLevel = 0;
  }

  tMove += delta * 0.001
}

export function render(index) {
  if (index >= N) return
  
  var isTop = (index < TOP_COUNT)
  var id = nodeId() 
  
  var h, s, v
  var th = pixelT[index]
  var thRad = th * PI2
  var y = pixelY[index]
  var gRow = globalRow[index]
  
  var waveLine, isAbove, dist, edgeGlow
  
  // ==========================================
  // 4-QUADRANT SPATIAL LOGIC
  // ==========================================
  if (isTop) {
    if (id == 0) {
      waveLine = 0.5 + sin(thRad * 2 - tMove * 3) * 0.2 + cos(thRad - tMove * 2) * 0.1
      isAbove = y > waveLine
      dist = abs(y - waveLine)
      if (isAbove) {
        h = top0Hue + 0.05; s = 0.8; v = 0.15 + (1.0 - y) * 0.2 + (random(1) > 0.98 ? 0.3 : 0) 
      } else {
        h = top0Hue; s = 1.0; v = 0.05
      }
      edgeGlow = max(0, 1.0 - dist * 8.0)
      v += edgeGlow * 0.6; s -= edgeGlow * 0.4
    } else {
      var steps = 10
      var qTh = floor(thRad * steps) / steps 
      waveLine = 0.5 + sin(qTh * 2 - tMove * 2) * 0.25
      isAbove = y > waveLine
      dist = abs(y - waveLine)
      if (isAbove) {
        h = top1Hue; s = 0.85; v = 0.18 + (1.0 - y) * 0.2
      } else {
        h = frac(top1Hue - 0.05); s = 1.0; v = 0.06
      }
      edgeGlow = max(0, 1.0 - dist * 5.0)
      v += edgeGlow * 0.5; s -= edgeGlow * 0.3
    }
  } else {
    if (id == 0) {
      waveLine = 0.5 + sin(thRad * 3 + tMove * 4) * 0.25 + cos(thRad * 2 - tMove * 3) * 0.15
      isAbove = y > waveLine
      dist = abs(y - waveLine)
      if (isAbove) {
        h = skt0Hue + 0.08; s = 0.85; v = 0.2 + (1.0 - y) * 0.25 + (random(1) > 0.97 ? 0.45 : 0)
      } else {
        h = skt0Hue; s = 1.0; v = 0.08
      }
      edgeGlow = max(0, 1.0 - dist * 10.0)
      v += edgeGlow * 0.8; s -= edgeGlow * 0.5
    } else {
      waveLine = 0.5 + triangle(frac(th * 4 + tMove * 2)) * 0.4 - 0.2
      isAbove = y > waveLine
      dist = abs(y - waveLine)
      if (isAbove) {
        h = frac(skt1Hue + 0.15); s = 0.9; v = 0.25 + (1.0 - y) * 0.3 
      } else {
        h = frac(skt1Hue + 0.05); s = 1.0; v = 0.04 
      }
      edgeGlow = max(0, 1.0 - dist * 18.0)
      v += edgeGlow * 1.0; s -= edgeGlow * 0.8
    }
  }

  // ==========================================
  // OVERDRIVE: STILL ROW-BY-ROW TAKEOVER
  // ==========================================
  if (overdriveLevel > 0) {
    // Takeover logic: any row index less than the current level becomes the still color
    if (gRow < overdriveLevel) {
      h = overdriveHue
      s = 1.0
      v = 1.0
    }
  }

  hsv(frac(h), clamp(s, 0, 1), clamp(v, 0, 1))
}