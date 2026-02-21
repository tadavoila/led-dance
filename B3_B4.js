// B4 — The Dichromatic Garden (Adjustable Bases + Flicker)
// Skirt 0: Midnight Green | Skirt 1: Neon Yellow

var N = 84
var PI2 = PI * 2

// ===== Default States =====
var DEF_pink = 0.8     
var DEF_blue = 0.60
var DEF_sk0 = 0.38 
var DEF_sk1 = 0.17 
var globalGrowth = 0 

var pinkHue = DEF_pink
var blueHue = DEF_blue
var skirt0Hue = DEF_sk0
var skirt1Hue = DEF_sk1
var flickerOn = 0 // Flicker state

// ===== Flower Mapping =====
var flowerCount = 5
var centers = [ 
  [38, 45], [15, 26], [68, 71], [19, 22], [64, 75]
]
var petals  = [
  [39, 44, 31, 52, 37, 46],               
  [14, 27, 12, 29, 16, 25],               
  [69, 70, 57, 82, 67, 72],               
  [18, 23, 8, 33, 20, 21],          
  [65, 74, 61, 78, 63, 76]                
]

// ---------- Syncable Toggles & Gauges ----------
var t_pinkUp=0, t_pinkDn=0, t_blueUp=0, t_blueDn=0, t_groUp=0, t_groDn=0, t_reset=0
var t_s0Up=0, t_s0Dn=0, t_s1Up=0, t_s1Dn=0
var t_flicker=0 // Flicker toggle
var l_pinkUp=0, l_pinkDn=0, l_blueUp=0, l_blueDn=0, l_groUp=0, l_groDn=0, l_reset=0
var l_s0Up=0, l_s0Dn=0, l_s1Up=0, l_s1Dn=0

export function togglePinkHueUp(v){ t_pinkUp = v }
export function togglePinkHueDown(v){ t_pinkDn = v }
export function toggleBlueHueUp(v){ t_blueUp = v }
export function toggleBlueHueDown(v){ t_blueDn = v }
export function toggleSkirt0HueUp(v){ t_s0Up = v }
export function toggleSkirt0HueDown(v){ t_s0Dn = v }
export function toggleSkirt1HueUp(v){ t_s1Up = v }
export function toggleSkirt1HueDown(v){ t_s1Dn = v }
export function toggleGrowMore(v){ t_groUp = v }
export function toggleGrowLess(v){ t_groDn = v }
export function toggleReset(v){ t_reset = v }
export function toggleFlicker(v){ flickerOn = v } // Direct assignment for toggle

export function gaugePink(){ return frac(pinkHue) }
export function gaugeBlue(){ return frac(blueHue) }
export function gaugeSkirt0(){ return frac(skirt0Hue) }
export function gaugeSkirt1(){ return frac(skirt1Hue) }
export function gaugeGrowth(){ return globalGrowth / flowerCount }

function onFlip(v, last){ return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  if(onFlip(t_pinkUp, l_pinkUp)){ l_pinkUp=t_pinkUp; pinkHue = frac(pinkHue + 0.02) }
  if(onFlip(t_pinkDn, l_pinkDn)){ l_pinkDn=t_pinkDn; pinkHue = frac(pinkHue - 0.02) }
  if(onFlip(t_blueUp, l_blueUp)){ l_blueUp=t_blueUp; blueHue = frac(blueHue + 0.02) }
  if(onFlip(t_blueDn, l_blueDn)){ l_blueDn=t_blueDn; blueHue = frac(blueHue - 0.02) }
  
  if(onFlip(t_s0Up, l_s0Up)){ l_s0Up=t_s0Up; skirt0Hue = frac(skirt0Hue + 0.02) }
  if(onFlip(t_s0Dn, l_s0Dn)){ l_s0Dn=t_s0Dn; skirt0Hue = frac(skirt0Hue - 0.02) }
  if(onFlip(t_s1Up, l_s1Up)){ l_s1Up=t_s1Up; skirt1Hue = frac(skirt1Hue + 0.02) }
  if(onFlip(t_s1Dn, l_s1Dn)){ l_s1Dn=t_s1Dn; skirt1Hue = frac(skirt1Hue - 0.02) }
  
  if(onFlip(t_groUp, l_groUp)){ l_groUp=t_groUp; globalGrowth = clamp(globalGrowth + 1, 0, flowerCount) }
  if(onFlip(t_groDn, l_groDn)){ l_groDn=t_groDn; globalGrowth = clamp(globalGrowth - 1, 0, flowerCount) }

  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; globalGrowth = 0; 
    pinkHue = DEF_pink; blueHue = DEF_blue;
    skirt0Hue = DEF_sk0; skirt1Hue = DEF_sk1;
    flickerOn = 0
  }

  t1 = time(0.12) 
  t2 = time(0.04)
  tf = time(0.005) // Fast time for flicker
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }
  
  var skirtId = nodeId()
  var h, s, v
  var isFlower = false

  for (var f = 0; f < globalGrowth; f++) {
    // Red Centers
    for (var ci = 0; ci < centers[f].length; ci++) {
      if (index == centers[f][ci]) {
        h = 0.0; s = 1.0; 
        // Flicker logic: random-ish vibration if enabled, else solid
        v = flickerOn ? (0.4 + 0.6 * random(1)) : 1.0; 
        isFlower = true
      }
    }
    
    // Petals
    for (var pi = 0; pi < petals[f].length; pi++) {
      if (index == petals[f][pi]) {
        h = (skirtId == 0) ? blueHue : pinkHue; 
        s = 1.0; 
        v = 0.8 + 0.2 * sin(t2 * PI2 + index); 
        isFlower = true
      }
    }
  }

  if (!isFlower) {
    var waveEffect = 0.18 * sin(t1 * PI2 + (index % 12)) 
    if (skirtId == 0) {
      h = skirt0Hue; s = 1.0; v = 0.04 + waveEffect; 
    } else {
      h = skirt1Hue; s = 0.9; v = 0.1 + waveEffect; 
    }
  }

  hsv(frac(h), s, clamp(v, 0, 1))
}