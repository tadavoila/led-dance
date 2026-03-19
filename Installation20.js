// 124 LEDs (Top & Single Skirt) - FULL 20-PATTERN INSTALLATION
// Sequence: A1->A2->A3->A4->A5->B1->B2->B3->B4->B5->C1->C2->C3->C4->C5->D1->D2->D3->D4->D5
// Timing: 30 Seconds each, Hard Cuts. Auto-loops infinitely.

var pixelLimit = 124
var PATTERN_TIME = 30.0 
var PI2 = PI * 2

// --- A Variables ---
var baseHue = 0.74, accentHue = 0.56, rippleScale = 0.80, rippleSpeed = 0.10, SAT_MAX = 0.9
var backgroundHue = 0.6, starDensity = 0.50, STAR_HUE = 0.12, SATURATION = 0.85, TWINKLE_SPEED = 0.04, NEBULA_SPEED = 0.08    
var a4_bgLevel = 0.12, a4_accentHue = 0.12, a4_dropSpeed = 0.8, a4_streamSpeed = 1.25, a5_density = 0.5
// --- B Variables ---
var b1_bgLevel = 0.15, b1_warmthCtl = 0.5, b1_tMove = 0
var b2_topHue = 0.15, b2_botHue = 0.04, b2_speed = 0.5, b2_tMove = 0
var b3_topHue = 0.60, b3_sktHue = 0.38, b4_odHue = 0.15, b3_tMove = 0
var b5_blendFactor = 0, b5_shimmerStrength = 0, b5_tGlow, b5_tShoot
// --- C Variables ---
var c1_galaxy = 0.66, c1_snake = 0.16, c1_numSnakes = 4, c1_snakeLength = 12
var c1_t1, c1_tNeb, c1_tTwink
var c2_top0 = 0.83, c2_skt0 = 0.55, c2_crazy = 0.5, c2_pWidth = 3
var c2_tScan, c2_tRain, c2_tOsc
var c3_h0 = 0.66, c3_crazy = 0.4, c3_pWidth = 3
var c3_tVortex, c3_tRain, c3_tGlitch
var c4_sprout0 = 0.33, c4_growth0 = 0.4, c4_sprout1 = 0.16, c4_growth1 = 0.4
var c4_glitchHue = 0
var c4_tW0, c4_tW1, c4_tDrift, c4_tRot, c4_tGlitch
// --- D Variables ---
var d1_tFire, d1_tFlicker, d1_tPulse, d1_tWindOsc
var d3Speed = 0.15, d3Comp0 = 3.0, d3Hue0 = 0.02, d3Fire = 0.5, d3Agit = 0.02, d3_t0
var d4Speed = 0.35, d4Width = 0.35, d5Speed = 0.12, d5Hue = 0.98, d5Int = 2.0, FADE_SPEED = 0.001
var d4Hue = 0.66, d4Int = 0.8, turbo = 0.5, transitionAmt = 0, pulseAccum = 0, t_convection = 0

// --- Global Mapping ---
var TOP_ROWS = 5, TOP_COLS = 8
var SKIRT_ROWS = 7, SKIRT_COLS = 12
var TOTAL_ROWS = TOP_ROWS + SKIRT_ROWS

var pixelT = array(pixelLimit), pixelY = array(pixelLimit)
var ringId = array(pixelLimit), groupID = array(pixelLimit)
var colID = array(pixelLimit), coordsX = array(pixelLimit), coordsY = array(pixelLimit)

var LED_MAP = [
  [ 0,  9, 10, 19, 20, 29, 30, 39],
  [ 1,  8, 11, 18, 21, 28, 31, 38],
  [ 2,  7, 12, 17, 22, 27, 32, 37],
  [ 3,  6, 13, 16, 23, 26, 33, 36],
  [ 4,  5, 14, 15, 24, 25, 34, 35],
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
      if (idx < pixelLimit) {
        pixelT[idx] = (c + 0.5) / colsHere
        pixelY[idx] = globalRow / (TOTAL_ROWS - 1)
        ringId[idx] = globalRow
        colID[idx] = c
        coordsX[idx] = c / (colsHere - 1)
        coordsY[idx] = r / 11.0
        
        if ((idx >= 30 && idx <= 39) || (idx >= 40 && idx <= 60)) groupID[idx] = 1 
        else if ((idx >= 20 && idx <= 29) || (idx >= 61 && idx <= 81)) groupID[idx] = 2 
        else if ((idx >= 10 && idx <= 19) || (idx >= 82 && idx <= 102)) groupID[idx] = 3 
        else if ((idx >= 0 && idx <= 9) || (idx >= 103 && idx <= 123)) groupID[idx] = 4 
      }
    }
  }
}
buildTY()

