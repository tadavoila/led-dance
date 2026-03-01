// 124px — B5 The Midnight Tide (Grouped Sunset Edition)
// Group 1: 30-39 & 40-60 (Sunset Red)
// Group 2: 20-29 & 61-81 (Burnt Orange)
// Group 3: 10-19 & 82-102 (Twilight Purple)
// Group 4: 0-9 & 103-123 (Evening Pink)
// Effect: Automatic oscillating blend, custom Navy order, pulsing yellow stars, and "Shooting" Navy Shimmer.

var N = 124
var PI2 = PI * 2

// ---------- State Variables ----------
var blendFactor = 0 // Oscillates automatically 0.0 <-> 1.0
var tideLevel = 0   // 0 to 5 (Gradual Navy Takeover sequence)
var shimmerStrength = 0 // Temporary decay factor for the shooting surge

// ---------- Internal Mapping ----------
var groupID = array(N)
var pixelT = array(N) // Horizontal column coordinate (0-1)

var LED_MAP = [
  // --- TOP (5 rows, 8 cols) ---
  [ 0,  9, 10, 19, 20, 29, 30, 39],
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],

  // --- SKIRT (7 rows, 12 cols) ---
  [46, 47, 60, 61, 74, 75, 88, 89,102,103,116,117],
  [45, 48, 59, 62, 73, 76, 87, 90,101,104,115,118],
  [44, 49, 58, 63, 72, 77, 86, 91,100,105,114,119],
  [43, 50, 57, 64, 71, 78, 85, 92, 99,106,113,120],
  [42, 51, 56, 65, 70, 79, 84, 93, 98,107,112,121],
  [41, 52, 55, 66, 69, 80, 83, 94, 97,108,111,122],
  [40, 53, 54, 67, 68, 81, 82, 95, 96,109,110,123],
]

function buildMapping() {
  for (var r = 0; r < 12; r++) {
    var rowArr = LED_MAP[r]
    var cols = (r < 5) ? 8 : 12 
    for (var c = 0; c < cols; c++) {
      var idx = rowArr[c]
      if (idx < N) {
        pixelT[idx] = c / cols // 0 to 1 around the cylinder
        
        // Group Logic
        if ((idx >= 30 && idx <= 39) || (idx >= 40 && idx <= 60)) {
          groupID[idx] = 1 // Red
        } else if ((idx >= 20 && idx <= 29) || (idx >= 61 && idx <= 81)) {
          groupID[idx] = 2 // Orange
        } else if ((idx >= 10 && idx <= 19) || (idx >= 82 && idx <= 102)) {
          groupID[idx] = 3 // Purple
        } else if ((idx >= 0 && idx <= 9) || (idx >= 103 && idx <= 123)) {
          groupID[idx] = 4 // Pink
        }
      }
    }
  }
}
buildMapping()

// ---------- UI CONTROLS & GAUGES ----------
var t_tideU=0, l_tideU=0
var t_tideD=0, l_tideD=0
var t_reset=0, l_reset=0

export function toggleTideUp(v) { t_tideU = v }
export function toggleTideDown(v) { t_tideD = v }
export function toggleReset(v) { t_reset = v }

export function gaugeBlendProgress() { return blendFactor }
export function gaugeTideLevel() { return tideLevel / 4 }
export function gaugeShimmer() { return shimmerStrength }

// ---------- Helpers ----------
function onFlip(v, last){ return (v != last) }
function frac(x) { return x - floor(x) }
function mix(a, b, t) { return a + (b - a) * t }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t1, tGlow, tStar, tShoot
export function beforeRender(delta) {
  // Pronounced Blend Animation: Using a shaped wave so it dwells at the ends
  var rawWave = triangle(time(0.2)) 
  blendFactor = clamp((rawWave - 0.2) * 1.66, 0, 1) // Creates a plateau at 0 and 1

  if (onFlip(t_tideU, l_tideU)) { 
    l_tideU = t_tideU; 
    tideLevel = clamp(tideLevel + 1, 0, 4);
    shimmerStrength = 1.0; 
  }
  if (onFlip(t_tideD, l_tideD)) { 
    l_tideD = t_tideD; 
    tideLevel = clamp(tideLevel - 1, 0, 4);
    shimmerStrength = 1.0; 
  }

  if (shimmerStrength > 0) {
    shimmerStrength = clamp(shimmerStrength - (delta / 8000), 0, 1) 
  }

  if (onFlip(t_reset, l_reset)) {
    l_reset = t_reset
    tideLevel = 0
    shimmerStrength = 0
  }

  t1 = time(0.12)       
  tGlow = time(0.4)     
  tStar = time(0.08)    
  tShoot = time(0.06) 
}

