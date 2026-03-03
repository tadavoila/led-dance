// D3 — Thesis Finale (124px Red Edition)
var N = 124
var PI2 = PI * 2

// ===== Fixed Internal Constants (UI Removed) =====
var d3Speed = 0.15, d3Sep = 0.12
var d3Comp0 = 3.0, d3Comp1 = 4.5

// ===== State Variables =====
var d3Hue0 = 0.02  // Default Node 0
var d3Hue1 = 0.08  // Default Node 1
var d3Fire = 0.5   
var d3Agit = 0.02  

// --- Climax State ---
var isClimax = 0
var climaxTimer = 0

// --- Internal Timers ---
var t0, t1

// ---------- Mapping (124 LEDs) ----------
var coordsX = array(N), coordsY = array(N)
var LED_MAP = [
  [ 0,  9, 10, 19, 20, 29, 30, 39], // Top (Rows 0-4)
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],
  [46, 47, 60, 61, 74, 75, 88, 89, 102, 103, 116, 117], // Skirt (Rows 5-11)
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

// ---------- UI CONTROLS & GAUGES ----------
var t_h0U=0, t_h0D=0, t_h1U=0, t_h1D=0, t_fU=0, t_fD=0, t_aU=0, t_aD=0, t_reset=0
var l_h0U=0, l_h0D=0, l_h1U=0, l_h1D=0, l_fU=0, l_fD=0, l_aU=0, l_aD=0, l_reset=0

export function toggleNode0HueUp(v) { t_h0U=v }
export function toggleNode0HueDn(v) { t_h0D=v }
export function toggleNode1HueUp(v) { t_h1U=v }
export function toggleNode1HueDn(v) { t_h1D=v }

export function toggleFireUp(v) { t_fU=v }
export function toggleFireDn(v) { t_fD=v }
export function toggleAgitUp(v) { t_aU=v }
export function toggleAgitDn(v) { t_aD=v }

export function toggleClimax(v) { isClimax = v }
export function toggleReset(v) { t_reset=v }

export function gaugeHueNode0() { return d3Hue0 }
export function gaugeHueNode1() { return d3Hue1 }
export function gaugeFireBalance() { return d3Fire }
export function gaugeAgitation() { return d3Agit * 10 }
export function gaugeClimaxState() { return isClimax }

function onFlip(v, last) { return (v > 0 && last == 0) }
function frac(x) { return x - floor(x) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  if(onFlip(t_h0U, l_h0U)) d3Hue0=frac(d3Hue0+0.05)
  if(onFlip(t_h0D, l_h0D)) d3Hue0=frac(d3Hue0-0.05)
  if(onFlip(t_h1U, l_h1U)) d3Hue1=frac(d3Hue1+0.05)
  if(onFlip(t_h1D, l_h1D)) d3Hue1=frac(d3Hue1-0.05)
  if(onFlip(t_fU, l_fU)) d3Fire=clamp(d3Fire+0.05, 0, 1)
  if(onFlip(t_fD, l_fD)) d3Fire=clamp(d3Fire-0.05, 0, 1)
  if(onFlip(t_aU, l_aU)) d3Agit=clamp(d3Agit+0.01, 0, 0.1)
  if(onFlip(t_aD, l_aD)) d3Agit=clamp(d3Agit-0.01, 0, 0.1)

  if(onFlip(t_reset, l_reset)){
    d3Hue0=0.02; d3Hue1=0.08; d3Fire=0.5; d3Agit=0.02; isClimax = 0
  }

  l_h0U=t_h0U; l_h0D=t_h0D; l_h1U=t_h1U; l_h1D=t_h1D
  l_fU=t_fU; l_fD=t_fD; l_aU=t_aU; l_aD=t_aD; l_reset=t_reset

  t0 = time(d3Speed)
  t1 = frac(t0 + d3Sep) 
  climaxTimer = time(0.1) 
}

export function render(index) {
  if (index >= N) return
  
  // --- 1. CLIMAX OVERRIDE ---
  if (isClimax) {
    var climaxHue = frac(climaxTimer + (index / N)) 
    hsv(climaxHue, 1, 1)
    return
  }

  // --- 2. NORMAL D3 LOGIC ---
  var id = nodeId(); var r = coordsY[index]; var c = coordsX[index]
  var activeT    = (id == 0) ? t0 : t1
  var activeComp = (id == 0) ? d3Comp0 : d3Comp1
  var baseHue    = (id == 0) ? d3Hue0 : d3Hue1
  
  var waveVal = sin(activeT * PI2 + (c * activeComp) + (r * activeComp))
  var jitter = (random(1) < d3Agit) ? (random(1) - 0.5) : 0
  var intensity = clamp((waveVal + 1) / 2 + jitter, 0, 1)

  var h, s, v
  
  if (intensity > (1 - d3Fire)) {
    // FIRE SIDE: Warm orange/red based on your baseHue selection
    h = baseHue + (0.05 * (intensity - (1 - d3Fire))) 
    s = 0.95; v = pow(intensity, 1.5) 
  } else {
    // ACCENT SIDE: Changed from +0.5 (Green) to a solid Red theme
    h = 0.0 // Pure Red accent
    s = 1.0; v = (1 - intensity) * 0.3 
  }

  hsv(frac(h), s, v)
}