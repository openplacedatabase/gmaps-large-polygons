module("LargePolygon");

var LargePolygon = google.maps.LargePolygon,
    Polygon = google.maps.Polygon;

test("Default line size", function(){
  equal(LargePolygon.prototype.lineSize, new LargePolygon().lineSize);
  equal(new LargePolygon().lineSize, 100);
})

test("Change global default line size", function(){
  LargePolygon.prototype.lineSize = 50;
  equal(new LargePolygon().lineSize, 50);
  LargePolygon.prototype.lineSize = 100;
})

test("Don't touch google.maps.Polygon.prototype", function(){
  equal(new LargePolygon().lineSize, 100);
  notEqual(Polygon.prototype.lineSize, LargePolygon.prototype.lineSize);
})

test("getEditable and setEditable", function(){
  // Start with false, set to true
  var ep = new LargePolygon();
  ok(!ep.getEditable());
  ep.setEditable(true);
  ok(ep.getEditable());

  // Start with true, set to false
  ep = new LargePolygon({editable:true});
  ok(ep.getEditable());
  ep.setEditable(false);
  ok(!ep.getEditable());
})