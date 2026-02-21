// D4_D5: Cross-Fading Fluid Dynamics
var N = 84
var PI2 = PI * 2

// ===== Default Constants =====
var DEF_d4Speed = 0.2, DEF_d4Width = 0.4
var DEF_d4H1 = 0.99, DEF_d4Int = 0.8
var DEF_d5Speed = 0.5, DEF_d5Turb = 0.8, DEF_d5Hue = 0.02, DEF_d5Int = 0.8
var FADE_SPEED = 0.001 // Adjusts how fast the cross-fade happens

// ===== State Variables =====
var isSunrise = 0 
var transitionAmt = 0 // 0 = D4 (Ripple), 1 = D5 (Sunrise)
var d4Speed = DEF_d4Speed, d4Width = DEF_d4Width, d4Hue = DEF_d4H1, d4Int = DEF_d4Int
var d5Speed = DEF_d5Speed, d5Turb = DEF_d5Turb, d5Hue = DEF_d5Hue, d5Int = DEF_d5Int

var pulseAccum = 0, t_convection = 0

// --- Mapping ---
var coordsX = array(N), coordsY = array(N)
var rowData = [[0,13,14,27,28,41,42,55,56,69,70,83],[1,12,15,26,29,40,43,54,57,68,71,82],[2,11,16,25,30,39,44,53,58,67,72,81],[3,10,17,24,31,38,45,52,59,66,73,80],[4,9,18,23,32,37,46,51,60,65,74,79],[5,8,19,22,33,36,47,50,61,64,75,78],[6,7,20,21,34,35,48,49,62,63,76,77]]
for (var r = 0; r < 7; r++) {
  for (var c = 0; c < 12; c++) {
    var p = rowData[r][c]; if (p < N) { coordsX[p] = c; coordsY[p] = r }
  }
}

function getWave(v) { return (sin(v * PI2) + 1) / 2 }

// ---------- UI CONTROLS & GAUGES ----------
var t_d4sU=0, t_d4sD=0, t_d4wU=0, t_d4wD=0, t_d4hU=0, t_d4hD=0, t_d4iU=0, t_d4iD=0
var t_d5sU=0, t_d5sD=0, t_d5tU=0, t_d5tD=0, t_d5hU=0, t_d5hD=0, t_d5iU=0, t_d5iD=0, t_reset=0
var l_d4sU=0, l_d4sD=0, l_d4wU=0, l_d4wD=0, l_d4hU=0, l_d4hD=0, l_d4iU=0, l_d4iD=0
var l_d5sU=0, l_d5sD=0, l_d5tU=0, l_d5tD=0, l_d5hU=0, l_d5hD=0, l_d5iU=0, l_d5iD=0, l_reset=0

export function toggleSpeedUp(v) { t_d4sU=v }
export function toggleSpeedDn(v) { t_d4sD=v }
export function toggleWidthUp(v) { t_d4wU=v }
export function toggleWidthDn(v) { t_d4wD=v }
export function toggleHueUp(v) { t_d4hU=v }
export function toggleHueDn(v) { t_d4hD=v }
export function toggleIntUp(v) { t_d4iU=v }
export function toggleIntDn(v) { t_d4iD=v }

export function toggleSunrise(v) { isSunrise = v }
export function toggleD5SpeedUp(v) { t_d5sU=v }
export function toggleD5SpeedDn(v) { t_d5sD=v }
export function toggleD5TurbUp(v) { t_d5tU=v }
export function toggleD5TurbDn(v) { t_d5tD=v }
export function toggleD5HueUp(v) { t_d5hU=v }
export function toggleD5HueDn(v) { t_d5hD=v }
export function toggleD5IntUp(v) { t_d5iU=v }
export function toggleD5IntDn(v) { t_d5iD=v }

export function toggleReset(v) { t_reset = v }

// --- THE GAUGE SUITE ---
export function gaugeD4_Speed() { return d4Speed / 2 }
export function gaugeD4_Width() { return d4Width }
export function gaugeD4_Hue() { return d4Hue }
export function gaugeD4_Int() { return d4Int }
export function gaugeD5_Speed() { return d5Speed }
export function gaugeD5_Turb() { return d5Turb / 3 }
export function gaugeD5_Hue() { return d5Hue }
export function gaugeD5_Int() { return d5Int / 2 }
export function gaugeTransition() { return transitionAmt }

