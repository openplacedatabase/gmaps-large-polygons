module("EditablePolygon");

var EditablePolygon = google.maps.EditablePolygon,
    Polygon = google.maps.Polygon;

test("Default line size", function(){
  equal(EditablePolygon.prototype.lineSize, new EditablePolygon().lineSize);
  equal(new EditablePolygon().lineSize, 100);
})

test("Change global default line size", function(){
  EditablePolygon.prototype.lineSize = 50;
  equal(new EditablePolygon().lineSize, 50);
  EditablePolygon.prototype.lineSize = 100;
})

test("Don't touch google.maps.Polygon.prototype", function(){
  equal(new EditablePolygon().lineSize, 100);
  notEqual(Polygon.prototype.lineSize, EditablePolygon.prototype.lineSize);
})

test("getEditable and setEditable", function(){
  // Start with false, set to true
  var ep = new EditablePolygon();
  ok(!ep.getEditable());
  ep.setEditable(true);
  ok(ep.getEditable());

  // Start with true, set to false
  ep = new EditablePolygon({editable:true});
  ok(ep.getEditable());
  ep.setEditable(false);
  ok(!ep.getEditable());
})