// 124px — SYNCHRONIZED SKY & EARTH RINGS (SMOOTH WARMTH)
// Top: Blue to Light Blue (Sky) | Skirt: Green to Yellow
// Uses phase accumulation to prevent speed jumping, and eases color transitions.

var N = 124
var TOP_ROWS = 5, TOP_COLS = 8
var SKIRT_ROWS = 7, SKIRT_COLS = 12
var TOTAL_ROWS = TOP_ROWS + SKIRT_ROWS

// -------------------- Helpers --------------------
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }

// -------------------- Defaults --------------------
var DEF_bgLevel = 0.15
var DEF_warmth  = 0.5     // Starts at 50% gradient

var bgLevel      = DEF_bgLevel
var targetWarmth = DEF_warmth
var warmthCtl    = DEF_warmth
var tMove        = 0

// -------------------- Toggles --------------------
var t_warmUp = 0, t_warmDown = 0, t_reset = 0
var l_warmUp = 0, l_warmDown = 0, l_reset = 0

function onFlip(v, last) { return v != last }

export function toggleWarmthUp(v) { t_warmUp = v }
export function toggleWarmthDown(v) { t_warmDown = v }
export function toggleReset(v) { t_reset = v }

// UI Hook for Warmth - Now outputs the smoothed value
export function gaugeWarmth(){ return warmthCtl }

// -------------------- Internal Mapping --------------------
var pixelT = array(N), pixelY = array(N), ringId = array(N)
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

function buildTY(){
  for (var r = 0; r < TOTAL_ROWS; r++) {
    var rowArr = LED_MAP[r]
    var colsHere = (r < TOP_ROWS) ? TOP_COLS : SKIRT_COLS
    var globalRow = (r < TOP_ROWS) ? (SKIRT_ROWS + r) : (r - TOP_ROWS)
    for (var c = 0; c < colsHere; c++) {
      var idx = rowArr[c]
      pixelT[idx] = (c + 0.5) / colsHere
      pixelY[idx] = globalRow / (TOTAL_ROWS - 1)
      ringId[idx] = globalRow
    }
  }
}
buildTY()

export function beforeRender(delta){
  var step = 0.05
  // Update the TARGET warmth, not the current warmth
  if (onFlip(t_warmUp, l_warmUp)) { l_warmUp = t_warmUp; targetWarmth = clamp(targetWarmth + step, 0, 1) }
  if (onFlip(t_warmDown, l_warmDown)) { l_warmDown = t_warmDown; targetWarmth = clamp(targetWarmth - step, 0, 1) }
  
  if (onFlip(t_reset, l_reset)) {
    l_reset = t_reset
    targetWarmth = DEF_warmth
  }

  // 1. Smoothly glide the warmth value over time to prevent color snapping
  var ease = delta * 0.003
  if (ease > 1) ease = 1
  warmthCtl += (targetWarmth - warmthCtl) * ease

  // 2. Accumulate phase manually to prevent the rings from teleporting when speed changes
  // Pixelblaze time(x) wraps every x * 32768 milliseconds.
  var currentInterval = 0.055 - (warmthCtl * 0.02)
  var periodMs = currentInterval * 32768
  
  tMove = frac(tMove + (delta / periodMs))
}

export function render(index){
  if(index >= N) return
  
  var th = pixelT[index]
  var y = pixelY[index]
  var rid = ringId[index]
  var isTop = (rid >= SKIRT_ROWS)

  var vPos = y * (TOTAL_ROWS - 1)
  var ringMask = pow(1 - abs(vPos - rid), 10) 

  var moveDir = isTop ? -1 : 1
  var head = frac(tMove * moveDir)
  
  var dist = abs(th - head)
  if (dist > 0.5) dist = 1 - dist
  
  var trail = pow(1 - (dist * 2), 1.5)

  // --- COLOR LOGIC ---
  var h
  if (isTop) {
    // TOP (SKY): Deep Blue tail to Light Blue head
    var tailHue = 0.66
    var headHue = mix(0.66, 0.50, warmthCtl) 
    h = mix(tailHue, headHue, trail)
  } else {
    // SKIRT (EARTH): Green tail to Yellow head
    var tailHue = 0.33 
    var headHue = mix(0.33, 0.15, warmthCtl) 
    h = mix(tailHue, headHue, trail)
  }
  
  var headPunch = pow(trail, 15) * 0.5
  
  var bri = (trail + headPunch + bgLevel) * ringMask
  var sat = 1 - (headPunch * 0.8) 

  hsv(h, sat, bri * bri) 
}