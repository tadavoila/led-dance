// A2 — Night Sky Field (SHARED controls via Node/Sync)
// Buttons implemented as TOGGLES (syncable), edge-detected.
// First 84 pixels only.
// Cuts: no Twinkle Speed controls, no Star Hue controls, no Saturation controls.

var DEF_backgroundHue = 0.64
var DEF_backgroundLevel = 0.18
var DEF_starDensity = 0.18

// fixed look constants
var STAR_HUE = 0.72
var SATURATION = 0.90
var TWINKLE_SPEED = 0.06

var backgroundHue = DEF_backgroundHue
var backgroundLevel = DEF_backgroundLevel
var starDensity = DEF_starDensity

var STEP_HUE = 0.01
var STEP_LEVEL = 0.02
var STEP_DENS = 0.02

var dir_backgroundLevel = 1
var dir_starDensity = 1

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function clamp(x,a,b){ return x < a ? a : (x > b ? b : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }
function hash(n){ return frac(sin(n*12.9898)*43758.5453) }

function bounce(val, step, lo, hi, dir, sign){
  val += sign * step * dir
  if(val > hi){ val = hi; dir = -1 }
  if(val < lo){ val = lo; dir =  1 }
  return [val, dir]
}

// syncable toggles
var t_hueUp=0, t_hueDown=0, t_lvlUp=0, t_lvlDown=0, t_denUp=0, t_denDown=0, t_reset=0
var l_hueUp=0, l_hueDown=0, l_lvlUp=0, l_lvlDown=0, l_denUp=0, l_denDown=0, l_reset=0
function onFlip(v, last){ return (v != last) }

export function toggleBackgroundHueUp(v){ t_hueUp = v }
export function toggleBackgroundHueDown(v){ t_hueDown = v }
export function toggleBackgroundLevelUp(v){ t_lvlUp = v }
export function toggleBackgroundLevelDown(v){ t_lvlDown = v }
export function toggleStarDensityUp(v){ t_denUp = v }
export function toggleStarDensityDown(v){ t_denDown = v }
export function toggleResetDefaults(v){ t_reset = v }

export function beforeRender(delta){
  if(onFlip(t_hueUp, l_hueUp)){ l_hueUp=t_hueUp; backgroundHue = frac(backgroundHue + STEP_HUE) }
  if(onFlip(t_hueDown, l_hueDown)){ l_hueDown=t_hueDown; backgroundHue = frac(backgroundHue - STEP_HUE) }

  if(onFlip(t_lvlUp, l_lvlUp)){
    l_lvlUp=t_lvlUp
    var r = bounce(backgroundLevel, STEP_LEVEL, 0, 1, dir_backgroundLevel, +1); backgroundLevel=r[0]; dir_backgroundLevel=r[1]
  }
  if(onFlip(t_lvlDown, l_lvlDown)){
    l_lvlDown=t_lvlDown
    var r = bounce(backgroundLevel, STEP_LEVEL, 0, 1, dir_backgroundLevel, -1); backgroundLevel=r[0]; dir_backgroundLevel=r[1]
  }

  if(onFlip(t_denUp, l_denUp)){
    l_denUp=t_denUp
    var r = bounce(starDensity, STEP_DENS, 0, 1, dir_starDensity, +1); starDensity=r[0]; dir_starDensity=r[1]
  }
  if(onFlip(t_denDown, l_denDown)){
    l_denDown=t_denDown
    var r = bounce(starDensity, STEP_DENS, 0, 1, dir_starDensity, -1); starDensity=r[0]; dir_starDensity=r[1]
  }

  if(onFlip(t_reset, l_reset)){
    l_reset=t_reset
    backgroundHue = DEF_backgroundHue
    backgroundLevel = DEF_backgroundLevel
    starDensity = DEF_starDensity
    dir_backgroundLevel = 1
    dir_starDensity = 1
  }
}

// Gauges
export function gaugeBackgroundHue(){ return frac(backgroundHue) }
export function gaugeBackgroundLevel(){ return clamp01(backgroundLevel) }
export function gaugeStarDensity(){ return clamp01(starDensity) }

export function render3D(index, x, y, z){
  if(index >= 84){ rgb(0,0,0); return }

  var verticalPos = clamp((y + 1)/2, 0, 1)
  var baseV = backgroundLevel * (0.35 + 0.65*verticalPos)

  var r = hash(index*19 + 7)
  var isStar = (r < starDensity) ? 1 : 0

  var t = time(TWINKLE_SPEED)
  var tw = 0.5 + 0.5*sin(PI2*(t + hash(index*31+9)))
  tw = pow(tw, 2.2)

  var starV = isStar * tw * 0.85
  var hue = mix(backgroundHue, STAR_HUE, starV)
  var sat = mix(SATURATION, 0.15, starV)
  var value = clamp01(baseV + starV)

  hsv(frac(hue), sat, value)
}