export function render(index) {
  if (index >= N) return
  
  var gid = groupID[index]
  var th = pixelT[index]
  var h, s, v = 1.0
  
  var hDrift = sin(tGlow * PI2 + gid) * 0.02

  // --- 1. CALCULATE GRADIENT COLORS ---
  var t = (index < 40) ? (index / 39) : (1 - (index - 40) / 83)
  
  var gradH, gradS
  if (t < 0.33) {
    var localT = t / 0.33
    gradH = mix(0.92, 0.78, localT)
    gradS = mix(0.70, 0.85, localT)
  } else if (t < 0.66) {
    var localT = (t - 0.33) / 0.33
    gradH = mix(0.78, 1.0, localT) 
    gradS = mix(0.85, 1.0, localT)
  } else {
    var localT = (t - 0.66) / 0.34
    gradH = mix(0.0, 0.12, localT) // Expanded reach to golden yellow
    gradS = 1.0
  }

  // --- 2. CALCULATE SOLID COLORS ---
  var solidH, solidS
  if (gid == 1) {
    solidH = 0.0; solidS = 1.0 
  } else if (gid == 2) {
    solidH = 0.08; solidS = 1.0 
  } else if (gid == 3) {
    solidH = 0.78; solidS = 0.85 
  } else if (gid == 4) {
    solidH = 0.92; solidS = 0.75 
  }

  // --- 3. BLEND ---
  // To make it more pronounced, we slightly shift saturation during blend
  h = mix(solidH + hDrift, gradH + hDrift, blendFactor)
  s = mix(solidS, gradS, blendFactor) * mix(1.0, 0.85, sin(blendFactor * PI))

  // --- 4. PULSE ---
  var pulse = (sin(t1 * PI2 + (gid * 0.8)) + 1) / 2
  v *= mix(0.5, 1.0, pulse)
  s = clamp(s * mix(0.8, 1.0, pulse), 0, 1)

  // --- 5. MIDNIGHT NAVY TAKEOVER ---
  var isNavy = false
  if (tideLevel >= 1 && gid == 2) isNavy = true
  if (tideLevel >= 2 && gid == 1) isNavy = true
  if (tideLevel >= 3 && gid == 4) isNavy = true
  if (tideLevel >= 4 && gid == 3) isNavy = true
  if (tideLevel >= 5) isNavy = true

  if (isNavy) {
    h = 0.66
    s = 1.0
    v = 0.08 + pulse * 0.22 // Deeper, more active pulse

    // Pulsing Yellow Stars
    var starSeed = frac(sin(index * 123.456) * 437.58)
    if (starSeed > 0.80) { 
      var starPulse = (sin(tStar * PI2 + index * 12) + 1) / 2
      h = 0.15 
      s = 0.5
      v = 0.1 + starPulse * 0.85 
    }
  }

  // --- 6. SHOOTING MIDNIGHT GRADIENT SHIMMER ---
  var shootWave = pow((sin(th * PI2 * 2 - tShoot * PI2) + 1) / 2, 8) 
  var shimmerEffect = shootWave * (0.3 + shimmerStrength * 0.7)
  
  if (shimmerEffect > 0.05) {
    var shimmerHue = mix(0.60, 0.72, sin(th * PI2 + tShoot * PI2))
    h = mix(h, shimmerHue, shimmerEffect)
    s = mix(s, 1.0, shimmerEffect)
    v = clamp(v + shimmerEffect * 0.6, 0, 1)
  }

  hsv(frac(h), s, v)
}