// B5 — The Midnight Tide 
var N = 84
var PI2 = PI * 2

// ===== State Variables (Linked to Gauges) =====
export var skyHue = 0.05       // Deep Burnt Orange
export var tideHue = 0.66      // Deep Midnight Navy
export var waveIntensity = 0.4 // 0.0 to 1.0 (Speed/Height)
export var currentMode = 0     // 0: Calm, 1: Storm, 2: Eclipse

// Mapping (7 Rows x 12 Columns)
var pixelToRow = array(N)
var rowData = [
  [ 0, 13, 14, 27, 28, 41, 42, 55, 56, 69, 70, 83],
  [ 1, 12, 15, 26, 29, 40, 43, 54, 57, 68, 71, 82],
  [ 2, 11, 16, 25, 30, 39, 44, 53, 58, 67, 72, 81],
  [ 3, 10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80],
  [ 4,  9, 18, 23, 32, 37, 46, 51, 60, 65, 74, 79],
  [ 5,  8, 19, 22, 33, 36, 47, 50, 61, 64, 75, 78],
  [ 6,  7, 20, 21, 34, 35, 48, 49, 62, 63, 76, 77]
]

for (var r = 0; r < 7; r++) {
  for (var i = 0; i < rowData[r].length; i++) {
    var pIdx = rowData[r][i]; if (pIdx < N) pixelToRow[pIdx] = r
  }
}

// ---------- UI CONTROLS & GAUGES ----------

// These functions provide specific gauge readouts in the UI
export function gaugeIntensity() { return waveIntensity }
export function gaugeMode()      { return currentMode / 2 } // Map 0-2 to 0.0-1.0

// Toggles
export function toggleStorm(v) { 
  if(v) {
    currentMode = (currentMode == 1) ? 0 : 1; 
    waveIntensity = (currentMode == 1) ? 0.85 : 0.4;
  }
}

export function toggleEclipse(v) {
  if(v) {
    currentMode = (currentMode == 2) ? 0 : 2;
    skyHue = (currentMode == 2) ? 0.82 : 0.05; // Purple/Red shift
  }
}

export function toggleWaveSpeed(v) {
  if(v) waveIntensity = frac(waveIntensity + 0.2)
  if(waveIntensity < 0.1) waveIntensity = 0.2
}

export function toggleReset(v) {
  if(v) {
    skyHue = 0.05; 
    tideHue = 0.66; 
    waveIntensity = 0.4; 
    currentMode = 0;
  }
}

var t1, t2
export function beforeRender(delta) {
  // Wave travel speed tied to Intensity Gauge
  t1 = time(0.45 - (waveIntensity * 0.35)) 
  t2 = time(0.8) // Constant slow swell
}

export function render(index) {
  if (index >= N) return
  
  var r = pixelToRow[index]
  var colID = floor(index / 7)
  
  // --- SINE WAVE PHYSICS ---
  var baseHeight = (currentMode == 2) ? 4.8 : 4.2 
  var amplitude = 0.8 + (waveIntensity * 2.2) 
  var waveBoundary = baseHeight + sin(t1 * PI2 + (colID / 3)) * amplitude
  
  var isTide = r >= waveBoundary
  var h, br, s = 1
  
  if (!isTide) {
    // SKY LOGIC
    h = skyHue
    br = (currentMode == 2) ? 0.12 : 0.22 
    // Random star flicker in Eclipse mode
    if (currentMode == 2 && random(1) > 0.992) br = 0.9 
  } else {
    // TIDE LOGIC
    h = tideHue
    var swell = sin(t2 * PI2 + (colID / 6)) * 0.08
    br = 0.1 + swell
    
    // Wave Crest (Whitecap / Foam)
    if (r - waveBoundary < 0.8) {
      br += (currentMode == 1) ? 0.65 : 0.35 
    }
  }

  hsv(h, s, clamp(br, 0, 1))
}