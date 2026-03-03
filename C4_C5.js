// C5 — DAZZLE GLITCH (124px)
// Node 0 & Node 1 Independent Sprouts + 4-Zone Orbital Base
var N = 124
var PI2 = PI * 2

// ===== Constants (Optimized Fixed Speeds) =====
var bloomSpeed0 = 0.2, bloomSpeed1 = 0.18 
var glitchSpeed = 0.04  

// ===== Variable States =====
var sprout0 = 0.33, bloomGrowth0 = 0.4 
var sprout1 = 0.16, bloomGrowth1 = 0.4 

var isGlitching = 0
var glitchHue = 0        

// ---------- Mapping (124 LEDs) ----------
var coordsX = array(N), coordsY = array(N)
var LED_MAP = [
  [ 0,  9, 10, 19, 20, 29, 30, 39], // Rows 0-4 (Top)
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],
  [46, 47, 60, 61, 74, 75, 88, 89, 102, 103, 116, 117], // Rows 5-11 (Skirt)
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
var t_s0U=0, t_s0D=0, t_gr0U=0, t_gr0D=0
var t_s1U=0, t_s1D=0, t_gr1U=0, t_gr1D=0
var t_ghU=0, t_ghD=0, t_reset=0, l_reset=0
var l_s0U=0, l_s0D=0, l_gr0U=0, l_gr0D=0
var l_s1U=0, l_s1D=0, l_gr1U=0, l_gr1D=0
var l_ghU=0, l_ghD=0

export function toggleSprout0Up(v){ t_s0U=v }
export function toggleSprout0Dn(v){ t_s0D=v }
export function toggleGrowth0Up(v){ t_gr0U=v }
export function toggleGrowth0Dn(v){ t_gr0D=v }

export function toggleSprout1Up(v){ t_s1U=v }
export function toggleSprout1Dn(v){ t_s1D=v }
export function toggleGrowth1Up(v){ t_gr1U=v }
export function toggleGrowth1Dn(v){ t_gr1D=v }

export function toggleGlitch(v) { isGlitching = v }
export function toggleGlitchHueUp(v) { t_ghU=v }
export function toggleGlitchHueDn(v) { t_ghD=v }
export function toggleReset(v){ t_reset=v }

export function gaugeSprout0(){ return sprout0 }
export function gaugeGrowth0(){ return bloomGrowth0 }
export function gaugeSprout1(){ return sprout1 }
export function gaugeGrowth1(){ return bloomGrowth1 }
export function gaugeGlitchHue(){ return glitchHue }

function onFlip(v, last){ return (v > 0 && last == 0) }
function frac(x) { return x - floor(x) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t_w0, t_w1, t_drift, t_shimmer, t_baseRot, glitchTimer
export function beforeRender(delta) {
  if(onFlip(t_s0U, l_s0U)) sprout0=frac(sprout0+0.05)
  if(onFlip(t_s0D, l_s0D)) sprout0=frac(sprout0-0.05)
  if(onFlip(t_gr0U, l_gr0U)) bloomGrowth0=clamp(bloomGrowth0+0.1, 0, 1)
  if(onFlip(t_gr0D, l_gr0D)) bloomGrowth0=clamp(bloomGrowth0-0.1, 0, 1)

  if(onFlip(t_s1U, l_s1U)) sprout1=frac(sprout1+0.05)
  if(onFlip(t_s1D, l_s1D)) sprout1=frac(sprout1-0.05)
  if(onFlip(t_gr1U, l_gr1U)) bloomGrowth1=clamp(bloomGrowth1+0.1, 0, 1)
  if(onFlip(t_gr1D, l_gr1D)) bloomGrowth1=clamp(bloomGrowth1-0.1, 0, 1)

  if(onFlip(t_ghU, l_ghU)) glitchHue=frac(glitchHue+0.1)
  if(onFlip(t_ghD, l_ghD)) glitchHue=frac(glitchHue-0.1)

  if(onFlip(t_reset, l_reset)){ 
    sprout0=0.33; bloomGrowth0=0.4; sprout1=0.16; bloomGrowth1=0.4; glitchHue = 0
  }
    
  l_s0U=t_s0U; l_s0D=t_s0D; l_gr0U=t_gr0U; l_gr0D=t_gr0D
  l_s1U=t_s1U; l_s1D=t_s1D; l_gr1U=t_gr1U; l_gr1D=t_gr1D
  l_ghU=t_ghU; l_ghD=t_ghD; l_reset=t_reset

  t_w0 = time(bloomSpeed0); t_w1 = time(bloomSpeed1)
  t_drift = time(0.8); t_shimmer = time(0.01)
  t_baseRot = time(2.0) // Slower, smoother rotation
  glitchTimer = time(glitchSpeed) 
}

export function render(index) {
  if (index >= N) return
  var id = nodeId(); var r = coordsY[index]; var c = coordsX[index]
  var h, s, v, isS, waveB
  var isTop = r < 0.45 // Row 0-4 are roughly top 45% of normalized Y

  // --- 1. Dazzle Shimmer ---
  var shimmer = (random(1) > 0.93) ? 0.8 : 0

  // --- 2. Vaporwave Base Palette (No Greens/Yellows) ---
  // Blue (0.66) to Pink (0.98) range
  var paletteRange = 0.32 
  var b0_top = 0.66 + paletteRange * wave(t_baseRot)
  var b0_skrt = 0.66 + paletteRange * wave(t_baseRot + 0.25)
  var b1_top = 0.66 + paletteRange * wave(t_baseRot + 0.5)
  var b1_skrt = 0.66 + paletteRange * wave(t_baseRot + 0.75)

  if (id == 0) {
    waveB = 1.1 - (bloomGrowth0 * 1.2) + sin(t_w0 * PI2 + (c * 3)) * 0.15
    isS = r >= waveB
    if (isS) {
      h = sprout0 + (sin(t_drift * PI2) * 0.05)
      s = 0.75; v = 0.45 + (1.0 - r) * 0.2 + shimmer 
    } else {
      h = isTop ? b0_top : b0_skrt; s = 1.0; v = 0.28 
    }
  } else {
    waveB = 1.1 - (bloomGrowth1 * 1.2) + sin(t_w1 * PI2 + (c * 3)) * 0.15
    isS = r >= waveB
    if (isS) {
      h = sprout1 + (cos(t_drift * PI2) * 0.05)
      s = 0.65; v = 0.55 + (1.0 - r) * 0.25 + shimmer 
    } else {
      h = isTop ? b1_top : b1_skrt; s = 0.9; v = 0.32 
    }
  }

  // --- 3. Glitch Overlay ---
  if (isGlitching) {
    var ripple = sin((sqrt(pow(c-0.5,2)+pow(r-0.5,2)) * 8) - glitchTimer * PI2)
    if (ripple > 0.7) {
      h = glitchHue; s = 0.3; v = 1.0 
    } 
  }

  hsv(frac(h), clamp(s, 0, 1), clamp(v * v, 0, 1))
}