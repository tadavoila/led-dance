// D3 — Full Complexity (The "Thesis Finale" Edition)
// 84 LEDs | 12x7 Zig-Zag | Individual Souls + Climax Override
var N = 84
var PI2 = PI * 2

// ===== Default Constants =====
var DEF_speed = 0.15, DEF_sep = 0.12
var DEF_comp0 = 3.0, DEF_comp1 = 4.5
var DEF_h0 = 0.15, DEF_h1 = 0.66 
var DEF_fire = 0.5, DEF_agit = 0.02

// ===== State Variables =====
var d3Speed = DEF_speed, d3Sep = DEF_sep
var d3Comp0 = DEF_comp0, d3Comp1 = DEF_comp1
var d3Hue0 = DEF_h0, d3Hue1 = DEF_h1
var d3Fire = DEF_fire, d3Agit = DEF_agit

// --- Climax State ---
var isClimax = 0
var climaxTimer = 0

// --- Internal Timers ---
var t0, t1

// --- Mapping ---
var coordsX = array(N), coordsY = array(N)
var rowData = [[0,13,14,27,28,41,42,55,56,69,70,83],[1,12,15,26,29,40,43,54,57,68,71,82],[2,11,16,25,30,39,44,53,58,67,72,81],[3,10,17,24,31,38,45,52,59,66,73,80],[4,9,18,23,32,37,46,51,60,65,74,79],[5,8,19,22,33,36,47,50,61,64,75,78],[6,7,20,21,34,35,48,49,62,63,76,77]]
for (var r = 0; r < 7; r++) {
  for (var c = 0; c < 12; c++) {
    var p = rowData[r][c]; if (p < N) { coordsX[p] = c; coordsY[p] = r }
  }
}

// ---------- UI CONTROLS & GAUGES ----------
var t_sU=0, t_sD=0, t_sepU=0, t_sepD=0, t_c0U=0, t_c0D=0, t_c1U=0, t_c1D=0
var t_h0U=0, t_h0D=0, t_h1U=0, t_h1D=0, t_fU=0, t_fD=0, t_aU=0, t_aD=0, t_reset=0
var l_sU, l_sD, l_sepU, l_sepD, l_c0U, l_c0D, l_c1U, l_c1D, l_h0U, l_h0D, l_h1U, l_h1D, l_fU, l_fD, l_aU, l_aD, l_reset

export function toggleSpeedUp(v) { t_sU=v }
export function toggleSpeedDn(v) { t_sD=v }
export function toggleSepUp(v) { t_sepU=v }
export function toggleSepDn(v) { t_sepD=v }

// Node 0
export function toggleNode0CompUp(v) { t_c0U=v }
export function toggleNode0CompDn(v) { t_c0D=v }
export function toggleNode0HueUp(v) { t_h0U=v }
export function toggleNode0HueDn(v) { t_h0D=v }

// Node 1
export function toggleNode1CompUp(v) { t_c1U=v }
export function toggleNode1CompDn(v) { t_c1D=v }
export function toggleNode1HueUp(v) { t_h1U=v }
export function toggleNode1HueDn(v) { t_h1D=v }

export function toggleFireUp(v) { t_fU=v }
export function toggleFireDn(v) { t_fD=v }
export function toggleAgitUp(v) { t_aU=v }
export function toggleAgitDn(v) { t_aD=v }

// --- The Big Finale Button ---
export function toggleClimax(v) { isClimax = v }
export function toggleReset(v) { t_reset=v }

// --- Gauges ---
export function gaugeSpeed() { return 1 - d3Speed }
export function gaugeSeparation() { return d3Sep * 2 }
export function gaugeHueNode0() { return d3Hue0 }
export function gaugeHueNode1() { return d3Hue1 }
export function gaugeCompNode0() { return (d3Comp0 - 1) / 5 }
export function gaugeCompNode1() { return (d3Comp1 - 1) / 5 }
export function gaugeFireBalance() { return d3Fire }
export function gaugeAgitation() { return d3Agit * 10 }
export function gaugeClimaxState() { return isClimax }

function onFlip(v, last) { return (v != last) }
function clamp(v, min, max) { return v < min ? min : (v > max ? max : v) }