function onFlip(v, last) { return (v > 0.5 && last <= 0.5) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  pulseAccum = frac(pulseAccum + (delta/1000 * d4Speed))
  t_convection = time(d5Speed)

  // --- CROSS-FADE LOGIC ---
  if (isSunrise && transitionAmt < 1) {
    transitionAmt = clamp(transitionAmt + (delta * FADE_SPEED), 0, 1)
  } else if (!isSunrise && transitionAmt > 0) {
    transitionAmt = clamp(transitionAmt - (delta * FADE_SPEED), 0, 1)
  }

  // --- D4 Controls ---
  if(onFlip(t_d4sU, l_d4sU)){ d4Speed = clamp(d4Speed + 0.1, 0.1, 2) }
  if(onFlip(t_d4sD, l_d4sD)){ d4Speed = clamp(d4Speed - 0.1, 0.1, 2) }
  if(onFlip(t_d4wU, l_d4wU)){ d4Width = clamp(d4Width + 0.05, 0.1, 1) }
  if(onFlip(t_d4wD, l_d4wD)){ d4Width = clamp(d4Width - 0.05, 0.1, 1) }
  if(onFlip(t_d4hU, l_d4hU)){ d4Hue = frac(d4Hue + 0.05) }
  if(onFlip(t_d4hD, l_d4hD)){ d4Hue = frac(d4Hue - 0.05) }
  if(onFlip(t_d4iU, l_d4iU)){ d4Int = clamp(d4Int + 0.1, 0, 1) }
  if(onFlip(t_d4iD, l_d4iD)){ d4Int = clamp(d4Int - 0.1, 0, 1) }
  l_d4sU=t_d4sU; l_d4sD=t_d4sD; l_d4wU=t_d4wU; l_d4wD=t_d4wD; l_d4hU=t_d4hU; l_d4hD=t_d4hD; l_d4iU=t_d4iU; l_d4iD=t_d4iD

  // --- D5 Controls ---
  if(onFlip(t_d5sU, l_d5sU)){ d5Speed=clamp(d5Speed-0.02, 0.02, 1) }
  if(onFlip(t_d5sD, l_d5sD)){ d5Speed=clamp(d5Speed+0.02, 0.02, 1) }
  if(onFlip(t_d5tU, l_d5tU)){ d5Turb=clamp(d5Turb+0.1, 0.1, 3) }
  if(onFlip(t_d5tD, l_d5tD)){ d5Turb=clamp(d5Turb-0.1, 0.1, 3) }
  if(onFlip(t_d5hU, l_d5hU)){ d5Hue=frac(d5Hue+0.05) }
  if(onFlip(t_d5hD, l_d5hD)){ d5Hue=frac(d5Hue-0.05) }
  if(onFlip(t_d5iU, l_d5iU)){ d5Int=clamp(d5Int+0.1, 0.1, 2) }
  if(onFlip(t_d5iD, l_d5iD)){ d5Int=clamp(d5Int-0.1, 0.1, 2) }
  l_d5sU=t_d5sU; l_d5sD=t_d5sD; l_d5tU=t_d5tU; l_d5tD=t_d5tD; l_d5hU=t_d5hU; l_d5hD=t_d5hD; l_d5iU=t_d5iU; l_d5iD=t_d5iD

  if(onFlip(t_reset, l_reset)){
    d4Speed=DEF_d4Speed; d4Width=DEF_d4Width; d4Hue=DEF_d4H1; d4Int=DEF_d4Int;
    d5Speed=DEF_d5Speed; d5Turb=DEF_d5Turb; d5Hue=DEF_d5Hue; d5Int=DEF_d5Int; transitionAmt = 0;
  }
  l_reset=t_reset
}

export function render(index) {
  if (index >= N) return
  var r = coordsY[index]; var c = coordsX[index]
  
  // 1. Calculate D4 (Ripple)
  var dx = (c - 5.5) / 6, dy = (r - 3) / 3.5
  var dist = sqrt(dx*dx + dy*dy) 
  var waveVal = getWave(dist * (1/d4Width) - pulseAccum)
  var h4, v4
  if ((r + c) % 2 == 0) {
    h4 = d4Hue; v4 = pow(waveVal, 4) * d4Int
  } else {
    h4 = d4Hue + 0.48; v4 = pow(1 - waveVal, 4) * (d4Int * 0.8)
  }

  // 2. Calculate D5 (Sunrise)
  var swirl = sin(t_convection * PI2 + (c / d5Turb)) * d5Turb
  var rising = getWave(t_convection - (r / 7) + (swirl * 0.1))
  var heatMap = (r / 6) 
  var h5 = d5Hue + (heatMap * 0.1)
  var s5 = 1 - (rising * 0.3)
  var v5 = pow(rising, 2) * (1.5 - heatMap) * d5Int 
  if (rising > 0.85) { s5 *= 0.2; v5 += 0.3 }

  // 3. Blend them based on transitionAmt
  // We blend H, S, and V. Hue blending is usually fine with lerp for small changes.
  var h = h4 + (h5 - h4) * transitionAmt
  var s = 0.95 + (s5 - 0.95) * transitionAmt
  var v = v4 + (v5 - v4) * transitionAmt

  hsv(frac(h), s, clamp(v, 0, 1))
}