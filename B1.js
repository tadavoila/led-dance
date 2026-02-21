// B1 — Park Walk (False Spring)
// Effect: Mirrored horizontal drift with organic leaf-like waves.
// Theme: Sunshine yellow highlights over fresh greens and sky blues.

var N = 84
var W = 12
var H = 7
var pi2 = PI * 2

var DEF_accentHue = 0.12    // Warm Sunshine Yellow
var DEF_speed = 0.3 
var DEF_density = 0.4       // Wave frequency
var DEF_blur = 0.6          // Smoothness of the color blending
var DEF_bgLevel = 0.1

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
var t_hueUp=0, t_hueDown=0, t_spdUp=0, t_spdDown=0, t_denUp=0, t_denDown=0, t_blurUp=0, t_blurDown=0, t_reverse=0, t_reset=0
var l_hueUp=0, l_hueDown=0, l_spdUp=0, l_spdDown=0, l_denUp=0, l_denDown=0, l_blurUp=0, l_blurDown=0, l_reverse=0, l_reset=0

function onFlip(v, last){ return (v != last) }

export function toggleWarmthUp(v){ t_hueUp = v }
export function toggleWarmthDown(v){ t_hueDown = v }
export function toggleDriftSpeedUp(v){ t_spdUp = v }
export function toggleDriftSpeedDown(v){ t_spdDown = v }
export function toggleDensityUp(v){ t_denUp = v }      
export function toggleDensityDown(v){ t_denDown = v }  
export function toggleBlurUp(v){ t_blurUp = v }        
export function toggleBlurDown(v){ t_blurDown = v }    
export function toggleReverse(v){ t_reverse = v }
export function toggleResetDefaults(v){ t_reset = v }

export function gaugeWarmth(){ return frac(accentHue) } 
export function gaugeDriftSpeed(){ return clamp01(speedCtl) }
export function gaugeDensity(){ return clamp01(densityCtl) }
export function gaugeBlur(){ return clamp01(blurCtl) }

function bounce(val, step, lo, hi, dir, sign){
  val += sign * step * dir
  if(val > hi){ val = hi; dir = -1 }
  if(val < lo){ val = lo; dir =  1 }
  return [val, dir]
}

export function beforeRender(delta) {
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

  // Soft beat pulse: rhythmic brightness breathing
  beatPulse = triangle(time(0.1)) 
  
  // Oscillators for horizontal and vertical drift
  t1 = time(0.2 * speedCtl) 
  t2 = time(0.15 * speedCtl)
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }

  var x = pixelX[index]
  var y = pixelY[index]

  // Mirrored motion: Patterns move from center outward
  var xM = abs(x - 0.5) * 2
  
  // Interference pattern creates "leaf-like" shapes
  var freq = 1 + (densityCtl * 6)
  var wave = sin((xM * freq) + (reverse ? -t1 : t1) * pi2) * cos((y * freq) + t2 * pi2)
  
  // Smooth the wave into soft pulses
  var v = clamp01((wave + 1) / 2)
  v = pow(v, 3 - blurCtl * 2) // Blur adjusts the "softness" of the edges

  // Color Palette: Sky Blue top (0.6), Fresh Green bottom (0.33)
  var baseHue = mix(0.33, 0.6, y) 
  // Add Sunshine (Accent) based on wave peaks
  var finalHue = mix(baseHue, accentHue, v)

  // Brightness: Wave peaks + rhythmic pulse
  var bri = mix(bgLevel, 1, v) * (0.7 + 0.3 * beatPulse)

  hsv(frac(finalHue), 0.75, bri)
}