// A4 — Multi-Strand Horizontal Helix Drop Chase (12x7 VERTICAL SERPENTINE)
// Mapping: Physically wired in snaked columns (0, 13, 14, 27...)
// Effect: Horizontal spiral that wraps 12px then drops 1 row.

var N = 84
var W = 12
var H = 7

var DEF_accentHue = 0.42 
var DEF_speed = 0.4 
var DEF_density = 0.5   // Renamed from strands
var DEF_blur = 0.4      // Renamed from tail
var DEF_bgLevel = 0.04

var accentHue = DEF_accentHue
var speedCtl = DEF_speed
var densityCtl = DEF_density
var blurCtl = DEF_blur
var bgLevel = DEF_bgLevel
var reverse = 0

var STEP_HUE = 0.01
var STEP_SPEED = 0.05
var STEP_DENSITY = 0.05
var STEP_BLUR = 0.05

var dir_speed = 1, dir_density = 1, dir_blur = 1

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }

// --- Mapping: Physical Index -> Virtual Row-by-Row Path ---
function getPathPos(i) {
  var c = floor(i / H)
  var r = i % H
  if (c % 2 == 1) r = (H - 1) - r 
  return (r * W + c) / N 
}

// ---------- Syncable Toggles & Gauges ----------
var t_hueUp=0, t_hueDown=0, t_spdUp=0, t_spdDown=0, t_denUp=0, t_denDown=0, t_blurUp=0, t_blurDown=0, t_reverse=0, t_reset=0
var l_hueUp=0, l_hueDown=0, l_spdUp=0, l_spdDown=0, l_denUp=0, l_denDown=0, l_blurUp=0, l_blurDown=0, l_reverse=0, l_reset=0

function onFlip(v, last){ return (v != last) }

export function toggleAccentHueUp(v){ t_hueUp = v }
export function toggleAccentHueDown(v){ t_hueDown = v }
export function toggleSpeedUp(v){ t_spdUp = v }
export function toggleSpeedDown(v){ t_spdDown = v }
export function toggleDensityUp(v){ t_denUp = v }      // Renamed
export function toggleDensityDown(v){ t_denDown = v }  // Renamed
export function toggleBlurUp(v){ t_blurUp = v }        // Renamed
export function toggleBlurDown(v){ t_blurDown = v }    // Renamed
export function toggleReverse(v){ t_reverse = v }
export function toggleResetDefaults(v){ t_reset = v }

export function gaugeAccentHue(){ return frac(accentHue) }
export function gaugeSpeed(){ return clamp01(speedCtl) }
export function gaugeDensity(){ return clamp01(densityCtl) } // Renamed
export function gaugeBlur(){ return clamp01(blurCtl) }       // Renamed

function bounce(val, step, lo, hi, dir, sign){
  val += sign * step * dir
  if(val > hi){ val = hi; dir = -1 }
  if(val < lo){ val = lo; dir =  1 }
  return [val, dir]
}

export function beforeRender(delta){
  if(onFlip(t_hueUp, l_hueUp)){ l_hueUp=t_hueUp; accentHue = frac(accentHue + STEP_HUE) }
  if(onFlip(t_hueDown, l_hueDown)){ l_hueDown=t_hueDown; accentHue = frac(accentHue - STEP_HUE) }
  
  if(onFlip(t_spdUp, l_spdUp)){ l_spdUp=t_spdUp; var r = bounce(speedCtl, STEP_SPEED, 0, 1, dir_speed, +1); speedCtl=r[0]; dir_speed=r[1] }
  if(onFlip(t_spdDown, l_spdDown)){ l_spdDown=t_spdDown; var r = bounce(speedCtl, STEP_SPEED, 0, 1, dir_speed, -1); speedCtl=r[0]; dir_speed=r[1] }
  
  if(onFlip(t_denUp, l_denUp)){ l_denUp=t_denUp; var r = bounce(densityCtl, STEP_DENSITY, 0, 1, dir_density, +1); densityCtl=r[0]; dir_density=r[1] }
  if(onFlip(t_denDown, l_denDown)){ l_denDown=t_denDown; var r = bounce(densityCtl, STEP_DENSITY, 0, 1, dir_density, -1); densityCtl=r[0]; dir_density=r[1] }
  
  if(onFlip(t_blurUp, l_blurUp)){ l_blurUp=t_blurUp; var r = bounce(blurCtl, STEP_BLUR, 0, 1, dir_blur, +1); blurCtl=r[0]; dir_blur=r[1] }
  if(onFlip(t_blurDown, l_blurDown)){ l_blurDown=t_blurDown; var r = bounce(blurCtl, STEP_BLUR, 0, 1, dir_blur, -1); blurCtl=r[0]; dir_blur=r[1] }
  
  if(onFlip(t_reverse, l_reverse)){ l_reverse=t_reverse; reverse = 1 - reverse }
  
  if(onFlip(t_reset, l_reset)){
    l_reset=t_reset; accentHue = DEF_accentHue; speedCtl = DEF_speed; densityCtl = DEF_density
    blurCtl = DEF_blur; bgLevel = DEF_bgLevel; reverse = 0; dir_speed = 1; dir_density = 1; dir_blur = 1
  }

  t1 = time(0.1 / (0.05 + speedCtl * 0.5))
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }

  var p = getPathPos(index)
  // Density determines number of strands
  var nStrands = 1 + floor(densityCtl * H)
  var spacing = 1 / H 
  // Blur determines tail length
  var tailLen = 0.05 + (blurCtl * 0.6)
  
  var vSum = 0
  for (var s = 0; s < nStrands; s++) {
    var head = frac(reverse ? (t1 + s * spacing) : (1 - (t1 + s * spacing)))
    var d = p - head
    if (d < 0) d += 1
    
    if (d < tailLen) {
      var pulse = 1 - (d / tailLen)
      vSum += pulse * pulse
    }
  }

  var v = clamp01(vSum)
  var bgHue = 0.66
  var finalHue = mix(bgHue, accentHue, v)
  hsv(frac(finalHue), 0.98, mix(bgLevel, 1, v))
}