// --- Math Helpers ---
function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x) }
function frac(x){ return x - floor(x) }
function mix(a,b,t){ return a + (b-a)*t }
function hash(n){ return frac(sin(n*12.9898)*43758.5453) }
function getWave(v) { return (sin(v * PI2) + 1) / 2 }

// --- Globals ---
var timer = 0, pCurrent = 0
var outH, outS, outV
var t1, t2, t_nebula, t_twinkle, t_drop, t_stream, t_flicker

export function beforeRender(delta) {
  timer += (delta / 1000.0)
  
  // 20-Part Pattern Switcher (Auto-loops back to 0)
  if (timer >= PATTERN_TIME) {
    timer -= PATTERN_TIME
    pCurrent = (pCurrent + 1) % 20 
  }
  
  // Base Clocks
  t1 = wave(time(rippleSpeed))
  t2 = wave(time(rippleSpeed * 1.3))
  t_nebula = time(NEBULA_SPEED)
  t_twinkle = time(TWINKLE_SPEED)
  t_drop = time(0.1 / a4_dropSpeed)
  t_stream = time(0.08 / a4_streamSpeed)
  t_flicker = time(0.0005) 
  
  // B Clocks
  b1_tMove = frac(b1_tMove + (delta / ((0.055 - (b1_warmthCtl * 0.02)) * 32768)))
  b2_tMove += (delta * 0.002 * b2_speed)
  if (b2_tMove > PI2 * 2) b2_tMove -= (PI2 * 2)
  b3_tMove += (delta * 0.001)
  if (b3_tMove > PI2 * 2) b3_tMove -= (PI2 * 2)
  b5_blendFactor = clamp01((triangle(time(0.2)) - 0.2) * 1.66)
  if (timer % 7.5 < 0.1 && b5_shimmerStrength < 0.1) b5_shimmerStrength = 1.0
  if (b5_shimmerStrength > 0) b5_shimmerStrength = clamp01(b5_shimmerStrength - (delta / 8000.0))
  b5_tGlow = time(0.4)
  b5_tShoot = time(0.06)

  // C Clocks
  c1_t1 = time(0.25); c1_tNeb = time(0.4); c1_tTwink = time(0.01)
  c2_tScan = time(0.12); c2_tRain = time(0.01); c2_tOsc = time(0.03)
  c3_tVortex = time(0.15); c3_tRain = time(0.01); c3_tGlitch = time(0.03)
  c4_tW0 = time(0.2); c4_tW1 = time(0.18)
  c4_tDrift = time(0.8); c4_tRot = time(2.0)
  c4_tGlitch = time(0.04)

  // D Clocks
  d1_tFire = time(0.3)
  d1_tFlicker = time(0.3 / 6.0)
  d1_tPulse = time(0.2)
  d1_tWindOsc = time(1.5)
  d3_t0 = time(d3Speed)
  
  pulseAccum = frac(pulseAccum + (delta/1000.0 * d4Speed))
  t_convection = time(d5Speed)
  
  // D4 to D5 Automated Transition 
  var targetSunrise = (pCurrent == 19) ? 1 : 0
  if (targetSunrise && transitionAmt < 1) transitionAmt = clamp01(transitionAmt + (delta * FADE_SPEED))
  if (!targetSunrise && transitionAmt > 0) transitionAmt = clamp01(transitionAmt - (delta * FADE_SPEED))
}

function renderA1(index, x, y, z) {
  var vPos = (y + 1.0) / 3.5 
  var w1 = sin(atan2(z, x) + (vPos * 5 * rippleScale) + (t1 * PI2))
  var w2 = cos(atan2(z, x) - (vPos * 3) + (t2 * PI2))
  var waveMix = 0.5 + 0.5 * (0.6 * w1 + 0.4 * w2)
  outH = mix(baseHue, accentHue, waveMix); outS = SAT_MAX; outV = clamp01(0.10 + 0.7 * pow(waveMix, 2.0))
}

