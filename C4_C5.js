// C4 — The Independent Sprout (Glitch v3)
// 84 LEDs | Independent Node 0 & Node 1 Controls
var N = 84
var PI2 = PI * 2

// ===== Default Constants =====
var DEF_h0 = 0.66, DEF_spr0 = 0.33 // Node 0: Blue/Green
var DEF_h1 = 0.92, DEF_spr1 = 0.16 // Node 1: Pink/Yellow
var DEF_speed = 0.22              
var DEF_growth = 0.25 

// State Variables for Skirt 0
var hue0 = DEF_h0, sprout0 = DEF_spr0
var bloomSpeed0 = DEF_speed, bloomGrowth0 = DEF_growth 

// State Variables for Skirt 1
var hue1 = DEF_h1, sprout1 = DEF_spr1
var bloomSpeed1 = DEF_speed, bloomGrowth1 = DEF_growth 

// --- Glitch State & Controls ---
var isGlitching = 0
var glitchTimer = 0
var glitchHue = 0       // Default Red
var glitchSpeed = 0.04  // Default speed period

// --- Coordinate Mapping (12x7 Zig-Zag) ---
var coordsX = array(N), coordsY = array(N)
var rowData = [[0,13,14,27,28,41,42,55,56,69,70,83],[1,12,15,26,29,40,43,54,57,68,71,82],[2,11,16,25,30,39,44,53,58,67,72,81],[3,10,17,24,31,38,45,52,59,66,73,80],[4,9,18,23,32,37,46,51,60,65,74,79],[5,8,19,22,33,36,47,50,61,64,75,78],[6,7,20,21,34,35,48,49,62,63,76,77]]
for (var r = 0; r < 7; r++) {
  for (var c = 0; c < 12; c++) {
    var p = rowData[r][c]; if (p < N) { coordsX[p] = c; coordsY[p] = r }
  }
}

// ---------- UI CONTROLS & GAUGES ----------
var t_b0U=0, t_b0D=0, t_s0U=0, t_s0D=0, t_sp0U=0, t_sp0D=0, t_gr0U=0, t_gr0D=0
var t_b1U=0, t_b1D=0, t_s1U=0, t_s1D=0, t_sp1U=0, t_sp1D=0, t_gr1U=0, t_gr1D=0
var t_ghU=0, t_ghD=0, t_gsU=0, t_gsD=0 // Glitch Hue/Speed Toggles
var t_reset=0, l_reset=0
var l_b0U=0, l_b0D=0, l_s0U=0, l_s0D=0, l_sp0U=0, l_sp0D=0, l_gr0U=0, l_gr0D=0
var l_b1U=0, l_b1D=0, l_s1U=0, l_s1D=0, l_sp1U=0, l_sp1D=0, l_gr1U=0, l_gr1D=0
var l_ghU=0, l_ghD=0, l_gsU=0, l_gsD=0

// Skirt 0 Toggles
export function toggleBase0Up(v){ t_b0U=v }
export function toggleBase0Dn(v){ t_b0D=v }
export function toggleSprout0Up(v){ t_s0U=v }
export function toggleSprout0Dn(v){ t_s0D=v }
export function toggleSpeed0Up(v){ t_sp0U=v }
export function toggleSpeed0Dn(v){ t_sp0D=v }
export function toggleGrowth0Up(v){ t_gr0U=v }
export function toggleGrowth0Dn(v){ t_gr0D=v }

// Skirt 1 Toggles
export function toggleBase1Up(v){ t_b1U=v }
export function toggleBase1Dn(v){ t_b1D=v }
export function toggleSprout1Up(v){ t_s1U=v }
export function toggleSprout1Dn(v){ t_s1D=v }
export function toggleSpeed1Up(v){ t_sp1U=v }
export function toggleSpeed1Dn(v){ t_sp1D=v }
export function toggleGrowth1Up(v){ t_gr1U=v }
export function toggleGrowth1Dn(v){ t_gr1D=v }

// Glitch Controls
export function toggleGlitch(v) { isGlitching = v }
export function toggleGlitchHueUp(v) { t_ghU=v }
export function toggleGlitchHueDn(v) { t_ghD=v }
export function toggleGlitchSpeedUp(v) { t_gsU=v }
export function toggleGlitchSpeedDn(v) { t_gsD=v }

export function toggleReset(v){ t_reset=v }

// --- Gauges (Complete Set) ---
export function gaugeHue0(){ return hue0 }
export function gaugeSprout0(){ return sprout0 }
export function gaugeSpeed0(){ return 1 - bloomSpeed0 }
export function gaugeGrowth0(){ return bloomGrowth0 }

export function gaugeHue1(){ return hue1 }
export function gaugeSprout1(){ return sprout1 }
export function gaugeSpeed1(){ return 1 - bloomSpeed1 }
export function gaugeGrowth1(){ return bloomGrowth1 }

export function gaugeGlitchHue(){ return glitchHue }
export function gaugeGlitchSpeed(){ return 1 - (glitchSpeed * 5) } // Inverted for intuitive feel

