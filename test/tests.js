module("Large Polygon");

var Polygon = google.maps.Polygon;

test("Default line size", function(){
  equal(Polygon.prototype.lineSize, new Polygon().lineSize);
  equal(new Polygon().lineSize, 100);
})

test("Change global default line size", function(){
  Polygon.prototype.lineSize = 50;
  equal(new Polygon().lineSize, 50);
  Polygon.prototype.lineSize = 100;
})

test("getEditable and setEditable", function(){
  // Start with false, set to true
  var poly = new Polygon();
  ok(!poly.getEditable());
  poly.setEditable(true);
  ok(poly.getEditable());

  // Start with true, set to false
  poly = new Polygon({editable:true});
  ok(poly.getEditable());
  poly.setEditable(false);
  ok(!poly.getEditable());
})

test("highlightColor", function(){
  var poly = new Polygon();
  equal(Polygon.prototype.highlightColor, poly.highlightColor);
  poly.setOptions({
    highlightColor: '#111111'
  });
  equal(poly.highlightColor, '#111111');
});

test("_lineLengths", function(){
  var tests = [
    [4, 3, [3, 3]],
    [4, 2, [2, 2, 2, 2]],
    [5, 3, [3, 3, 2]],
    [5, 4, [4, 3]],
    [5, 5, [5]],
    [9, 7, [6, 5]],
    [9, 8, [6, 5]]
  ];
  for(var i = 0; i < tests.length; i++){
    var t = tests[i];
    deepEqual(gmlp._lineLengths(t[0], t[1]), t[2]);
  }
});