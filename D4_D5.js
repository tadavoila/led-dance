// D4_D5: THERMAL CRESCENDO (124px Master Merge)
var N = 124
var PI2 = PI * 2

// ===== Default Constants =====
var DEF_d4Speed = 0.35, DEF_d4Width = 0.35
var DEF_d4H1 = 0.66, DEF_d4Int = 0.8
var DEF_d5Speed = 0.12, DEF_d5Turb = 0.8, DEF_d5Hue = 0.98, DEF_d5Int = 1.3
var FADE_SPEED = 0.001 

// ===== State Variables =====
var isSunrise = 0 
var transitionAmt = 0 
var d4Speed = DEF_d4Speed, d4Width = DEF_d4Width, d4Hue = DEF_d4H1, d4Int = DEF_d4Int
var d5Speed = DEF_d5Speed, d5Turb = DEF_d5Turb, d5Hue = DEF_d5Hue, d5Int = DEF_d5Int

var pulseAccum = 0, t_convection = 0

// ---------- Mapping (124 LEDs) ----------
var coordsX = array(N), coordsY = array(N)
var LED_MAP = [
  [ 0,  9, 10, 19, 20, 29, 30, 39], // Top (0-4)
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],
  [46, 47, 60, 61, 74, 75, 88, 89, 102, 103, 116, 117], // Skirt (5-11)
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

function getWave(v) { return (sin(v * PI2) + 1) / 2 }

// ---------- UI CONTROLS & GAUGES ----------
var t_d4hU=0, t_d4hD=0, t_d4iU=0, t_d4iD=0
var t_d5sU=0, t_d5sD=0, t_d5tU=0, t_d5tD=0, t_d5hU=0, t_d5hD=0, t_d5iU=0, t_d5iD=0, t_reset=0
var l_d4hU=0, l_d4hD=0, l_d4iU=0, l_d4iD=0
var l_d5sU=0, l_d5sD=0, l_d5tU=0, l_d5tD=0, l_d5hU=0, l_d5hD=0, l_d5iU=0, l_d5iD=0, l_reset=0

export function toggleSunrise(v) { isSunrise = v }
export function toggleHueUp(v) { t_d4hU=v }
export function toggleHueDn(v) { t_d4hD=v }
export function toggleIntUp(v) { t_d4iU=v }
export function toggleIntDn(v) { t_d4iD=v }

export function toggleD5HueUp(v) { t_d5hU=v }
export function toggleD5HueDn(v) { t_d5hD=v }
export function toggleD5IntUp(v) { t_d5iU=v }
export function toggleD5IntDn(v) { t_d5iD=v }
export function toggleReset(v) { t_reset = v }

export function gaugeD4_Hue() { return d4Hue }
export function gaugeD5_Hue() { return d5Hue }
export function gaugeD5_Int() { return d5Int / 2 }
export function gaugeTransition() { return transitionAmt }

function onFlip(v, last) { return (v > 0.5 && last <= 0.5) }
function frac(x) { return x - floor(x) }
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

  // UI Processing
  if(onFlip(t_d4hU, l_d4hU)) d4Hue = frac(d4Hue + 0.05)
  if(onFlip(t_d4hD, l_d4hD)) d4Hue = frac(d4Hue - 0.05)
  if(onFlip(t_d4iU, l_d4iU)) d4Int = clamp(d4Int + 0.1, 0, 1)
  if(onFlip(t_d4iD, l_d4iD)) d4Int = clamp(d4Int - 0.1, 0, 1)
  
  if(onFlip(t_d5sU, l_d5sU)) d5Speed=clamp(d5Speed-0.02, 0.02, 1)
  if(onFlip(t_d5sD, l_d5sD)) d5Speed=clamp(d5Speed+0.02, 0.02, 1)
  if(onFlip(t_d5tU, l_d5tU)) d5Turb=clamp(d5Turb+0.1, 0.1, 3)
  if(onFlip(t_d5tD, l_d5tD)) d5Turb=clamp(d5Turb-0.1, 0.1, 3)
  if(onFlip(t_d5hU, l_d5hU)) d5Hue=frac(d5Hue+0.05)
  if(onFlip(t_d5hD, l_d5hD)) d5Hue=frac(d5Hue-0.05)
  if(onFlip(t_d5iU, l_d5iU)) d5Int=clamp(d5Int+0.1, 0.1, 2)
  if(onFlip(t_d5iD, l_d5iD)) d5Int=clamp(d5Int - 0.1, 0.1, 2)

  if(onFlip(t_reset, l_reset)){
    d4Hue=DEF_d4H1; d4Int=DEF_d4Int;
    d5Speed=DEF_d5Speed; d5Turb=DEF_d5Turb; d5Hue=DEF_d5Hue; d5Int=DEF_d5Int; transitionAmt = 0;
  }
  
  l_d4hU=t_d4hU; l_d4hD=t_d4hD; l_d4iU=t_d4iU; l_d4iD=t_d4iD
  l_d5sU=t_d5sU; l_d5sD=t_d5sD; l_d5tU=t_d5tU; l_d5tD=t_d5tD; l_d5hU=t_d5hU; l_d5hD=t_d5hD; l_d5iU=t_d5iU; l_d5iD=t_d5iD
  l_reset=t_reset
}

export function render(index) {
  var r = coordsY[index]; var c = coordsX[index]
  
  // 1. D4 Ripple (Fixed aggressive speed/width)
  var dx = (c - 0.5), dy = (r - 0.5)
  var dist = sqrt(dx*dx + dy*dy) 
  var waveVal = getWave(dist * (1/d4Width) - pulseAccum)
  var h4, v4
  if (index % 2 == 0) {
    h4 = d4Hue; v4 = pow(waveVal, 3) * d4Int
  } else {
    h4 = d4Hue + 0.5; v4 = pow(1 - waveVal, 3) * (d4Int * 0.8)
  }

  // 2. D5 Sunrise Convection (Lead-in to E1)
  var swirl = sin(t_convection * PI2 + (c * 2)) * d5Turb
  var rising = getWave(t_convection - r + (swirl * 0.2))
  
  var h5 = mix(0.98, 0.60, r) // Pink Top to Blue Skirt
  var s5 = 0.8 // FIXED AT 0.8 as requested
  var v5 = pow(rising, 1.2) * d5Int 

  // Light Red Sunrise Peaks (instead of white)
  if (rising > 0.75) { 
    h5 = 1.0; // PURE RED HUE
    s5 = 0.8; // KEEPING SATURATION AT 0.8
    v5 += 0.4; 
  }

  // 3. Blend
  var h = h4 + (h5 - h4) * transitionAmt
  var s = 0.95 + (s5 - 0.95) * transitionAmt
  var v = v4 + (v5 - v4) * transitionAmt

  hsv(frac(h), s, clamp(v * v, 0, 1))
}