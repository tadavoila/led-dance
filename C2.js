// C2 — The Whimsical Vault
// Node 0: Midnight Navy & Deep Gold | Node 1: Dusty Pink & Steel Blue
var N = 124
var PI2 = PI * 2

// ===== Default States =====
var DEF_h0 = 0.66, DEF_sh0 = 0.08  
var DEF_h1 = 0.94, DEF_sh1 = 0.58  
var DEF_speed = 0.2, DEF_depth = 1.0
var whimsyLevel = 0.5 // Locked at 50%

var hue0 = DEF_h0, starHue0 = DEF_sh0
var hue1 = DEF_h1, starHue1 = DEF_sh1
var pulseSpeed = DEF_speed
var pulseDepth = DEF_depth

// ===== Star Mapping =====
var stars = [
  1, 12, 15, 11, 13, 5, 9, 8, 19, 7, 41, 29, 40, 43, 39, 
  57, 69, 68, 71, 67, 61, 65, 64, 75, 63, 33, 36, 47, 35, 37
]

// ---------- Syncable Toggles & Gauges ----------
var t_h0Up=0, t_h0Dn=0, t_sh0Up=0, t_sh0Dn=0, t_h1Up=0, t_h1Dn=0, t_sh1Up=0, t_sh1Dn=0
var t_spUp=0, t_spDn=0, t_deUp=0, t_deDn=0, t_reset=0

var l_h0Up=0, l_h0Dn=0, l_sh0Up=0, l_sh0Dn=0, l_h1Up=0, l_h1Dn=0, l_sh1Up=0, l_sh1Dn=0
var l_spUp=0, l_spDn=0, l_deUp=0, l_deDn=0, l_reset=0

export function toggleHue0Up(v){ t_h0Up = v }
export function toggleHue0Down(v){ t_h0Dn = v }
export function toggleStarHue0Up(v){ t_sh0Up = v }
export function toggleStarHue0Down(v){ t_sh0Dn = v }
export function toggleHue1Up(v){ t_h1Up = v }
export function toggleHue1Down(v){ t_h1Dn = v }
export function toggleStarHue1Up(v){ t_sh1Up = v }
export function toggleStarHue1Down(v){ t_sh1Dn = v }

// Pulse Controls
export function togglePulseSpeedUp(v){ t_spUp = v }
export function togglePulseSpeedDown(v){ t_spDn = v }
export function togglePulseDepthUp(v){ t_deUp = v }
export function togglePulseDepthDown(v){ t_deDn = v }

export function toggleReset(v){ t_reset = v }

export function gaugeHue0(){ return frac(hue0) }
export function gaugeStar0(){ return frac(starHue0) }
export function gaugeHue1(){ return frac(hue1) }
export function gaugeStar1(){ return frac(starHue1) }
export function gaugePulseSpeed(){ return pulseSpeed }
export function gaugePulseDepth(){ return pulseDepth / 2 } // Normalized for 0-2 range

function onFlip(v, last){ return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  // Hue Toggles
  if(onFlip(t_h0Up, l_h0Up)){ l_h0Up=t_h0Up; hue0 = frac(hue0 + 0.02) }
  if(onFlip(t_h0Dn, l_h0Dn)){ l_h0Dn=t_h0Dn; hue0 = frac(hue0 - 0.02) }
  if(onFlip(t_sh0Up, l_sh0Up)){ l_sh0Up=t_sh0Up; starHue0 = frac(starHue0 + 0.02) }
  if(onFlip(t_sh0Dn, l_sh0Dn)){ l_sh0Dn=t_sh0Dn; starHue0 = frac(starHue0 - 0.02) }
  if(onFlip(t_h1Up, l_h1Up)){ l_h1Up=t_h1Up; hue1 = frac(hue1 + 0.02) }
  if(onFlip(t_h1Dn, l_h1Dn)){ l_h1Dn=t_h1Dn; hue1 = frac(hue1 - 0.02) }
  if(onFlip(t_sh1Up, l_sh1Up)){ l_sh1Up=t_sh1Up; starHue1 = frac(starHue1 + 0.02) }
  if(onFlip(t_sh1Dn, l_sh1Dn)){ l_sh1Dn=t_sh1Dn; starHue1 = frac(starHue1 - 0.02) }
  
  // Pulse Toggles
  if(onFlip(t_spUp, l_spUp)){ l_spUp=t_spUp; pulseSpeed = clamp(pulseSpeed - 0.05, 0.02, 1.0) }
  if(onFlip(t_spDn, l_spDn)){ l_spDn=t_spDn; pulseSpeed = clamp(pulseSpeed + 0.05, 0.02, 1.0) }
  if(onFlip(t_deUp, l_deUp)){ l_deUp=t_deUp; pulseDepth = clamp(pulseDepth + 0.2, 0, 3.0) }
  if(onFlip(t_deDn, l_deDn)){ l_deDn=t_deDn; pulseDepth = clamp(pulseDepth - 0.2, 0, 3.0) }

  if(onFlip(t_reset, l_reset)){ 
    l_reset=t_reset; hue0=DEF_h0; starHue0=DEF_sh0; hue1=DEF_h1; starHue1=DEF_sh1;
    pulseSpeed = DEF_speed; pulseDepth = DEF_depth;
  }

  t_h0 = time(0.8)   
  t_tw = time(0.12)  
  t_bk = time(pulseSpeed)
}

export function render(index) {
  if (index >= N) { rgb(0,0,0); return }
  
  var skirtId = nodeId()
  var h, s, v
  var isStar = false

  for (var i = 0; i < stars.length; i++) {
    if (index == stars[i]) { isStar = true; break }
  }

  if (skirtId == 0) {
    // NODE 0: NAVY & GOLD
    if (isStar) {
      h = starHue0 + (sin(t_h0 * PI2) * 0.04)
      s = 0.5; v = 0.3 + wave(t_tw + index/5) * 0.7
      if (random(1) > 0.985) v = 1.0 // Fixed Whimsy 50% frequency
    } else {
      h = hue0 + (cos(t_h0 * PI2) * 0.03)
      var waveEffect = (0.12 * pulseDepth) * sin(t_bk * PI2 + (index % 12)) 
      s = 1.0; v = 0.05 + waveEffect
    }
  } else {
    // NODE 1: PINK & STEEL BLUE
    if (isStar) {
      h = starHue1 + (sin(t_h0 * PI2) * 0.04)
      s = 0.45; v = 0.3 + triangle(t_tw + index/3) * 0.7
      if (random(1) > 0.985) v = 1.0 
    } else {
      h = hue1 + (cos(t_h0 * PI2) * 0.03)
      var waveEffect = (0.15 * pulseDepth) * sin(t_bk * PI2 + floor(index / 7))
      s = 0.8; v = 0.06 + waveEffect
    }
  }

  hsv(frac(h), s, clamp(v, 0, 1))
}