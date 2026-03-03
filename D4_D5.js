// D4_D5: TURBO THERMAL CRESCENDO (124px)
var N = 124
var PI2 = PI * 2

// ===== Fixed Performance Constants =====
var d4Speed = 0.35, d4Width = 0.35
var d5Speed = 0.12, d5Hue = 0.98
var d5Int = 2.0         // HARD-CODED HIGH INTENSITY
var FADE_SPEED = 0.001 

// ===== State Variables =====
var isSunrise = 0 
var transitionAmt = 0 
var turbo = 0.5         // Turbo Gauge (0 to 1)
var d4Hue = 0.66, d4Int = 0.8

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
var t_d4hU=0, t_d4hD=0, t_tuU=0, t_tuD=0, t_h1U=0, t_h1D=0, t_reset=0
var l_d4hU=0, l_d4hD=0, l_tuU=0, l_tuD=0, l_h1U=0, l_h1D=0, l_reset=0

export function toggleSunrise(v) { isSunrise = v }
export function toggleD4HueUp(v) { t_d4hU=v }
export function toggleD4HueDn(v) { t_d4hD=v }

export function toggleTurboUp(v) { t_tuU=v } // Controls wave thickness
export function toggleTurboDn(v) { t_tuD=v }

export function toggleD5HueUp(v) { t_h1U=v }
export function toggleD5HueDn(v) { t_h1D=v }
export function toggleReset(v) { t_reset = v }

export function gaugeD4_Hue() { return d4Hue }
export function gaugeTurbo() { return turbo }
export function gaugeD5_Hue() { return d5Hue }
export function gaugeTransition() { return transitionAmt }

function onFlip(v, last) { return (v > 0.5 && last <= 0.5) }
function frac(x) { return x - floor(x) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  pulseAccum = frac(pulseAccum + (delta/1000 * d4Speed))
  t_convection = time(d5Speed)

  // --- AUTOMATED CROSS-FADE ---
  if (isSunrise && transitionAmt < 1) {
    transitionAmt = clamp(transitionAmt + (delta * FADE_SPEED), 0, 1)
  } else if (!isSunrise && transitionAmt > 0) {
    transitionAmt = clamp(transitionAmt - (delta * FADE_SPEED), 0, 1)
  }

  // UI Processing
  if(onFlip(t_d4hU, l_d4hU)) d4Hue = frac(d4Hue + 0.05)
  if(onFlip(t_d4hD, l_d4hD)) d4Hue = frac(d4Hue - 0.05)
  
  if(onFlip(t_tuU, l_tuU)) turbo = clamp(turbo + 0.1, 0, 1)
  if(onFlip(t_tuD, l_tuD)) turbo = clamp(turbo - 0.1, 0, 1)
  
  if(onFlip(t_h1U, l_h1U)) d5Hue = frac(d5Hue + 0.05)
  if(onFlip(t_h1D, l_h1D)) d5Hue = frac(d5Hue - 0.05)

  if(onFlip(t_reset, l_reset)){ d4Hue=0.66; d5Hue=0.98; turbo=0.5; transitionAmt = 0; }
  
  l_d4hU=t_d4hU; l_d4hD=t_d4hD; l_tuU=t_tuU; l_tuD=t_tuD; l_h1U=t_h1U; l_h1D=t_h1D; l_reset=t_reset
}

export function render(index) {
  var r = coordsY[index]; var c = coordsX[index]
  
  // 1. D4 Ripple (Base layer)
  var dx = (c - 0.5), dy = (r - 0.5)
  var dist = sqrt(dx*dx + dy*dy) 
  var waveVal = getWave(dist * (1/d4Width) - pulseAccum)
  var h4, v4
  if (index % 2 == 0) {
    h4 = d4Hue; v4 = pow(waveVal, 2.5) * d4Int
  } else {
    h4 = d4Hue + 0.5; v4 = pow(1 - waveVal, 2.5) * (d4Int * 0.8)
  }

  // 2. D5 Sunrise (TURBO LOGIC)
  var swirl = sin(t_convection * PI2 + (c * 2)) * 0.6
  var risingRaw = getWave(t_convection - r + (swirl * 0.2))
  
  // TURBO: Plateaus the wave so more LEDs stay on.
  // We multiply the wave and clamp it. High Turbo = Thick bars of light.
  var risingThick = clamp(risingRaw * (1.1 + turbo * 2.0), 0, 1)
  
  var h5 = mix(d5Hue, 0.60, r) 
  var s5 = 0.8 
  
  // Brightness: Includes a base floor so LEDs never go fully black
  var v5 = (0.2 + risingThick * 0.8) * d5Int 

  // Aggressive Red Flare
  if (risingRaw > (0.8 - turbo * 0.2)) { 
    h5 = 1.0;     // Pure Red
    v5 += 0.5; 
  }

  // 3. Master Blend
  var h = h4 + (h5 - h4) * transitionAmt
  var s = 0.95 + (s5 - 0.95) * transitionAmt
  var v = v4 + (v5 - v4) * transitionAmt

  hsv(frac(h), s, clamp(v * v, 0, 1))
}