export function beforeRender(delta) {
  if(onFlip(t_sU, l_sU)){ l_sU=t_sU; d3Speed=clamp(d3Speed-0.02, 0.02, 0.5) }
  if(onFlip(t_sD, l_sD)){ l_sD=t_sD; d3Speed=clamp(d3Speed+0.02, 0.02, 0.5) }
  if(onFlip(t_sepU, l_sepU)){ l_sepU=t_sepU; d3Sep=clamp(d3Sep+0.02, 0, 0.5) }
  if(onFlip(t_sepD, l_sepD)){ l_sepD=t_sepD; d3Sep=clamp(d3Sep-0.02, 0, 0.5) }
  
  if(onFlip(t_c0U, l_c0U)){ l_c0U=t_c0U; d3Comp0=clamp(d3Comp0+0.2, 1, 6) }
  if(onFlip(t_c0D, l_c0D)){ l_c0D=t_c0D; d3Comp0=clamp(d3Comp0-0.2, 1, 6) }
  if(onFlip(t_c1U, l_c1U)){ l_c1U=t_c1U; d3Comp1=clamp(d3Comp1+0.2, 1, 6) }
  if(onFlip(t_c1D, l_c1D)){ l_c1D=t_c1D; d3Comp1=clamp(d3Comp1-0.2, 1, 6) }
  
  if(onFlip(t_h0U, l_h0U)){ l_h0U=t_h0U; d3Hue0=frac(d3Hue0+0.05) }
  if(onFlip(t_h0D, l_h0D)){ l_h0D=t_h0D; d3Hue0=frac(d3Hue0-0.05) }
  if(onFlip(t_h1U, l_h1U)){ l_h1U=t_h1U; d3Hue1=frac(d3Hue1+0.05) }
  if(onFlip(t_h1D, l_h1D)){ l_h1D=t_h1D; d3Hue1=frac(d3Hue1-0.05) }
  
  if(onFlip(t_fU, l_fU)){ l_fU=t_fU; d3Fire=clamp(d3Fire+0.05, 0, 1) }
  if(onFlip(t_fD, l_fD)){ l_fD=t_fD; d3Fire=clamp(d3Fire-0.05, 0, 1) }
  if(onFlip(t_aU, l_aU)){ l_aU=t_aU; d3Agit=clamp(d3Agit+0.01, 0, 0.1) }
  if(onFlip(t_aD, l_aD)){ l_aD=t_aD; d3Agit=clamp(d3Agit-0.01, 0, 0.1) }

  if(onFlip(t_reset, l_reset)){
    l_reset=t_reset; d3Speed=DEF_speed; d3Sep=DEF_sep; d3Comp0=DEF_comp0; d3Comp1=DEF_comp1; 
    d3Hue0=DEF_h0; d3Hue1=DEF_h1; d3Fire=DEF_fire; d3Agit=DEF_agit; isClimax = 0;
  }

  t0 = time(d3Speed)
  t1 = frac(t0 + d3Sep) 
  
  // High-speed climax timer
  climaxTimer = time(0.1) 
}

export function render(index) {
  if (index >= N) return
  
  // --- 1. CLIMAX OVERRIDE ---
  // If Climax is on, we stop everything else and go into hyper-mode
  if (isClimax) {
    // Rainbow sweeps diagonally across the grid
    var climaxHue = frac(climaxTimer + (index / N)) 
    hsv(climaxHue, 1, 1)
    return
  }

  // --- 2. NORMAL D3 LOGIC ---
  var id = nodeId(); var r = coordsY[index]; var c = coordsX[index]
  var activeT    = (id == 0) ? t0 : t1
  var activeComp = (id == 0) ? d3Comp0 : d3Comp1
  var baseHue    = (id == 0) ? d3Hue0 : d3Hue1
  
  var waveVal = sin(activeT * PI2 + (c / (12/activeComp)) + (r / (7/activeComp)))
  var jitter = (random(1) < d3Agit) ? (random(1) - 0.5) : 0
  var intensity = clamp((waveVal + 1) / 2 + jitter, 0, 1)

  var h, s, v
  
  if (intensity > (1 - d3Fire)) {
    h = baseHue + (0.1 * (intensity - (1 - d3Fire))) 
    s = 0.9; v = pow(intensity, 2) 
  } else {
    h = baseHue + 0.5 + (intensity * 0.1) 
    s = 1.0; v = (1 - intensity) * 0.3 
  }

  hsv(frac(h), s, v)
}