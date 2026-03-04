let pixelMap = [];
let pixelCount = 124;
let myFont;

function preload() {
  // Load font from CDN
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelMap = generateMap(pixelCount);
  textFont(myFont);
}

function draw() {
  background(0);

  // orbitControl: Drag to rotate, scroll to zoom
  orbitControl(2, 1, 0.5);

  // Lighting
  ambientLight(150);
  pointLight(255, 255, 255, 500, -500, 500);

  // SCALE FACTOR
  let scaleF = 500;

  for (let i = 0; i < pixelMap.length; i++) {
    let p = pixelMap[i];
    let x = p[0] * scaleF;
    let y = -p[1] * scaleF;
    let z = p[2] * scaleF;

    // Check for special pixels
    let isSpecial = (i === 0 || i === 39 || i === 40 || i === 123);

    // Front/back split
    let isFrontTop = (i >= 0 && i <= 19);
    let isBackTop = (i >= 20 && i <= 39);
    let isFrontBottom = (i >= 40 && i <= 81);
    let isBackBottom = (i >= 82 && i <= 123);

    // --- COLOR CHOICE (also used for text) ---
    let r, g, b;

    if (isSpecial) {
      r = 255; g = 255; b = 0;           // Emphasis: yellow
    } else if (isFrontTop) {
      r = 255; g = 140; b = 140;         // Lighter red (front top)
    } else if (isBackTop) {
      r = 200; g = 70;  b = 70;          // Darker red (back top)
    } else if (isFrontBottom) {
      r = 180; g = 220; b = 255;         // Lighter blue (front bottom)
    } else if (isBackBottom) {
      r = 120; g = 170; b = 220;         // Darker blue (back bottom)
    } else {
      r = 255; g = 255; b = 255;         // Fallback (shouldn't happen)
    }

    // --- DRAW PIXEL ---
    push();
    translate(x, y, z);

    fill(r, g, b);
    noStroke();
    sphere(16);

    // --- DRAW LABEL (match color) ---
    translate(18, -18, 0);
    textSize(40);
    fill(r, g, b);
    text(i, 0, 0);

    pop();

    // --- DRAW WIRING LINE ---
    if (i > 0) {
      let prev = pixelMap[i - 1];

      // Highlight the jump from 39 to 40 (still emphasis color, but no size difference)
      if (i === 40) {
        stroke(255, 255, 0);
        strokeWeight(4);
      } else {
        stroke(255, 100);
        strokeWeight(2);
      }

      line(
        x, y, z,
        prev[0] * scaleF, -prev[1] * scaleF, prev[2] * scaleF
      );
    }
  }
}

function generateMap(count) {
  let map = [];
  let topCols = 8, topRows = 5;
  let topRadius = 0.8, topHeight = 1.2, topY0 = 1.3;
  let sCols = 12, sRows = 7;
  let sRadius = 1.0, sHeight = 2.0, sY0 = -1.0;

  let seam56 = PI / 8;
  let seamWrap = PI / 10;
  let usable = PI * 2 - seam56 - seamWrap;
  let sStep = usable / sCols;
  let seamBoost = 0.18;
  let rightOffset = -0.2;

  for (let i = 0; i < count; i++) {
    if (i < 40) {
      let tc = Math.floor(i / topRows);
      let tr = (tc % 2 === 0) ? (i % topRows) : (topRows - 1 - (i % topRows));
      let y = topY0 + (tr / (topRows - 1)) * topHeight;
      let angle = (tc / topCols) * (TWO_PI) + rightOffset;
      map.push([cos(angle) * topRadius, y, sin(angle) * topRadius]);
    }
    else if (i < 124) {
      let sI = i - 40;
      let col = Math.floor(sI / sRows);
      let row = (col % 2 === 0) ? (sRows - 1 - (sI % sRows)) : (sI % sRows);
      let y = sY0 + (row / (sRows - 1)) * sHeight;
      let a = rightOffset - (col * sStep) - seamWrap;
      if (col >= 6) a -= seam56;
      let rr = sRadius + (col == 0 || col == 5 || col == 6 || col == 11 ? seamBoost : 0);
      map.push([cos(a) * rr, y, sin(a) * rr]);
    }
  }
  return map;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}