google-maps-editable-polygon
============================

Google Maps EditablePolygon class which makes it possible to edit large polygons. Without it, it's nigh impossible to edit polygons with more than a few thousand points without crashing the browser due to allocating so many objects and handlers for the vertexes. EditablePolygon fixes this by only allowing a small portion of the polygon's borders to be editable at a time. EditablePolygons behave just like regular Polygons in every other respect.

````javascript
var polygon = new google.maps.EditablePolygon(options);
````