function renderA2(index, x, y, z, bgLevel) {
  var nebula = 0.5 + 0.5 * sin(atan2(z, x) + sin(((y + 1) / 3.5) * 2 + t_nebula * PI2))
  var starV = (hash(index * 23.1 + 13) < starDensity ? 1 : 0) * pow(wave(t_twinkle + hash(index * 37.7 + 7)), 6) * 0.9
  outH = mix(backgroundHue, STAR_HUE, starV); outS = mix(SATURATION, 0.2, starV); outV = clamp01((bgLevel * (0.2 + 0.8 * nebula)) + starV)
}

function renderA4A5(index, x, y, z, isHyper) {
  var yNorm = (y + 1.0) / 3.5; var anglePos = (atan2(z, x) / PI2) + 0.5; var vSum = 0, sparkSum = 0
  if (!isHyper) {
    var p = yNorm + (anglePos * 0.15)
    for (var s = 0; s < 3; s++) {
      var d = frac(1.0 - (t_drop + s/3)) - p
      if (d < 0) d += 1 
      if (d < 0.3) { vSum += pow(1 - (d/0.3), 1.5); if (d < 0.05) sparkSum += (1 - (d/0.05)) }
    }
  } else { 
    var d = frac(t_stream + (floor(anglePos * (4 + floor(a5_density * 20))) * 0.618)) - yNorm
    if (d < 0) d += 1
    if (d < 0.4) { vSum += pow(1 - (d/0.4), 2) * (0.4 + 0.6 * hash(index + t_flicker)); if (d < 0.08) sparkSum += (1 - (d/0.08)) }
  }
  var v = clamp01(vSum), spark = clamp01(sparkSum)
  outH = mix((v > (isHyper ? 0.04 : 0.12)) ? a4_accentHue : 0.58, 0.14, spark)
  outS = mix(mix(0.75, 1.0, v), 0.25, spark)
  outV = mix(a4_bgLevel, 1, v + (spark * 1.5))
}

function renderB1(index) {
  var isTop = (ringId[index] >= SKIRT_ROWS)
  var trail = pow(1 - (min(abs(pixelT[index] - frac(b1_tMove * (isTop ? -1 : 1))), 1 - abs(pixelT[index] - frac(b1_tMove * (isTop ? -1 : 1)))) * 2), 1.5)
  var headPunch = pow(trail, 15) * 0.5
  outH = isTop ? mix(0.66, mix(0.66, 0.50, b1_warmthCtl), trail) : mix(0.33, mix(0.33, 0.15, b1_warmthCtl), trail)
  outS = 1 - (headPunch * 0.8) 
  outV = ((trail + headPunch + b1_bgLevel) * pow(1 - abs((pixelY[index] * (TOTAL_ROWS - 1)) - ringId[index]), 10)) * ((trail + headPunch + b1_bgLevel) * pow(1 - abs((pixelY[index] * (TOTAL_ROWS - 1)) - ringId[index]), 10)) 
}

function renderB2(index) {
  var isTop = (index < 40), thRad = pixelT[index] * PI2, y = pixelY[index], wYellow, wOrange
  if (isTop) {
    wYellow = pow((sin(y * 18 + sin(thRad) * 1.0 - b2_tMove * 3.0) + 1) / 2, 1.5)
    wOrange = pow((sin(y * 18 - sin(thRad) * 1.0 + b2_tMove * 3.5) + 1) / 2, 1.5)
  } else {
    wYellow = pow((sin(y * 25 + sin(thRad * 2) * 1.2 - b2_tMove * 4.0) + 1) / 2, 1.5)
    wOrange = pow((sin(y * 25 - sin(thRad * 2) * 1.2 + b2_tMove * 4.5) + 1) / 2, 1.5)
  }
  var wScanner = pow(clamp01(1.0 - abs(y - ((sin(b2_tMove * 1.5) + 1) / 2)) * 4.0), 1.5) 
  outH = mix(frac(mix(b2_topHue, b2_botHue, wOrange / (wYellow + wOrange + 0.0001))), isTop ? 0.55 : 0.88, wScanner) 
  outS = clamp01(mix(mix(1.0, 0.7, wYellow * wOrange), 0.4, wScanner))        
  outV = clamp01((wYellow + wOrange) * 0.55 + 0.1 + wScanner * 1.2)
}

