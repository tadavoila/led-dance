// A1 — Twilight Ripples (SHARED controls via Node/Sync)
// Buttons implemented as TOGGLES (syncable), edge-detected to act like momentary presses.
// First 84 pixels only.

var isOn = 0 // Default set to Off
var DEF_baseHue = 0.74
var DEF_accentHue = 0.56
var DEF_rippleScale = 0.80

// Keep these fixed (no toggles)
var DEF_rippleSpeed = 0.10
var DEF_diagonalSlope = 0.30

// Saturation is fixed + capped (no toggles)
var DEF_saturation = 0.9
var SAT_MAX = 0.9   

var baseHue = DEF_baseHue
var accentHue = DEF_accentHue
var rippleScale = DEF_rippleScale

var rippleSpeed = DEF_rippleSpeed
var diagonalSlope = DEF_diagonalSlope

var saturation = DEF_saturation

var STEP_HUE = 0.01
var STEP_SCALE = 0.05

// bounce dir (shared)
var dir_rippleScale = 1

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function clamp(x,a,b){ return x < a ? a : (x > b ? b : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }

function bounce(val, step, lo, hi, dir, sign){
  val += sign * step * dir
  if(val > hi){ val = hi; dir = -1 }
  if(val < lo){ val = lo; dir =  1 }
  return [val, dir]
}

// ---------- Syncable "buttons" (toggles) ----------
var t_baseHueUp=0, t_baseHueDown=0, t_accentHueUp=0, t_accentHueDown=0
var t_sclUp=0, t_sclDown=0
var t_reset=0

// last states for edge detect
var l_baseHueUp=0, l_baseHueDown=0, l_accentHueUp=0, l_accentHueDown=0
var l_sclUp=0, l_sclDown=0
var l_reset=0

function onFlip(v, last){ return (v != last) }

// Export toggles (these appear in UI; Sync propagates them)
export function toggleOnOff(v) { isOn = v } 
export function toggleBaseHueUp(v){ t_baseHueUp = v }
export function toggleBaseHueDown(v){ t_baseHueDown = v }
export function toggleAccentHueUp(v){ t_accentHueUp = v }
export function toggleAccentHueDown(v){ t_accentHueDown = v }

export function toggleRippleScaleUp(v){ t_sclUp = v }
export function toggleRippleScaleDown(v){ t_sclDown = v }

export function toggleResetDefaults(v){ t_reset = v }
export function toggleVisibility(v){ }

// Edge-detect presses once per tap (runs on BOTH skirts because the toggle input is synced)
export function beforeRender(delta){
  if(onFlip(t_baseHueUp, l_baseHueUp)){ l_baseHueUp = t_baseHueUp; baseHue = frac(baseHue + STEP_HUE) }
  if(onFlip(t_baseHueDown, l_baseHueDown)){ l_baseHueDown = t_baseHueDown; baseHue = frac(baseHue - STEP_HUE) }
  if(onFlip(t_accentHueUp, l_accentHueUp)){ l_accentHueUp = t_accentHueUp; accentHue = frac(accentHue + STEP_HUE) }
  if(onFlip(t_accentHueDown, l_accentHueDown)){ l_accentHueDown = t_accentHueDown; accentHue = frac(accentHue - STEP_HUE) }

  if(onFlip(t_sclUp, l_sclUp)){
    l_sclUp = t_sclUp
    var r = bounce(rippleScale, STEP_SCALE, 0, 1, dir_rippleScale, +1); rippleScale=r[0]; dir_rippleScale=r[1]
  }
  if(onFlip(t_sclDown, l_sclDown)){
    l_sclDown = t_sclDown
    var r = bounce(rippleScale, STEP_SCALE, 0, 1, dir_rippleScale, -1); rippleScale=r[0]; dir_rippleScale=r[1]
  }

  if(onFlip(t_reset, l_reset)){
    l_reset = t_reset
    baseHue = DEF_baseHue
    accentHue = DEF_accentHue
    rippleScale = DEF_rippleScale

    rippleSpeed = DEF_rippleSpeed
    diagonalSlope = DEF_diagonalSlope

    saturation = DEF_saturation
    dir_rippleScale = 1
  }
}

// Gauges
export function gaugeBaseHue(){ return frac(baseHue) }
export function gaugeAccentHue(){ return frac(accentHue) }
export function gaugeRippleScale(){ return clamp01(rippleScale) }

export function render3D(index, x, y, z){
  // Check for Off state or index limit
  if(!isOn || index >= 84){ rgb(0,0,0); return }

  var verticalPos = clamp((y + 1)/2, 0, 1)
  var anglePos = frac((atan2(z, x)/PI2) + 1)
  var diag = frac(anglePos + diagonalSlope * verticalPos)

  var t = time(rippleSpeed)

  var w1 = sin(PI2 * (t + diag * (1.0 + 2.0*rippleScale)))
  var w2 = sin(PI2 * (t*0.7 + verticalPos*(0.8 + 2.2*rippleScale) - anglePos*0.5))
  var waveMix = 0.5 + 0.5*(0.65*w1 + 0.35*w2)

  var hue = mix(baseHue, accentHue, waveMix)
  var value = 0.10 + 0.65*pow(waveMix, 1.6)

  var satUse = min(saturation, SAT_MAX)
  hsv(frac(hue), satUse, clamp01(value))
}