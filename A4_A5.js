// A4/A5 — Kinetic Nova & Power Streams (Stage Overdrive)
// Palette: Customizable Trail Hue, Light Yellow Sparks, Light Blue Wash

var pixelLimit = 124
var bgLevel = 0.12          
var DEF_accentHue = 0.12   

// Performance
var dropSpeed = 0.8        
var streamSpeed = 1.25     
var numCols = 12            

var accentHue = DEF_accentHue
var hyperDrive = 0         
var a5Density = 0.5        
var washTimer = 0          
var STEP_HUE = 0.02        

function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }
function hash(n){ return frac(sin(n*12.9898)*43758.5453) }

// ---------- Syncable Toggles & Gauges ----------
var t_a5 = 0, t_hueUp = 0, t_hueDown = 0, t_reset = 0
var l_a5 = 0, l_hueUp = 0, l_hueDown = 0, l_reset = 0

export function toggleA5(v){ t_a5 = v } 
export function toggleAccentHueUp(v){ t_hueUp = v }
export function toggleAccentHueDown(v){ t_hueDown = v }
export function toggleResetDefaults(v){ t_reset = v }

export function gaugeHyperDrive(){ return hyperDrive }
export function gaugeAccentHue(){ return frac(accentHue) }

function onFlip(v, last){ return (v != last) }

export function beforeRender(delta) {
  if(onFlip(t_a5, l_a5)){ 
    l_a5 = t_a5; 
    hyperDrive = 1 - hyperDrive;
    if (hyperDrive) washTimer = 2.0; 
  }
  
  if(onFlip(t_hueUp, l_hueUp)){ l_hueUp = t_hueUp; accentHue = frac(accentHue + STEP_HUE) }
  if(onFlip(t_hueDown, l_hueDown)){ l_hueDown = t_hueDown; accentHue = frac(accentHue - STEP_HUE) }

  if (washTimer > 0) {
    washTimer -= delta / 2000; 
    if (washTimer < 0) washTimer = 0;
  }

  if(onFlip(t_reset, l_reset)){ 
    l_reset = t_reset; hyperDrive = 0; accentHue = DEF_accentHue; washTimer = 0 
  }

  t_drop = time(0.1 / dropSpeed)
  t_stream = time(0.08 / streamSpeed)
  t_flicker = time(0.0005) 
}

export function render3D(index, x, y, z) {
  if (index >= pixelLimit) { rgb(0,0,0); return }

  var yNorm = (y + 1.0) / 3.5
  var anglePos = (atan2(z, x) / PI2) + 0.5 
  
  var vSum = 0
  var sparkSum = 0

  // 1. GENERATE EFFECT
  if (!hyperDrive) {
    // --- MODE A4: HELIX DROP ---
    var p = yNorm + (anglePos * 0.15)
    var nStrands = 3
    for (var s = 0; s < nStrands; s++) {
      var head = frac(1.0 - (t_drop + s/nStrands))
      var d = head - p
      if (d < 0) d += 1 
      if (d < 0.3) {
        vSum += pow(1 - (d/0.3), 1.5)
        if (d < 0.05) sparkSum += (1 - (d/0.05))
      }
    }
  } else if (washTimer <= 0.6) { 
    // --- MODE A5: HIGH-SPEED GLITCH STREAMS ---
    var dynamicCols = 4 + floor(a5Density * 20)
    var colID = floor(anglePos * dynamicCols)
    var head = frac(t_stream + (colID * 0.618))
    var d = head - yNorm
    if (d < 0) d += 1
    if (d < 0.4) {
      var glitch = 0.4 + 0.6 * hash(index + t_flicker)
      vSum += pow(1 - (d/0.4), 2) * glitch
      if (d < 0.08) sparkSum += (1 - (d/0.08))
    }
  }

  // 2. COLOR MIXING
  var v = clamp01(vSum)
  var spark = clamp01(sparkSum)
  var wash = pow(washTimer / 2, 1.5)
  
  var bgHue = 0.58 
  var sparkHue = 0.14 
  
  // DUAL-MODE ACCENT LOGIC
  // A4 uses a high threshold (0.12) for less accent. 
  // A5 uses a low threshold (0.04) so the accent is way more prominent.
  var hueThreshold = hyperDrive ? 0.04 : 0.12
  var finalHue = (v > hueThreshold) ? accentHue : bgHue
  
  finalHue = mix(finalHue, sparkHue, spark)
  
  var finalSat = mix(0.75, 1.0, v)
  finalSat = mix(finalSat, 0.25, spark)
  
  var finalVal = mix(bgLevel, 1, v + (spark * 1.5))
  
  // 3. MORE SPARKLY WASH TRANSITION
  if (wash > 0) {
    // Sparkle Density increased: Threshold dropped from 0.5 to 0.3
    var sparkle = hash(index + t_flicker) > 0.3 ? 1 : 0
    // Sparks are now 2x as bright for extra "crunch"
    finalVal = clamp01(finalVal + wash + (sparkle * wash * 2))
    finalSat = mix(finalSat, 0.4, wash) 
  }
  
  hsv(frac(finalHue), finalSat, finalVal)
}