function renderB3B4(index, isOverdrive) {
  var isTop = (index < 40), thRad = pixelT[index] * PI2, gRow = 11 - ringId[index]
  var localY = (gRow < 5) ? (gRow / 4.0) : ((gRow - 5) / 6.0)
  var h, s, v, waveLine, dist, edgeGlow
  if (isTop) {
    waveLine = 0.5 + sin(thRad * 2 - b3_tMove * 3) * 0.2 + cos(thRad - b3_tMove * 2) * 0.1
    dist = abs(localY - waveLine)
    if (localY > waveLine) { h = b3_topHue + 0.05; s = 0.8; v = 0.15 + (1.0 - localY) * 0.2 + (random(1) > 0.98 ? 0.3 : 0) } 
    else { h = b3_topHue; s = 1.0; v = 0.05 }
    edgeGlow = max(0, 1.0 - dist * 8.0); v += edgeGlow * 0.6; s -= edgeGlow * 0.4
  } else {
    waveLine = 0.5 + sin(thRad * 3 + b3_tMove * 4) * 0.25 + cos(thRad * 2 - b3_tMove * 3) * 0.15
    dist = abs(localY - waveLine)
    if (localY > waveLine) { h = b3_sktHue + 0.08; s = 0.85; v = 0.2 + (1.0 - localY) * 0.25 + (random(1) > 0.97 ? 0.45 : 0) } 
    else { h = b3_sktHue; s = 1.0; v = 0.08 }
    edgeGlow = max(0, 1.0 - dist * 10.0); v += edgeGlow * 0.8; s -= edgeGlow * 0.5
  }
  if (isOverdrive && gRow < floor(timer / 2.4)) { h = b4_odHue; s = 1.0; v = 1.0 }
  outH = h; outS = clamp01(s); outV = clamp01(v)
}

function renderB5(index) {
  var gid = groupID[index], th = pixelT[index], hDrift = sin(b5_tGlow * PI2 + gid) * 0.02
  var t = (index < 40) ? (index / 39.0) : (1.0 - (index - 40) / 83.0), gradH, gradS
  if (t < 0.33) { gradH = mix(0.92, 0.78, t / 0.33); gradS = mix(0.70, 0.85, t / 0.33) } 
  else if (t < 0.66) { gradH = mix(0.78, 1.0, (t - 0.33) / 0.33); gradS = mix(0.85, 1.0, (t - 0.33) / 0.33) } 
  else { gradH = mix(0.0, 0.12, (t - 0.66) / 0.34); gradS = 1.0 }
  var solidH = (gid==1)?0.0:(gid==2)?0.08:(gid==3)?0.78:(gid==4)?0.92:0.0
  var solidS = (gid==1)?1.0:(gid==2)?1.0:(gid==3)?0.85:(gid==4)?0.75:0.0
  var pulse = (sin(t1 * PI2 + (gid * 0.8)) + 1) / 2
  var shimmerEffect = pow((sin(th * PI2 * 2 - b5_tShoot * PI2) + 1) / 2, 8) * (0.3 + b5_shimmerStrength * 0.7)
  
  var h = mix(solidH + hDrift, gradH + hDrift, b5_blendFactor)
  var s = clamp01(mix(solidS, gradS, b5_blendFactor) * mix(1.0, 0.85, sin(b5_blendFactor * PI)) * mix(0.8, 1.0, pulse))
  var v = mix(0.5, 1.0, pulse)
  
  if (shimmerEffect > 0.05) {
    h = mix(h, mix(0.60, 0.72, sin(th * PI2 + b5_tShoot * PI2)), shimmerEffect)
    s = mix(s, 1.0, shimmerEffect); v = clamp01(v + shimmerEffect * 0.6)
  }
  outH = h; outS = s; outV = v
}

function renderC1(index) {
  var th = pixelT[index], isSnake = false, snakeBright = 0, activeH = c1_snake, chase = false
  for (var sN = 0; sN < c1_numSnakes; sN++) {
    var headPos = frac(c1_t1 + (sN / c1_numSnakes))
    if (abs(th - headPos) < 0.05) chase = true
    var dist = (index - floor(headPos * pixelLimit) + pixelLimit) % pixelLimit
    if (dist < c1_snakeLength) {
      isSnake = true; var localB = 1.0 - (dist / c1_snakeLength)
      if (localB > snakeBright) { snakeBright = localB; activeH = frac(c1_snake + (sN * 0.08)) }
    }
  }
  var fighterVal = ((colID[index] % 2 == 0) && chase) ? pow(ringId[index] / 11.0, 2) * (0.6 + 0.4 * sin(c1_tTwink * PI2 * 8)) : 0
  
  if (isSnake) {
    outH = mix(activeH, c1_galaxy, fighterVal * 0.4); outS = 0.7; outV = pow(snakeBright, 2) + fighterVal
  } else {
    var nebWave = sin(c1_tNeb * PI2 + (index / 10) + (th * PI2))
    outH = c1_galaxy + (0.04 * nebWave); outS = 0.85
    outV = ((random(1) > 0.96) ? (0.5 + random(0.5)) : 0) + (0.12 * (0.5 + 0.5 * nebWave)) + (fighterVal * 0.4)
  }
}

