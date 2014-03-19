gmaps-large-polygons
============================

gmaps-large-polygons makes it possible to edit large Google Maps [Polygons](https://developers.google.com/maps/documentation/javascript/reference#Polygon). 
Without it, it's nigh [impossible to edit large polygons](http://stackoverflow.com/q/20647124/879121)
without crashing the browser. gmaps-large-polygons fixes this by only allowing a small portion of the 
polygon's borders to be editable at a time.

gmaps-large-polygons works by extending the regular Polygon object so you can continue using polygons as you did before.

````javascript
var polygon = new google.maps.Polygon(options);
````

If you never mark the polygons as editable, or if the number of points is less than the `lineSize`, then the polygons will behave like normal polygons. 

See the [demo](http://openplacedatabase.github.io/gmaps-large-polygons/).

### Additional Options

You may use all of the normal options for [Polygons](https://developers.google.com/maps/documentation/javascript/reference#Polygon). gmaps-large-polygons makes these additional options available:

option  | default | description
------------- | ------------- | -------------
`lineSize`  | `100` | The max number of points which an editable line segment will have. Segments may have less than this number but they will _never_ have more.
`highlightColor`  | `#000000` | The color that line segments will turn when hovered over for selecting before editing. It can be difficult to get the mouse in the right spot for selection so this helps indicate whether the mouse is in the proper spot for selection.
