// 124px — B5 Spectral Starfields (Adapted for 124px)
// Top: 40px (5 rows x 8 cols) | Skirt: 84px (7 rows x 12 cols)
// Midnight blue pulses shoot UP against snakes moving DOWN.

var N = 124
var PI2 = PI * 2

// ===== Default States =====
var DEF_galaxy = 0.66  // Midnight Blue
var DEF_snake = 0.16   // Orange/Yellow
var numSnakes = 4      
var multiHueOn = 1     
var snakeLength = 12   
var motionSpeed = 0.25 

var galaxyHue = DEF_galaxy
var snakeHue = DEF_snake

// ---------- Internal Mapping ----------
var pixelT = array(N)   // Horizontal column coordinate (0-1)
var globalRow = array(N) // Row Index (0 at Top, 11 at Bottom)
var colID = array(N)    // Actual column index per section

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
        pixelT[idx] = c / cols
        globalRow[idx] = r
        colID[idx] = c
      }
    }
  }
}
buildMapping()

// ---------- UI Controls ----------
var t_galUp=0, t_snkUp=0, t_cntUp=0, t_cntDn=0, t_reset=0
var l_galUp=0, l_snkUp=0, l_cntUp=0, l_cntDn=0, l_reset=0

export function toggleGalaxyHueUp(v){ t_galUp = v }
export function toggleSnakeHueUp(v){ t_snkUp = v }
export function toggleNumSnakesUp(v){ t_cntUp = v }
export function toggleNumSnakesDown(v){ t_cntDn = v }
export function toggleReset(v){ t_reset = v }
export function toggleMultiHue(v) { multiHueOn = v }

// Gauges
export function gaugeGalaxyHue() { return galaxyHue }
export function gaugeSnakeHue() { return snakeHue }
export function gaugeNumSnakes() { return numSnakes / 12 }
export function gaugeSpeed() { return motionSpeed }

function onFlip(v, last){ return (v != last) }
function frac(x) { return x - floor(x) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

var t1, t_nebula, t_twinkle
export function beforeRender(delta) {
  // Logic for Hue and Count Toggles
  if(onFlip(t_galUp, l_galUp)){ l_galUp=t_galUp; galaxyHue = frac(galaxyHue + 0.05) }
  if(onFlip(t_snkUp, l_snkUp)){ l_snkUp=t_snkUp; snakeHue = frac(snakeHue + 0.05) }
  
  if(onFlip(t_cntUp, l_cntUp)){ l_cntUp=t_cntUp; numSnakes = clamp(numSnakes + 1, 1, 12) }
  if(onFlip(t_cntDn, l_cntDn)){ l_cntDn=t_cntDn; numSnakes = clamp(numSnakes - 1, 1, 12) }

  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; 
    galaxyHue = DEF_galaxy; snakeHue = DEF_snake;
    numSnakes = 4; multiHueOn = 1
  }

  t1 = time(motionSpeed)
  t_nebula = time(0.4) 
  t_twinkle = time(0.01)
}

export function render(index) {
  if (index >= N) return
  
  var h, s, v
  var rID = globalRow[index]
  var cID = colID[index]
  var th = pixelT[index]
  var isEvenCol = (cID % 2 == 0)

  var isSnake = false
  var snakeBrightness = 0
  var activeHue = snakeHue
  var chaseInColumn = false 

  // 1. Multiple Snake Logic
  // Snakes travel based on horizontal column phase
  for (var sN = 0; sN < numSnakes; sN++) {
    var snakeOffset = sN / numSnakes
    var headPos = frac(t1 + snakeOffset)
    
    // We check if the head is near this pixel's horizontal slice
    if (abs(th - headPos) < 0.05) chaseInColumn = true
    
    // Body logic using index distance for variety
    var dist = (index - floor(headPos * N) + N) % N
    if (dist < snakeLength) {
      isSnake = true
      var localBright = 1.0 - (dist / snakeLength)
      if (localBright > snakeBrightness) {
        snakeBrightness = localBright
        activeHue = multiHueOn ? frac(snakeHue + (sN * 0.08)) : snakeHue
      }
    }
  }

  // 2. Fighter Back Logic (Brighter Midnight Pulse)
  var fighterVal = 0
  if (isEvenCol && chaseInColumn) {
    // Pulse shoots UP: Higher row ID (bottom) to Lower row ID (top)
    // Row 11 is bottom, Row 0 is top.
    fighterVal = pow(rID / 11, 2) * (0.6 + 0.4 * sin(t_twinkle * PI2 * 8))
  }

  if (isSnake) {
    // Combine Snake with Fighter pulse
    h = mix(activeHue, galaxyHue, fighterVal * 0.4)
    s = 0.7
    v = pow(snakeBrightness, 2) + fighterVal
  } else {
    // Brighter Galaxy Background
    var nebulaWave = sin(t_nebula * PI2 + (index / 10) + (th * PI2))
    h = galaxyHue + (0.04 * nebulaWave)
    s = 0.85
    
    var starDensity = 0.96
    var starBase = (random(1) > starDensity) ? (0.5 + random(0.5)) : 0
    // Increased base brightness for the galaxy (0.12 instead of 0.08)
    v = starBase + (0.12 * (0.5 + 0.5 * nebulaWave)) + (fighterVal * 0.4)
  }

  hsv(frac(h), s, clamp(v, 0, 1))
}