function renderC2(index) {
  var noise = wave(c2_tOsc + index * 0.5) * c2_crazy
  var warpedRow = (ringId[index] / 11.0) + (noise * 0.2)
  var pos = c2_tScan + warpedRow
  var pulse = pow(triangle(pos), c2_pWidth)
  var bgGlow = 0.35 + (c2_crazy * 0.3 * sin(c2_tOsc * PI2 + index * 0.8))
  
  outH = mix((index < 40) ? c2_top0 : c2_skt0, frac(c2_tRain + (c2_crazy * wave(c2_tOsc)) + pos), pulse)
  outS = 1.0 - (pulse * 0.3 * c2_crazy)
  outV = bgGlow + (pulse * 0.75) + (wave(c2_tOsc + index) * pulse * c2_crazy)
}

function renderC3(index) {
  var gNoise = wave(c3_tGlitch + index * 0.15) * c3_crazy
  var rx = (coordsX[index]-0.5)*2, ry = (coordsY[index]-0.5)*2 
  var r = sqrt(rx*rx + ry*ry) + (gNoise * 0.2)
  var theta = atan2(ry, rx) / PI2 + (gNoise * 0.3 * c3_crazy)
  if (c3_crazy > 0.5) { var seg = 16 - (c3_crazy * 12); theta = floor(theta * seg) / seg }
  
  var spiralPos = c3_tVortex + r + theta
  var pulse = pow(triangle(spiralPos), c3_pWidth)
  var bgGlow = 0.3 + (c3_crazy * 0.25 * sin(c3_tGlitch * PI2 + index * 0.5))
  
  outH = mix(c3_h0, frac(c3_tRain + spiralPos), pulse)
  outS = 1.0 - (pulse * 0.3 * c3_crazy)
  outV = bgGlow + (pulse * 0.7)
  if (pulse > 0.9) { outS *= 0.5; outV += 0.2 }
}

function renderC4C5(index, isGlitching) {
  var r = coordsY[index], c = coordsX[index], isTop = (r < 0.45), h, s, v
  var shimmer = (random(1) > 0.93) ? 0.8 : 0
  var paletteRange = 0.32 
  var b0_top = 0.66 + paletteRange * wave(c4_tRot)
  var b0_skrt = 0.66 + paletteRange * wave(c4_tRot + 0.25)
  
  var waveB = 1.1 - (c4_growth0 * 1.2) + sin(c4_tW0 * PI2 + (c * 3)) * 0.15
  if (r >= waveB) {
    h = c4_sprout0 + (sin(c4_tDrift * PI2) * 0.05)
    s = 0.75; v = 0.45 + (1.0 - r) * 0.2 + shimmer 
  } else {
    h = isTop ? b0_top : b0_skrt; s = 1.0; v = 0.28 
  }

  if (isGlitching) {
    var ripple = sin((sqrt(pow(c-0.5,2)+pow(r-0.5,2)) * 8) - c4_tGlitch * PI2)
    if (ripple > 0.7) { h = c4_glitchHue; s = 0.3; v = 1.0 } 
  }
  outH = h; outS = s; outV = v * v
}

