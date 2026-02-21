// B2 — Happiness Thinning
// Effect: 3 Thick Yellow-Green ripples shooting through a desaturating Green base.
// Controls: Ripple Speed, Base Green Hue, Ripple Hue, Decay (Blur).

var N = 84
var W = 12
var H = 7
var pi2 = PI * 2

var DEF_baseHue = 0.33      // Standard Green
var DEF_rippleHue = 0.18    // Yellow-Green
var DEF_speed = 0.4 
var DEF_blur = 0.5          
var DEF_bgLevel = 0.05

var baseHue = DEF_baseHue
var rippleHue = DEF_rippleHue
var speedCtl = DEF_speed
var blurCtl = DEF_blur
var bgLevel = DEF_bgLevel
var reverse = 0

var STEP_HUE = 0.01
var STEP_SPEED = 0.05
var STEP_BLUR = 0.05

var dir_speed = 1, dir_blur = 1

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }

// --- Mapping: Physical Index -> XY Coordinates ---
var pixelX = array(N)
var pixelY = array(N)
for (var i = 0; i < N; i++) {
  var c = floor(i / H)
  var r = i % H
  if (c % 2 == 1) r = (H - 1) - r
  pixelX[i] = c / (W - 1)
  pixelY[i] = r / (H - 1)
}

// ---------- Syncable Toggles & Gauges ----------
var t_baseUp=0, t_baseDown=0, t_ripUp=0, t_ripDown=0, t_spdUp=0, t_spdDown=0, t_blurUp=0, t_blurDown=0, t_reverse=0, t_reset=0
var l_baseUp=0, l_baseDown=0, l_ripUp=0, l_ripDown=0, l_spdUp=0, l_spdDown=0, l_blurUp=0, l_blurDown=0, l_reverse=0, l_reset=0

function onFlip(v, last){ return (v != last) }

export function toggleBaseGreenUp(v){ t_baseUp = v }
export function toggleBaseGreenDown(v){ t_baseDown = v }
export function toggleRippleHueUp(v){ t_ripUp = v }
export function toggleRippleHueDown(v){ t_ripDown = v }
export function toggleSpeedUp(v){ t_spdUp = v }
export function toggleSpeedDown(v){ t_spdDown = v }
export function toggleDecayUp(v){ t_blurUp = v }        
export function toggleDecayDown(v){ t_blurDown = v }    
export function toggleReverse(v){ t_reverse = v }
export function toggleResetDefaults(v){ t_reset = v }

export function gaugeBaseGreen(){ return frac(baseHue) } 
export function gaugeRippleHue(){ return frac(rippleHue) } 
export function gaugeSpeed(){ return clamp01(speedCtl) }
export function gaugeDecay(){ return clamp01(blurCtl) }

function bounce(val, step, lo, hi, dir, sign){
  val += sign * step * dir
  if(val > hi){ val = hi; dir = -1 }
  if(val < lo){ val = lo; dir =  1 }
  return [val, dir]
}

export function beforeRender(delta) {
  if(onFlip(t_baseUp, l_baseUp)){ l_baseUp=t_baseUp; baseHue = frac(baseHue + STEP_HUE) }
  if(onFlip(t_baseDown, l_baseDown)){ l_baseDown=t_baseDown; baseHue = frac(baseHue - STEP_HUE) }
  if(onFlip(t_ripUp, l_ripUp)){ l_ripUp=t_ripUp; rippleHue = frac(rippleHue + STEP_HUE) }
  if(onFlip(t_ripDown, l_ripDown)){ l_ripDown=t_ripDown; rippleHue = frac(rippleHue - STEP_HUE) }
  
  if(onFlip(t_spdUp, l_spdUp)){ l_spdUp=t_spdUp; var r = bounce(speedCtl, STEP_SPEED, 0, 1, dir_speed, +1); speedCtl=r[0]; dir_speed=r[1] }
  if(onFlip(t_spdDown, l_spdDown)){ l_spdDown=t_spdDown; var r = bounce(speedCtl, STEP_SPEED, 0, 1, dir_speed, -1); speedCtl=r[0]; dir_speed=r[1] }
  
  if(onFlip(t_blurUp, l_blurUp)){ l_blurUp=t_blurUp; var r = bounce(blurCtl, STEP_BLUR, 0, 1, dir_blur, +1); blurCtl=r[0]; dir_blur=r[1] }
  if(onFlip(t_blurDown, l_blurDown)){ l_blurDown=t_blurDown; var r = bounce(blurCtl, STEP_BLUR, 0, 1, dir_blur, -1); blurCtl=r[0]; dir_blur=r[1] }
  
  if(onFlip(t_reverse, l_reverse)){ l_reverse=t_reverse; reverse = 1 - reverse }
  
  if(onFlip(t_reset, l_reset)){
    l_reset=t_reset; baseHue = DEF_baseHue; rippleHue = DEF_rippleHue; speedCtl = DEF_speed
    blurCtl = DEF_blur; bgLevel = DEF_bgLevel; reverse = 0; dir_speed = 1; dir_blur = 1
  }

  // Time base for the 3 ripples
  t1 = time(0.15 * speedCtl)
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }

  var x = pixelX[index]
  var y = pixelY[index]

  // Create 3 thick ripples using a triangle wave multiplied by 3
  // The y*0.3 adds the "shooting star" diagonal tilt
  var rippleSource = frac((x * 1) + (reverse ? t1 : -t1) - (y * 0.3))
  
  // triangle(3 * rippleSource) creates exactly 3 peaks across the width
  var spark = triangle(frac(3 * rippleSource))
  
  // Decay/Thickness math
  // Low blur = thin lines, High blur = thick ripples
  var thickness = mix(12, 2, blurCtl)
  var v = pow(spark, thickness)

  // Desaturating Green Story
  // The background green (baseHue) gets grey-ish as it goes up the tree
  var desatBase = mix(0.9, 0.4, y)
  
  // Coloring
  var h = mix(baseHue, rippleHue, v)
  var s = mix(desatBase, 0.9, v) // Ripples bring back saturation
  
  // Skirt fade: The top rows decay faster than the bottom rows
  var bri = mix(bgLevel, 1, v)
  bri *= mix(1, 0.6, y) 

  hsv(h, s, bri)
}