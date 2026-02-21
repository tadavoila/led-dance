// C3 — The Gravitational Vortex
// Pure Spiral Motion | No Stars | 84 LEDs
var N = 84
var PI2 = PI * 2

// ===== Default States =====
var DEF_h0 = 0.66   // Midnight Navy
var DEF_h1 = 0.94   // Neon Pink
var DEF_speed = 0.3
var DEF_depth = 1.0

var hue0 = DEF_h0
var hue1 = DEF_h1
var pulseSpeed = DEF_speed
var pulseDepth = DEF_depth

// Coordinate Map for 12x7 Grid (Architecture)
var coordsX = array(N), coordsY = array(N)
var rowData = [
  [ 0, 13, 14, 27, 28, 41, 42, 55, 56, 69, 70, 83],
  [ 1, 12, 15, 26, 29, 40, 43, 54, 57, 68, 71, 82],
  [ 2, 11, 16, 25, 30, 39, 44, 53, 58, 67, 72, 81],
  [ 3, 10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80],
  [ 4,  9, 18, 23, 32, 37, 46, 51, 60, 65, 74, 79],
  [ 5,  8, 19, 22, 33, 36, 47, 50, 61, 64, 75, 78],
  [ 6,  7, 20, 21, 34, 35, 48, 49, 62, 63, 76, 77]
]

for (var r = 0; r < 7; r++) {
  for (var c = 0; c < 12; c++) {
    var p = rowData[r][c]; if (p < N) { coordsX[p] = c; coordsY[p] = r }
  }
}

// ---------- UI CONTROLS & GAUGES ----------
var t_h0Up=0, t_h0Dn=0, t_h1Up=0, t_h1Dn=0
var t_spUp=0, t_spDn=0, t_deUp=0, t_deDn=0, t_reset=0
var l_h0Up=0, l_h0Dn=0, l_h1Up=0, l_h1Dn=0
var l_spUp=0, l_spDn=0, l_deUp=0, l_deDn=0, l_reset=0

export function toggleHue0Up(v){ t_h0Up = v }
export function toggleHue0Down(v){ t_h0Dn = v }
export function toggleHue1Up(v){ t_h1Up = v }
export function toggleHue1Down(v){ t_h1Dn = v }
export function togglePulseSpeedUp(v){ t_spUp = v }
export function togglePulseSpeedDown(v){ t_spDn = v }
export function togglePulseDepthUp(v){ t_deUp = v }
export function togglePulseDepthDown(v){ t_deDn = v }
export function toggleReset(v){ t_reset = v }

export function gaugeHue0(){ return frac(hue0) }
export function gaugeHue1(){ return frac(hue1) }
export function gaugePulseSpeed(){ return pulseSpeed }
export function gaugePulseDepth(){ return pulseDepth / 2 }

function onFlip(v, last){ return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t1, t_bk
export function beforeRender(delta) {
  // Process Toggles
  if(onFlip(t_h0Up, l_h0Up)){ l_h0Up=t_h0Up; hue0 = frac(hue0 + 0.02) }
  if(onFlip(t_h0Dn, l_h0Dn)){ l_h0Dn=t_h0Dn; hue0 = frac(hue0 - 0.02) }
  if(onFlip(t_h1Up, l_h1Up)){ l_h1Up=t_h1Up; hue1 = frac(hue1 + 0.02) }
  if(onFlip(t_h1Dn, l_h1Dn)){ l_h1Dn=t_h1Dn; hue1 = frac(hue1 - 0.02) }
  
  if(onFlip(t_spUp, l_spUp)){ l_spUp=t_spUp; pulseSpeed = clamp(pulseSpeed - 0.05, 0.02, 1.0) }
  if(onFlip(t_spDn, l_spDn)){ l_spDn=t_spDn; pulseSpeed = clamp(pulseSpeed + 0.05, 0.02, 1.0) }
  if(onFlip(t_deUp, l_deUp)){ l_deUp=t_deUp; pulseDepth = clamp(pulseDepth + 0.2, 0, 3.0) }
  if(onFlip(t_deDn, l_deDn)){ l_deDn=t_deDn; pulseDepth = clamp(pulseDepth - 0.2, 0, 3.0) }

  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; hue0=DEF_h0; hue1=DEF_h1;
    pulseSpeed = DEF_speed; pulseDepth = DEF_depth;
  }

  t1 = time(0.8)    // Color drift
  t_bk = time(pulseSpeed)
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }
  
  var skirtId = nodeId()
  var h, s, v

  // Polar Coordinate Math
  var dx = (coordsX[index] - 5.5) 
  var dy = (coordsY[index] - 3.0)
  var radius = sqrt(dx*dx + dy*dy) / 6 
  var angle = atan2(dy, dx) / PI2     

  if (skirtId == 0) {
    // NODE 0: NAVY (Steady Inward - Counter-Clockwise)
    h = hue0 + (sin(t1 * PI2) * 0.03)
    s = 1.0
    // Spiral logic: (Time + Radius + Angle)
    var spiralArms = sin(t_bk * PI2 + radius * 3.5 + angle)
    v = 0.05 + (0.15 * pulseDepth) * spiralArms
  } else {
    // NODE 1: PINK (Fast Inward - Clockwise)
    h = hue1 + (cos(t1 * PI2) * 0.03)
    s = 0.8
    // Spiral logic: (Faster Time + Radius - Angle)
    var spiralArms = sin((t_bk * 0.5) * PI2 + radius * 5.0 - angle)
    v = 0.06 + (0.18 * pulseDepth) * spiralArms
  }

  hsv(frac(h), s, clamp(v, 0, 1))
}