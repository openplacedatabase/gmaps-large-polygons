gmaps-large-polygon
============================

gmaps-large-polygons makes it possible to edit large Google Maps [Polygons](https://developers.google.com/maps/documentation/javascript/reference#Polygon). 
Without it, it's nigh [impossible to edit large polygons](http://stackoverflow.com/q/20647124/879121)
without crashing the browser due to allocating so many objects and handlers 
for the vertexes. gmaps-large-polygons fixes this by only allowing a small portion of the 
polygon's borders to be editable at a time.

````javascript
var polygon = new google.maps.Polygon(options);
````

See the [demo](http://openplacedatabase.github.io/gmaps-large-polygon/).

### Options

option  | default | description
------------- | ------------- | -------------
`lineSize`  | `100` | The max number of points which an editable line segment will have. Segments may have less than this number but they will _never_ have more.
`highlightColor`  | `#000000` | The color that line segments will turn when hovered over for selecting before editing. It can be difficult to get the mouse in the right spot for selection so this helps indicate whether the mouse is in the proper spot for selection.
