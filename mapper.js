 function (pixelCount) {
  var cols = 12
  var rows = 7
  var mapped = cols * rows // 84

  var radius = 1.0
  var height = 2.0
  var y0 = -height / 2

  var seam56 = Math.PI / 8
  var seamWrap = Math.PI / 10

  var usable = Math.PI * 2 - seam56 - seamWrap
  var step = usable / cols

  var seamBoost = 0.18

  var map = []

  for (var i = 0; i < pixelCount; i++) {
    if (i >= mapped) {
      map.push([0, -10, 0]) // park unused pixels far away
      continue
    }

    var col = Math.floor(i / rows)
    var r = i % rows
    var row = (col % 2 === 0) ? r : (rows - 1 - r)

    var y = y0 + (row / (rows - 1)) * height

    var a = col * step
    if (col >= 6) a += seam56
    a += seamWrap

    var rr = radius
    if (col == 5 || col == 6 || col == 11 || col == 0) rr = radius + seamBoost

    var x = Math.cos(a) * rr
    var z = Math.sin(a) * rr

    map.push([x, y, z])
  }

  return map
}