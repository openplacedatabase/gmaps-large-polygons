var mapOptions = {
  center: new google.maps.LatLng(20, -10),
  zoom: 3,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var shapeStyle = {
  "strokeColor": "#428bca",
  "strokeOpacity": 1,
  "strokeWeight": 3,
  "fillColor": "#9999ff",
  "fillOpacity": 0.3
};

$(document).ready(function(){
  
  // Create map
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  
  //
  // Setup polygon
  //
  
  // Create a polygon with a lot of points and add it to the map
  var poly = google.maps.geojson.from(geojsonPolygon);
  poly.setOptions(shapeStyle);
  poly.setMap(map);        
  map.fitBounds(poly.getBounds());
  
  // Make the polygon editable when clicked
});

/**
 * http://stackoverflow.com/a/6339384/879121
 */
google.maps.Polygon.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  var paths = this.getPaths();
  var path;        
  for (var i = 0; i < paths.getLength(); i++) {
    path = paths.getAt(i);
    for (var ii = 0; ii < path.getLength(); ii++) {
      bounds.extend(path.getAt(ii));
    }
  }
  return bounds;
};