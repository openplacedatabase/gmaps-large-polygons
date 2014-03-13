gmaps-large-polygon
============================

gmaps-large-polygons makes it possible to edit large polygons. 
Without it, it's nigh impossible to edit polygons with more than a few thousand 
points without crashing the browser due to allocating so many objects and handlers 
for the vertexes. gmaps-large-polygons fixes this by only allowing a small portion of the 
polygon's borders to be editable at a time.

````javascript
var polygon = new google.maps.Polygon(options);
````

See the [demo](http://openplacedatabase.github.io/gmaps-large-polygon/).
