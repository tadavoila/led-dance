// 124px — B2 HAPPINESS THINNING (SMOOTH WAVES EDITION)
// Top (0-39, 40px): Smooth, flowing, intersecting yellow/orange waves.
// Skirt (40-123, 84px): Tighter, dynamic intersecting yellow/orange waves.
// Controls: Gauge & Toggle UI only.

var N = 124
var TOP_COUNT = 40   // 5 rows * 8 cols
var SKIRT_COUNT = 84 // 7 rows * 12 cols
var TOTAL_ROWS = 12

// -------------------- Smooth Wave Defaults --------------------
var DEF_TOP_HUE = 0.15 // Golden Yellow
var DEF_BOT_HUE = 0.04 // Deep Orange
var DEF_SPEED   = 0.5  

var topHue = DEF_TOP_HUE
var botHue = DEF_BOT_HUE
var hueOffset = 0
var tMove = 0

// -------------------- UI Controls --------------------
var t_hueUp=0, l_hueUp=0
var t_hueDown=0, l_hueDown=0
var t_reset=0, l_reset=0

// Toggles: Flip to trigger
export function toggleHueUp(v) { t_hueUp = v }
export function toggleHueDown(v) { t_hueDown = v }
export function toggleReset(v) { t_reset = v }

// Gauges: Visual feedback for the current palette
export function gaugeYellowHue() { return topHue }
export function gaugeOrangeHue() { return botHue }
export function gaugeEffectSpeed() { return DEF_SPEED }

// -------------------- Internal Mapping --------------------
var pixelT = array(N), pixelY = array(N)

// Build coordinates specifically for the 40/84 split
function buildTY() {
  for (var i = 0; i < N; i++) {
    if (i < TOP_COUNT) {
      // Top Mapping (8 columns, 5 rows) [Indices 0-39]
      var r = floor(i / 8)
      var c = i % 8
      pixelT[i] = c / 8
      pixelY[i] = r / TOTAL_ROWS
    } else {
      // Skirt Mapping (12 columns, 7 rows) [Indices 40-123]
      var i2 = i - TOP_COUNT
      var r = floor(i2 / 12) + 5 // Offset Y by the 5 top rows
      var c = i2 % 12
      pixelT[i] = c / 12
      pixelY[i] = r / TOTAL_ROWS
    }
  }
}
buildTY()

// -------------------- Helpers --------------------
function frac(x) { return x - floor(x) }
function mix(a, b, t) { return a + (b - a) * t }
function clamp(val, min, max) { return val < min ? min : (val > max ? max : val) }

// -------------------- Render Loop --------------------
export function beforeRender(delta) {
  // Logic for Hue Increment Toggles (Shifts both palettes up or down smoothly)
  if (t_hueUp != l_hueUp) {
    l_hueUp = t_hueUp
    hueOffset = frac(hueOffset + 0.1) // Bump hue up by 10%
  }
  if (t_hueDown != l_hueDown) {
    l_hueDown = t_hueDown
    hueOffset = frac(hueOffset - 0.1 + 1) // Bump hue down by 10%
  }

  // Logic for Reset Toggle
  if (t_reset != l_reset) {
    l_reset = t_reset
    hueOffset = 0
  }

  // Calculate current hues based on steps
  topHue = frac(DEF_TOP_HUE + hueOffset)
  botHue = frac(DEF_BOT_HUE + hueOffset)

  // Global time progressions - sped up slightly to suit the sine waves
  tMove += (delta * 0.002 * DEF_SPEED)
}

export function render(index) {
  if (index >= N) return

  var th = pixelT[index]
  var y = pixelY[index]
  
  // Convert angle (0-1) to Radians (0-6.28) for smooth sine math around the cylinder
  var thRad = th * 6.28318
  
  // Fixed logic: Indices 0-39 are Top, 40-123 are Skirt
  var isTop = (index < TOP_COUNT)
  
  var h, s, bri, wYellow, wOrange
  
  if (isTop) {
    // --- TOP (CAP): Smooth, wide undulating waves ---
    // Wobble creates the "wavy" up-and-down rings
    var wobble = sin(thRad * 1) * 1.0 
    
    // Yellow wave moves UP (-tMove), Orange wave moves DOWN (+tMove)
    // They tilt in opposite directions (+/- wobble) so they visibly cross
    wYellow = (sin(y * 18 + wobble - tMove * 3.0) + 1) / 2
    wOrange = (sin(y * 18 - wobble + tMove * 3.5) + 1) / 2
    
    // Smooth power curve for soft glowing bands
    wYellow = pow(wYellow, 1.5)
    wOrange = pow(wOrange, 1.5)
    
  } else {
    // --- BOTTOM (SKIRT): Tighter, more dynamic crossing waves ---
    var wobble = sin(thRad * 2) * 1.2 // 2 lobes for a more complex weave
    
    wYellow = (sin(y * 25 + wobble - tMove * 4.0) + 1) / 2
    wOrange = (sin(y * 25 - wobble + tMove * 4.5) + 1) / 2
    
    wYellow = pow(wYellow, 1.5)
    wOrange = pow(wOrange, 1.5)
  }

  // --- BLENDING BACKGROUND WAVES ---
  // Determine which background wave is currently stronger at this pixel
  var ratio = wOrange / (wYellow + wOrange + 0.0001)
  
  // Blend the base yellow and orange smoothly based on the ratio
  var baseMix = mix(DEF_TOP_HUE, DEF_BOT_HUE, ratio)
  h = frac(baseMix + hueOffset) 
  
  // Keep it richly saturated, but slightly drop saturation where the waves cross for a brighter "hotspot"
  s = mix(1.0, 0.7, wYellow * wOrange)
  
  // Additive brightness: waves combine to create a bright glow where they intersect
  bri = (wYellow + wOrange) * 0.55 + 0.1

  // --- DUAL-COLOR BOUNCING SCANNER WAVE ---
  // Calculate a focal point that sweeps up and down smoothly between 0 and 1
  var yFocus = (sin(tMove * 1.5) + 1) / 2
  
  // Measure the distance of the current pixel's Y from the focal point
  var dist = abs(y - yFocus)
  
  // Create a soft band of light. Max() ensures it doesn't drop below 0. 
  // Multiplying by 4.0 makes the wave narrower (it covers about 1/4 of the height).
  var wScanner = max(0, 1.0 - dist * 4.0)
  wScanner = pow(wScanner, 1.5) // Soften the leading/trailing edges of the scanner wave
  
  // Choose scanner color based on section: Light Blue (0.55) for Top, Pink (0.88) for Skirt
  var scannerHue = isTop ? 0.55 : 0.88
  
  // Blend the scanner wave over the existing colors
  h = mix(h, scannerHue, wScanner) 
  s = mix(s, 0.4, wScanner)        // Desaturate slightly so the color is bright and neon
  bri = bri + wScanner * 1.2       // Additive brightness override for a strong glowing effect

  hsv(h, clamp(s, 0, 1), clamp(bri, 0, 1))
}