// C1 — Spectral Starfields: Fighter Back
// Midnight blue pulses shoot up against snakes moving down.

var N = 84
var PI2 = PI * 2

// ===== Default States =====
var DEF_galaxy = 0.66  
var DEF_snake = 0.16   
var numSnakes = 3      
var multiHueOn = 1     
var snakeLength = 10   
var motionSpeed = 0.3  

var galaxyHue = DEF_galaxy
var snakeHue = DEF_snake

// ---------- UI Controls ----------
var t_galUp=0, t_snkUp=0, t_reset=0
var l_galUp=0, l_snkUp=0, l_reset=0

export function toggleGalaxyHueUp(v){ t_galUp = v }
export function toggleSnakeHueUp(v){ t_snkUp = v }
export function toggleReset(v){ t_reset = v }
export function sliderNumChases(v) { numSnakes = 1 + floor(v * 9) }
export function toggleMultiHue(v) { multiHueOn = v }

function onFlip(v, last){ return (v != last) }

export function beforeRender(delta) {
  if(onFlip(t_galUp, l_galUp)){ l_galUp=t_galUp; galaxyHue = frac(galaxyHue + 0.02) }
  if(onFlip(t_snkUp, l_snkUp)){ l_snkUp=t_snkUp; snakeHue = frac(snakeHue + 0.02) }

  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; 
    galaxyHue = DEF_galaxy; snakeHue = DEF_snake;
    numSnakes = 3; multiHueOn = 1
  }

  t1 = time(motionSpeed)
  t_nebula = time(0.4) 
  t_twinkle = time(0.01)
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }
  
  var skirtId = nodeId()
  var h, s, v
  
  // 1. Grid Logic
  // Based on your 1-2-3... wiring, every 7 pixels is a column
  var colID = floor(index / 7)
  var isEvenCol = (colID % 2 == 0) // Even columns move DOWN (0->6)
  var rowID = isEvenCol ? (index % 7) : (6 - (index % 7))
  
  var isSnake = false
  var snakeBrightness = 0
  var activeHue = snakeHue
  var chaseInColumn = false // Track if a snake is in this specific column

  // 2. Multiple Snake Logic
  var skirtOffset = (skirtId == 0) ? 0 : 0.5
  
  for (var sN = 0; sN < numSnakes; sN++) {
    var snakeOffset = sN / numSnakes
    var head = floor(frac(t1 + skirtOffset + snakeOffset) * N)
    
    // Check if snake head/body is in this column
    if (floor(head / 7) == colID) chaseInColumn = true
    
    var dist = (head - index + N) % N
    if (dist < snakeLength) {
      isSnake = true
      var localBright = 1.0 - (dist / snakeLength)
      if (localBright > snakeBrightness) {
        snakeBrightness = localBright
        activeHue = multiHueOn ? frac(snakeHue + (sN * 0.04)) : snakeHue
      }
    }
  }

  // 3. Fighter Back Logic (Midnight Pulse)
  var fighterVal = 0
  // Only trigger on columns where the chase is moving DOWN
  if (isEvenCol && chaseInColumn) {
    // Pulse shoots UP: Row 6 (bottom) has highest value, Row 0 has lowest
    // We animate it so it ripples upward against the snake
    fighterVal = pow(rowID / 6, 2) * (0.5 + 0.5 * sin(t_twinkle * PI2 * 10))
  }

  if (isSnake) {
    // Combine Snake with Fighter pulse (clashing colors)
    h = mix(activeHue, galaxyHue, fighterVal * 0.5)
    s = 0.6
    v = pow(snakeBrightness, 2) + fighterVal
  } else {
    // Galaxy Background
    var nebulaWave = sin(t_nebula * PI2 + (index / 8))
    h = galaxyHue + (0.05 * nebulaWave)
    s = 0.9
    
    var starDensity = 0.97
    var starBase = (random(1) > starDensity) ? (0.4 + random(0.5)) : 0.01
    v = starBase + (0.08 * (0.5 + 0.5 * nebulaWave)) + (fighterVal * 0.3)
  }

  hsv(frac(h), s, clamp(v, 0, 1))
}