function renderD1D2(index, isD2, heatVal) {
  var r = coordsY[index], c = coordsX[index]
  var currentWind = sin(d1_tWindOsc * PI2) * 0.4
  var waver = sin(d1_tFire * PI2 + (r * 2)) * 0.2
  var distFromCenter = abs(c - 0.5 - (currentWind * r) - waver)
  
  var flameHeight = (1.1 - r) - (distFromCenter * 1.5)
  var flicker = wave(d1_tFlicker + (index / pixelLimit)) * 1.2
  var snareBeat = pow(wave(d1_tPulse), 16) 
  
  var effectiveHeat = isD2 ? heatVal + (snareBeat * 0.8) : heatVal
  var intensity = clamp01((flameHeight + flicker) * effectiveHeat)

  var h = 0.12 - (intensity * 0.12) 
  var s = 1.0; var v = pow(intensity, 2.0) 

  if (isD2) {
    var bgV = 0.2 * r * (1.0 - v); var pulseBurst = snareBeat * 0.8 * r 
    if (v < 0.15) { 
        h = 0.66 + (snareBeat * 0.05); s = 0.8; v = bgV + pulseBurst
    } else {
        h = h + (pulseBurst * 0.1); s = 1.0 - (pulseBurst * 0.5)
    }
  }

  if (v > 0.1 && random(1) > 0.98) v += 0.3
  outH = h; outS = clamp01(s); outV = clamp01(v)
}

function renderD3(index) {
  var r = coordsY[index], c = coordsX[index]
  var waveVal = sin(d3_t0 * PI2 + (c * d3Comp0) + (r * d3Comp0))
  var jitter = (random(1) < d3Agit) ? (random(1) - 0.5) : 0
  var intensity = clamp01((waveVal + 1) / 2 + jitter)

  var h, s, v
  if (intensity > (1 - d3Fire)) {
    h = d3Hue0 + (0.05 * (intensity - (1 - d3Fire))) 
    s = 0.95; v = pow(intensity, 1.5) 
  } else {
    h = 0.0; s = 1.0; v = (1 - intensity) * 0.3 
  }
  outH = h; outS = s; outV = v
}

function renderD4D5(index) {
  var r = coordsY[index], c = coordsX[index]
  var dist = sqrt(pow(c - 0.5, 2) + pow(r - 0.5, 2)) 
  var waveVal = getWave(dist * (1/d4Width) - pulseAccum)
  var h4, v4
  if (index % 2 == 0) {
    h4 = d4Hue; v4 = pow(waveVal, 2.5) * d4Int
  } else {
    h4 = d4Hue + 0.5; v4 = pow(1 - waveVal, 2.5) * (d4Int * 0.8)
  }

  var swirl = sin(t_convection * PI2 + (c * 2)) * 0.6
  var risingRaw = getWave(t_convection - r + (swirl * 0.2))
  var risingThick = clamp01(risingRaw * (1.1 + turbo * 2.0))
  
  var h5 = mix(d5Hue, 0.60, r) 
  var s5 = 0.8 
  var v5 = (0.2 + risingThick * 0.8) * d5Int 

  if (risingRaw > (0.8 - turbo * 0.2)) { h5 = 1.0; v5 += 0.5 }

  var h = h4 + (h5 - h4) * transitionAmt
  var s = 0.95 + (s5 - 0.95) * transitionAmt
  var v = v4 + (v5 - v4) * transitionAmt

  outH = h; outS = s; outV = v * v
}

// Router
function getPatternData(pIdx, index, x, y, z) {
  if (pIdx == 0) renderA1(index, x, y, z)
  else if (pIdx == 1) renderA2(index, x, y, z, 0.20) 
  else if (pIdx == 2) renderA2(index, x, y, z, 0.0)  
  else if (pIdx == 3) renderA4A5(index, x, y, z, 0)  
  else if (pIdx == 4) renderA4A5(index, x, y, z, 1)  
  else if (pIdx == 5) renderB1(index)                
  else if (pIdx == 6) renderB2(index)                
  else if (pIdx == 7) renderB3B4(index, 0) 
  else if (pIdx == 8) renderB3B4(index, 1) 
  else if (pIdx == 9) renderB5(index) 
  else if (pIdx == 10) renderC1(index) 
  else if (pIdx == 11) renderC2(index) 
  else if (pIdx == 12) renderC3(index) 
  else if (pIdx == 13) renderC4C5(index, 0) 
  else if (pIdx == 14) renderC4C5(index, 1) 
  else if (pIdx == 15) renderD1D2(index, 0, 0.4) 
  else if (pIdx == 16) renderD1D2(index, 1, 0.8) 
  else if (pIdx == 17) renderD3(index)
  else if (pIdx == 18) renderD4D5(index) // D4: Base Crescendo
  else if (pIdx == 19) renderD4D5(index) // D5: Fades to Sunrise
}

export function render3D(index, x, y, z) {
  if (index >= pixelLimit) { rgb(0,0,0); return }
  getPatternData(pCurrent, index, x, y, z)
  hsv(frac(outH), clamp01(outS), clamp01(outV))
}