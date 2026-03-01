// A2 — Night Sky Field (Stage-Enhanced Edition)
// Optimized for 124 LEDs. 
// Focused Controls: Background Level (Down), Star Density (Up), Reset.

var pixelLimit = 124
var DEF_backgroundHue = 0.6 // Deep Midnight Blue
var DEF_backgroundLevel = 0.20
var DEF_starDensity = 0.50

// Fixed Stage Constants
var STAR_HUE = 0.12        // Golden-White stars for better contrast vs blue
var SATURATION = 0.85
var TWINKLE_SPEED = 0.04   // Slower, more majestic twinkle
var NEBULA_SPEED = 0.08    // Speed of the background gas drift

var backgroundHue = DEF_backgroundHue
var backgroundLevel = DEF_backgroundLevel
var starDensity = DEF_starDensity

// Step sizes for buttons
var STEP_LEVEL = 0.04
var STEP_DENS = 0.03

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }
function hash(n){ return frac(sin(n*12.9898)*43758.5453) }

// --- Simplified Toggles (Strictly following request) ---
var t_lvlDown=0, t_denUp=0, t_reset=0
var l_lvlDown=0, l_denUp=0, l_reset=0
function onFlip(v, last){ return (v != last) }

export function toggleBackgroundLevelDown(v){ t_lvlDown = v }
export function toggleStarDensityUp(v){ t_denUp = v }
export function toggleResetDefaults(v){ t_reset = v }

// Gauges
export function gaugeBackgroundLevel(){ return clamp01(backgroundLevel) }
export function gaugeStarDensity(){ return clamp01(starDensity) }

export function beforeRender(delta) {
  // Decrease background brightness
  if(onFlip(t_lvlDown, l_lvlDown)){
    l_lvlDown = t_lvlDown
    backgroundLevel = clamp01(backgroundLevel - STEP_LEVEL)
  }

  // Increase star count
  if(onFlip(t_denUp, l_denUp)){
    l_denUp = t_denUp
    starDensity = clamp01(starDensity + STEP_DENS)
  }

  // Reset to Defaults
  if(onFlip(t_reset, l_reset)){
    l_reset = t_reset
    backgroundLevel = DEF_backgroundLevel
    starDensity = DEF_starDensity
  }

  // Global timers
  t_nebula = time(NEBULA_SPEED)
  t_twinkle = time(TWINKLE_SPEED)
}

export function render3D(index, x, y, z) {
  if(index >= pixelLimit) { rgb(0,0,0); return }

  // 1. NEBULA LAYER (The "Stage Depth" factor)
  // Normalizing Y across the full mapping (-1.0 to 2.5)
  var vPos = (y + 1) / 3.5
  var angle = atan2(z, x)
  
  // Create a moving "cloud" effect using sine waves
  var nebula = 0.5 + 0.5 * sin(angle + sin(vPos * 2 + t_nebula * PI2))
  var nebulaVal = backgroundLevel * (0.2 + 0.8 * nebula)

  // 2. STAR LAYER
  // Unique random seed per pixel
  var r = hash(index * 23.1 + 13)
  var isStar = (r < starDensity) ? 1 : 0
  
  // High-contrast twinkle: Use pow() to make the "sparkle" sharp/short
  var pHash = hash(index * 37.7 + 7)
  var tw = wave(t_twinkle + pHash)
  tw = pow(tw, 6) // Sharper peak makes it look like real twinkling stars

  var starV = isStar * tw * 0.9
  
  // 3. COLOR MIXING
  // Background is deep blue; Stars are shifted toward gold/white for stage pop
  var hue = mix(backgroundHue, STAR_HUE, starV)
  var sat = mix(SATURATION, 0.2, starV) // Desaturate stars to make them "white-hot"
  var finalV = clamp01(nebulaVal + starV)

  hsv(frac(hue), sat, finalV)
}