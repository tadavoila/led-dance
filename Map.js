function (pixelCount) {
  var map = [];
  
  // Top (0-39): 8 cols x 5 rows
  var topCols = 8, topRows = 5;
  var topRadius = 0.8, topHeight = 1.2, topY0 = 1.3;

  // Skirt (40-123): 12 cols x 7 rows
  var sCols = 12, sRows = 7;
  var sRadius = 1.0, sHeight = 2.0, sY0 = -1.0;
  
  var seam56 = Math.PI / 8;
  var seamWrap = Math.PI / 10;
  var usable = Math.PI * 2 - seam56 - seamWrap;
  var sStep = usable / sCols;
  var seamBoost = 0.18;
  
  // Offset to put the '0/39/40' seam on the Right (+X)
  var rightOffset = -0.2; 

  for (var i = 0; i < pixelCount; i++) {
    if (i < 40) {
      // --- TOP (Counter-Clockwise) ---
      var tc = Math.floor(i / topRows);
      var tr = (tc % 2 === 0) ? (i % topRows) : (topRows - 1 - (i % topRows));
      var y = topY0 + (tr / (topRows - 1)) * topHeight;
      var angle = (tc / topCols) * (Math.PI * 2) + rightOffset;
      map.push([Math.cos(angle) * topRadius, y, Math.sin(angle) * topRadius]);
    } 
    else if (i < 124) {
      // --- SKIRT (Fixed to Clockwise) ---
      var sI = i - 40;
      var col = Math.floor(sI / sRows);
      
      // Snake: Even cols start at TOP
      var row = (col % 2 === 0) ? (sRows - 1 - (sI % sRows)) : (sI % sRows);
      var y = sY0 + (row / (sRows - 1)) * sHeight;
      
      // We subtract the step to reverse the clock direction
      var a = rightOffset - (col * sStep) - seamWrap;
      if (col >= 6) a -= seam56; // Gap also moves clockwise
      
      var rr = sRadius + (col == 0 || col == 5 || col == 6 || col == 11 ? seamBoost : 0);
      map.push([Math.cos(a) * rr, y, Math.sin(a) * rr]);
    } 
    else {
      map.push([0, -10, 0]);
    }
  }
  return map;
}