function onFlip(v, last){ return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t_w0, t_w1, t_drift
export function beforeRender(delta) {
  // Node 0 Logic
  if(onFlip(t_b0U, l_b0U)){ l_b0U=t_b0U; hue0=frac(hue0+0.02) }
  if(onFlip(t_b0D, l_b0D)){ l_b0D=t_b0D; hue0=frac(hue0-0.02) }
  if(onFlip(t_s0U, l_s0U)){ l_s0U=t_s0U; sprout0=frac(sprout0+0.02) }
  if(onFlip(t_s0D, l_s0D)){ l_s0D=t_s0D; sprout0=frac(sprout0-0.02) }
  if(onFlip(t_sp0U, l_sp0U)){ l_sp0U=t_sp0U; bloomSpeed0=clamp(bloomSpeed0-0.05, 0.05, 1) }
  if(onFlip(t_sp0D, l_sp0D)){ l_sp0D=t_sp0D; bloomSpeed0=clamp(bloomSpeed0+0.05, 0.05, 1) }
  if(onFlip(t_gr0U, l_gr0U)){ l_gr0U=t_gr0U; bloomGrowth0=clamp(bloomGrowth0+0.05, 0, 0.9) }
  if(onFlip(t_gr0D, l_gr0D)){ l_gr0D=t_gr0D; bloomGrowth0=clamp(bloomGrowth0-0.05, 0, 0.9) }

  // Node 1 Logic
  if(onFlip(t_b1U, l_b1U)){ l_b1U=t_b1U; hue1=frac(hue1+0.02) }
  if(onFlip(t_b1D, l_b1D)){ l_b1D=t_b1D; hue1=frac(hue1-0.02) }
  if(onFlip(t_s1U, l_s1U)){ l_s1U=t_s1U; sprout1=frac(sprout1+0.02) }
  if(onFlip(t_s1D, l_s1D)){ l_s1D=t_s1D; sprout1=frac(sprout1-0.02) }
  if(onFlip(t_sp1U, l_sp1U)){ l_sp1U=t_sp1U; bloomSpeed1=clamp(bloomSpeed1-0.05, 0.05, 1) }
  if(onFlip(t_sp1D, l_sp1D)){ l_sp1D=t_sp1D; bloomSpeed1=clamp(bloomSpeed1+0.05, 0.05, 1) }
  if(onFlip(t_gr1U, l_gr1U)){ l_gr1U=t_gr1U; bloomGrowth1=clamp(bloomGrowth1+0.05, 0, 0.9) }
  if(onFlip(t_gr1D, l_gr1D)){ l_gr1D=t_gr1D; bloomGrowth1=clamp(bloomGrowth1-0.05, 0, 0.9) }

  // Glitch Adjustment Logic
  if(onFlip(t_ghU, l_ghU)){ l_ghU=t_ghU; glitchHue=frac(glitchHue+0.05) }
  if(onFlip(t_ghD, l_ghD)){ l_ghD=t_ghD; glitchHue=frac(glitchHue-0.05) }
  if(onFlip(t_gsU, l_gsU)){ l_gsU=t_gsU; glitchSpeed=clamp(glitchSpeed-0.01, 0.01, 0.2) }
  if(onFlip(t_gsD, l_gsD)){ l_gsD=t_gsD; glitchSpeed=clamp(glitchSpeed+0.01, 0.01, 0.2) }

  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; 
    hue0=DEF_h0; sprout0=DEF_spr0; bloomSpeed0=DEF_speed; bloomGrowth0=DEF_growth;
    hue1=DEF_h1; sprout1=DEF_spr1; bloomSpeed1=DEF_speed; bloomGrowth1=DEF_growth;
    glitchHue = 0; glitchSpeed = 0.04;
  }
  
  t_w0 = time(bloomSpeed0); t_w1 = time(bloomSpeed1); t_drift = time(0.8) 
  glitchTimer = time(glitchSpeed) 
}

export function render(index) {
  if (index >= N) return
  var id = nodeId(); var r = coordsY[index]; var c = coordsX[index]
  var h, s, v, isS, waveB

  // --- 1. Calculate Normal Logic ---
  if (id == 0) {
    waveB = 6.5 - (bloomGrowth0 * 6) + sin(t_w0 * PI2 + (c / 4)) * 0.8
    isS = r >= waveB
    if (isS) {
      h = sprout0 + (sin(t_drift * PI2) * 0.02); s = 0.8
      v = 0.15 + (6 - r) * 0.1 + ((random(1) > 0.982) ? 0.4 : 0)
    } else {
      h = hue0 + (cos(t_drift * PI2) * 0.03); s = 1.0; v = 0.08
    }
  } else {
    waveB = 6.5 - (bloomGrowth1 * 6) + sin(t_w1 * PI2 + (c / 4)) * 0.8
    isS = r >= waveB
    if (isS) {
      h = sprout1 + (cos(t_drift * PI2) * 0.02); s = 0.9
      v = 0.2 + (6 - r) * 0.12 + ((random(1) > 0.982) ? 0.45 : 0)
    } else {
      h = hue1 + (sin(t_drift * PI2) * 0.03); s = 0.8; v = 0.1
    }
  }

  // --- 2. Apply Glitch Overlays (Selective Peak) ---
  if (isGlitching) {
    var dx = c - 5.5
    var dy = r - 3
    var dist = sqrt(dx*dx + dy*dy)
    var ripple = sin((dist / 2) - glitchTimer * PI2)
    
    if (ripple > 0) {
      h = glitchHue; s = 0.6; v = 0.3
    } 
  }

  hsv(frac(h), s, clamp(v, 0, 1))
}