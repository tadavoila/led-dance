// E1 — BREATHING ENDING CUE (124px)
// Tops: Light Pink/Red | Skirts: Light Blue | 10s Breathing Pulse
var N = 124

// ---------- State Variables ----------
var vPulse = 1.0 // Global brightness pulse

// ---------- Mapping (124 LEDs) ----------
var coordsY = array(N)
var LED_MAP = [
  [ 0,  9, 10, 19, 20, 29, 30, 39], // Top (Rows 0-4)
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],
  [46, 47, 60, 61, 74, 75, 88, 89, 102, 103, 116, 117], // Skirt (Rows 5-11)
  [45, 48, 59, 62, 73, 76, 87, 90, 101, 104, 115, 118],
  [44, 49, 58, 63, 72, 77, 86, 91, 100, 105, 114, 119],
  [43, 50, 57, 64, 71, 78, 85, 92,  99, 106, 113, 120],
  [42, 51, 56, 65, 70, 79, 84, 93,  98, 107, 112, 121],
  [41, 52, 55, 66, 69, 80, 83, 94,  97, 108, 111, 122],
  [40, 53, 54, 67, 68, 81, 82, 95,  96, 109, 110, 123]
]

function buildMapping() {
  for (var r = 0; r < 12; r++) {
    var rowArr = LED_MAP[r]
    for (var c = 0; c < rowArr.length; c++) {
      var idx = rowArr[c]
      if (idx < N) {
        coordsY[idx] = r / 11 
      }
    }
  }
}
buildMapping()

export function beforeRender(delta) {
  // Breathing logic: Creates a slow, smooth oscillation
  // time(0.15) provides roughly a 10-second cycle
  // wave() returns 0.0 to 1.0, we scale it to 0.8 to 1.0
  vPulse = 0.8 + (0.2 * wave(time(0.15)))
}

export function render(index) {
  if (index >= N) return
  
  // Section-based colors
  if (coordsY[index] < 0.45) {
    // TOPS: Light Red / Pink
    hsv(0.98, 0.8, vPulse)
  } else {
    // SKIRTS: Light Blue
    hsv(0.60, 0.8, vPulse)
  }
}