// A1 — Twilight Ripples (Smooth Wave Edition)
// Controls: Base Hue Up/Down, Reset.

var pixelLimit = 124
var DEF_baseHue = 0.74
var DEF_accentHue = 0.56
var DEF_rippleScale = 0.80

var DEF_rippleSpeed = 0.10
var DEF_diagonalSlope = 0.30
var SAT_MAX = 0.9   

var baseHue = DEF_baseHue
var accentHue = DEF_accentHue
var rippleScale = DEF_rippleScale
var rippleSpeed = DEF_rippleSpeed
var diagonalSlope = DEF_diagonalSlope
var saturation = 0.9

var STEP_HUE = 0.01

// ---------- Syncable "buttons" (toggles) ----------
var t_baseHueUp = 0, t_baseHueDown = 0, t_reset = 0
var l_baseHueUp = 0, l_baseHueDown = 0, l_reset = 0

function onFlip(v, last){ return (v != last) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }
function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }

// UI Controls
export function toggleBaseHueUp(v){ t_baseHueUp = v }
export function toggleBaseHueDown(v){ t_baseHueDown = v }
export function toggleResetDefaults(v){ t_reset = v }

// Gauges
export function gaugeBaseHue(){ return frac(baseHue) }

export function beforeRender(delta) {
  // Edge-detect for Hue adjustments
  if(onFlip(t_baseHueUp, l_baseHueUp)){ 
    l_baseHueUp = t_baseHueUp; 
    baseHue = frac(baseHue + STEP_HUE) 
  }
  if(onFlip(t_baseHueDown, l_baseHueDown)){ 
    l_baseHueDown = t_baseHueDown; 
    baseHue = frac(baseHue - STEP_HUE) 
  }

  // Reset logic
  if(onFlip(t_reset, l_reset)){
    l_reset = t_reset
    baseHue = DEF_baseHue
    accentHue = DEF_accentHue
    rippleScale = DEF_rippleScale
  }
  
  // Create a smooth oscillating time variable (0 to 1 and back)
  // This removes the "jump" at the end of the time cycle
  t1 = wave(time(rippleSpeed))
  t2 = wave(time(rippleSpeed * 1.3))
}

export function render3D(index, x, y, z) {
  if (index >= pixelLimit) { rgb(0,0,0); return }

  // Normalize Y: Your map goes roughly from -1.0 (Skirt) to 2.5 (Top)
  var verticalPos = (y + 1.0) / 3.5 
  
  // Get the angle in radians
  var angle = atan2(z, x)
  
  // WAVE LOGIC: 
  // Instead of frac(), we use sin() of the coordinates. 
  // This makes the transition across the "seam" perfectly smooth.
  
  // Wave 1: A vertical oscillation that breathes in and out
  var w1 = sin(angle + (verticalPos * 5 * rippleScale) + (t1 * PI2))
  
  // Wave 2: A diagonal sway that moves back and forth
  var w2 = cos(angle - (verticalPos * 3) + (t2 * PI2))
  
  // Combine waves for organic movement
  var waveMix = 0.5 + 0.5 * (0.6 * w1 + 0.4 * w2)

  // Color Application
  var hue = mix(baseHue, accentHue, waveMix)
  
  // Sharpen the wave peaks for a "shimmer" effect
  var value = 0.10 + 0.7 * pow(waveMix, 2.0)

  hsv(frac(hue), SAT_MAX, clamp01(value))
}