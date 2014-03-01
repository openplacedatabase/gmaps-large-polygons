module("Large Polygon");

var Polygon = google.maps.Polygon;

test("Default line size", function(){
  equal(Polygon.prototype.lineSize, new Polygon().getLineSize());
  equal(new Polygon().getLineSize(), 100);
})

test("Change global default line size", function(){
  Polygon.prototype.lineSize = 50;
  equal(new Polygon().getLineSize(), 50);
  Polygon.prototype.lineSize = 100;
})

test("getEditable and setEditable", function(){
  // Start with false, set to true
  var ep = new Polygon();
  ok(!ep.getEditable());
  ep.setEditable(true);
  ok(ep.getEditable());

  // Start with true, set to false
  ep = new Polygon({editable:true});
  ok(ep.getEditable());
  ep.setEditable(false);
  ok(!ep.getEditable());
})