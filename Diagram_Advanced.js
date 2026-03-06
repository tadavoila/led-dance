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
  textAlign(CENTER, CENTER);
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
      r = 230; g = 95;  b = 95;          // Darker red (back top) - BRIGHTENED slightly
    } else if (isFrontBottom) {
      r = 180; g = 220; b = 255;         // Lighter blue (front bottom)
    } else if (isBackBottom) {
      r = 120; g = 170; b = 220;         // Darker blue (back bottom)
    } else {
      r = 255; g = 255; b = 255;         // Fallback
    }

    // --- DRAW PIXEL ---
    push();
    translate(x, y, z);

    fill(r, g, b);
    noStroke();
    sphere(16);

    // --- DRAW LABEL (match color) ---
    // Universal text positioning directly above the dot
    translate(0, -45, 0); 
    textSize(56);
    fill(r, g, b);
    text(i, 0, 0);
    pop();

    // --- DRAW WIRING LINE ---
    if (i > 0) {
      let prev = pixelMap[i - 1];

      // Highlight the jump from 39 to 40
      if (i === 40) {
        stroke(255, 255, 0);
        strokeWeight(4);
      } else {
        stroke(255);
        strokeWeight(2);
      }

      line(x, y, z, prev[0] * scaleF, -prev[1] * scaleF, prev[2] * scaleF);
    }
  }

  // ==========================================
  // --- DRAW HARDWARE (BIGGER BOXES) ---
  // ==========================================

  let rightBatPos = createVector(2.5 * scaleF, 0 * scaleF, 0);
  
  // PIXELBLAZE pushed further right
  let pbPos       = createVector(2.8 * scaleF, -0.6 * scaleF, 0); 
  let leftBatPos  = createVector(-2.5 * scaleF, 0 * scaleF, 0);

  let p0 = pixelMap[0];
  let v0 = createVector(p0[0]*scaleF, -p0[1]*scaleF, p0[2]*scaleF);
  let p123 = pixelMap[123];
  let v123 = createVector(p123[0]*scaleF, -p123[1]*scaleF, p123[2]*scaleF);

  // Right Battery Box
  push(); translate(rightBatPos.x, rightBatPos.y, rightBatPos.z);
  fill(50, 200, 50); box(120, 200, 60); 
  // Text to the right
  fill(255); translate(60, 150, 0); textSize(52); text("BATTERY\n(RIGHT)", 0,0); pop();

  // Pixelblaze Box
  push(); translate(pbPos.x, pbPos.y, pbPos.z);
  fill(150, 50, 255); box(100, 120, 30); 
  fill(255); translate(-60, 110, 0); textSize(52); text("PIXELBLAZE", 0,0); pop();

  // Left Battery Box
  push(); translate(leftBatPos.x, leftBatPos.y, leftBatPos.z);
  fill(50, 200, 50); box(120, 200, 60); 
  fill(255); translate(0, 150, 0); textSize(52); text("BATTERY\n(LEFT)", 0,0); pop();


  // ==========================================
  // --- DRAW POWER & DATA WIRING ---
  // ==========================================
  
  let colorPower = color(255, 50, 50);     // Red
  let colorData = color(50, 255, 50);      // Green
  let colorGround = color(150, 150, 150);  // Silver/Grey

  function drawLabeledWire(c1, c2, c3, c4, wireColor, labelText, hasFuse, tPos, labelYOffset) {
    noFill(); stroke(wireColor); strokeWeight(5);
    bezier(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, c3.x, c3.y, c3.z, c4.x, c4.y, c4.z);
    
    let mx = bezierPoint(c1.x, c2.x, c3.x, c4.x, tPos);
    let my = bezierPoint(c1.y, c2.y, c3.y, c4.y, tPos);
    let mz = bezierPoint(c1.z, c2.z, c3.z, c4.z, tPos);

    push();
    translate(mx, my, mz);
    noStroke();
    
    if (hasFuse) {
      fill(255, 120, 0); // Orange Fuse Block
      box(50, 40, 40); 
      
      push();
      fill(255, 120, 0); // FUSE TEXT IS NOW ORANGE
      textSize(48); // BIGGER FUSE TEXT
      translate(0, 50, 0); 
      text("FUSE", 0, 0);
      pop();
    } 
    
    translate(0, labelYOffset, 0); 
    fill(wireColor);
    textSize(52); 
    text(labelText, 0, 0);
    pop();
  }

  // 2. RIGHT SIDE -> PIXEL 0
  let pbEdgeX = pbPos.x - 50;
  let batEdgeX = rightBatPos.x - 60;

  // DATA (TOP WIRE) - Arc reduced (-400 in Y)
  let pbTo0_1 = createVector(pbEdgeX, pbPos.y, pbPos.z);
  let pbTo0_2 = createVector(pbEdgeX - 200, pbPos.y - 400, pbPos.z + 50); 
  let pbTo0_3 = createVector(v0.x + 200, v0.y - 400, v0.z + 50);
  
  // POWER (UNDERNEATH) - Flatter (-250 in Y) and pushes further FORWARD (+400 in Z)
  let batTo0_1 = createVector(batEdgeX, rightBatPos.y + 20, rightBatPos.z);
  let batTo0_2 = createVector(batEdgeX - 200, rightBatPos.y - 250, rightBatPos.z + 400);
  let batTo0_3 = createVector(v0.x + 100, v0.y - 250, v0.z + 400);

  // -- GROUND (UNDERNEATH) --
  // Ground merge pushes massively BACKWARDS (-800 in Z) 
  let gndMid = createVector(batEdgeX - 250, pbPos.y - 50, rightBatPos.z - 800); 
  noFill(); stroke(colorGround); strokeWeight(5);
  
  // Pixelblaze to Merge
  bezier(
    pbEdgeX, pbPos.y + 40, pbPos.z,   
    pbEdgeX - 100, pbPos.y + 40, pbPos.z - 400,   
    gndMid.x + 100, gndMid.y, gndMid.z,   
    gndMid.x, gndMid.y, gndMid.z
  );
  
  // Battery to Merge
  bezier(
    batEdgeX, rightBatPos.y - 20, rightBatPos.z,   
    batEdgeX - 100, rightBatPos.y - 20, rightBatPos.z - 800,   
    gndMid.x + 100, gndMid.y, gndMid.z,   
    gndMid.x, gndMid.y, gndMid.z
  );
  
  // Main GROUND wire continuing to Pixel 0 (Pushed back and flattened)
  let gndTo0_2 = createVector(gndMid.x - 150, gndMid.y - 300, gndMid.z);
  let gndTo0_3 = createVector(v0.x + 100, v0.y - 300, v0.z - 500);
  drawLabeledWire(gndMid, gndTo0_2, gndTo0_3, v0, colorGround, "GROUND", false, 0.20, 50);

  // -- POWER --
  // Shifted tPos slightly to 0.35 to avoid the gray wire intersection on the right
  drawLabeledWire(batTo0_1, batTo0_2, batTo0_3, v0, colorPower, "POWER", true, 0.35, -60);

  // -- DATA --
  drawLabeledWire(pbTo0_1, pbTo0_2, pbTo0_3, v0, colorData, "DATA", false, 0.18, -40);


  // 3. LEFT SIDE -> PIXEL 123
  let backZ = -3.0 * scaleF; 
  let lBatEdgeX = leftBatPos.x + 60;
  
  // Left side arcs -> Sweep DOWN (+Y) and UNDERNEATH the hem to cleanly avoid pixel 40
  let leftBatTo123_1 = createVector(lBatEdgeX, leftBatPos.y, leftBatPos.z);
  let leftBatTo123_2 = createVector(lBatEdgeX - 400, leftBatPos.y + 400, v123.z - 200);
  let leftBatTo123_3 = createVector(v123.x - 300, v123.y + 300, v123.z - 200);
  // Shifted tPos to 0.80 to push the fuse and "POWER" text FAR to the right, next to the battery 
  drawLabeledWire(leftBatTo123_1, leftBatTo123_2, leftBatTo123_3, v123, colorPower, "POWER", true, 0.40, -60);
  
  let leftBatTo123_G1 = createVector(lBatEdgeX, leftBatPos.y + 40, leftBatPos.z);
  let leftBatTo123_G2 = createVector(lBatEdgeX - 500, leftBatPos.y + 500, v123.z - 300);
  let leftBatTo123_G3 = createVector(v123.x - 400, v123.y + 400, v123.z - 300);
  drawLabeledWire(leftBatTo123_G1, leftBatTo123_G2, leftBatTo123_G3, v123, colorGround, "GROUND", false, 0.25, 50); 

  // ==========================================
  // --- GENERAL DIAGRAM LABELS (DOTTED ARROWS) ---
  // ==========================================

  // Custom function to draw a dotted 3D arrow
  function drawDashedArrow(p1, p2, col) {
    push();
    stroke(col);
    strokeWeight(5);
    let d = p1.dist(p2);
    let dir = p5.Vector.sub(p2, p1).normalize();
    let dash = 25;
    let gap = 20;
    
    // Draw dashed line
    for(let i = 0; i < d - 40; i += dash + gap) { 
      let start = p5.Vector.add(p1, p5.Vector.mult(dir, i));
      let end = p5.Vector.add(p1, p5.Vector.mult(dir, min(i + dash, d - 40)));
      line(start.x, start.y, start.z, end.x, end.y, end.z);
    }
    
    // Draw 3D Cross-shaped Arrowhead 
    let up = createVector(0, 1, 0);
    if (abs(dir.y) > 0.99) up = createVector(1, 0, 0); // Avoid gimbal lock
    let right = p5.Vector.cross(dir, up).normalize();
    up = p5.Vector.cross(right, dir).normalize();
    
    let headLen = 40;
    let headW = 20;
    let base = p5.Vector.sub(p2, p5.Vector.mult(dir, headLen));
    
    let h1 = p5.Vector.add(base, p5.Vector.mult(right, headW));
    let h2 = p5.Vector.sub(base, p5.Vector.mult(right, headW));
    let h3 = p5.Vector.add(base, p5.Vector.mult(up, headW));
    let h4 = p5.Vector.sub(base, p5.Vector.mult(up, headW));
    
    line(p2.x, p2.y, p2.z, h1.x, h1.y, h1.z);
    line(p2.x, p2.y, p2.z, h2.x, h2.y, h2.z);
    line(p2.x, p2.y, p2.z, h3.x, h3.y, h3.z);
    line(p2.x, p2.y, p2.z, h4.x, h4.y, h4.z);
    pop();
  }

  // "Back of the Costume"
  push();
  let backTextPos = createVector(-1.2 * scaleF, 0.2 * scaleF, 1.2 * scaleF);
  let backTarget = createVector(-0.5 * scaleF, 0.8 * scaleF, 1.0 * scaleF); 
  
  drawDashedArrow(backTextPos, backTarget, color(255, 150));
  
  translate(backTextPos.x, backTextPos.y, backTextPos.z);
  fill(255); noStroke(); textSize(52);
  text("BACK OF\nTHE COSTUME", 0, 70); 
  pop();

  // "Front of the Costume"
  push();
  let frontTextPos = createVector(1.2 * scaleF, -2.2 * scaleF, -1.5 * scaleF);
  let frontTarget = createVector(0.5 * scaleF, -1.5 * scaleF, -1.0 * scaleF); 
  
  drawDashedArrow(frontTextPos, frontTarget, color(255, 150));
  
  translate(frontTextPos.x, frontTextPos.y, frontTextPos.z);
  fill(255); noStroke(); textSize(52);
  text("FRONT OF\nTHE COSTUME", 0, -70); 
  pop();

  // "TOP" Label 
  push();
  let topTextPos = createVector(-1.6 * scaleF, -2.1 * scaleF, 0); 
  let topTarget = createVector(-0.9 * scaleF, -1.9 * scaleF, 0); 
  
  drawDashedArrow(topTextPos, topTarget, color(255, 140, 140, 150));
  
  translate(topTextPos.x, topTextPos.y, topTextPos.z);
  fill(255, 140, 140); noStroke(); textSize(64);
  text("TOP", -80, 0); 
  pop();

  // "SKIRT" Label 
  push();
  // Moved far to the right (X=1.75) but matching the Y/Z position of "Back of Costume"
  let skirtTextPos = createVector(1.75 * scaleF, 0.2 * scaleF, 1.2 * scaleF); 
  // Target pointing left, toward the right edge of the skirt
  let skirtTarget = createVector(1.0 * scaleF, 0.2 * scaleF, 1.0 * scaleF); 
  
  drawDashedArrow(skirtTextPos, skirtTarget, color(180, 220, 255, 150));
  
  translate(skirtTextPos.x, skirtTextPos.y, skirtTextPos.z);
  fill(180, 220, 255); noStroke(); textSize(64);
  text("SKIRT", 0, 0); // Removed the horizontal offset to keep it centered over the arrow
  pop();

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