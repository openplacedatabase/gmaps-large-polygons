(function(){

  /**
   * Constructor
   */
  function LargePolygon(options){
    this.setOptions(options);
  }

  // Mount it where the normal Polygons are
  google.maps.LargePolygon = LargePolygon;

  // LargePolygon extends google.maps.Polygon
  LargePolygon.prototype = new google.maps.Polygon();

  // Default lineSize to 100
  LargePolygon.prototype.lineSize = 100;

  // Default to normal non-editable state
  LargePolygon.prototype.editable = false;

  /**
   * Intercept functions that modify the polygon
   * so that we can properly update the lines
   * when necessary
   */

  LargePolygon.prototype.setOptions = function(options){
    if(_isObject(options)){
      
      // Intercept the editable and lineSize options
      var editable = this.getEditable(), 
          lineSize = this.lineSize;
      if(!_isUndefined(options.editable)){
        editable = options.editable;
        delete options.editable;
      }
      if(!_isUndefined(options.lineSize)){
        lineSize = options.lineSize;
        delete options.lineSize;
      }

      // Pass other options on to the Polygon
      google.maps.Polygon.prototype.setOptions.call(this, options);

      this.lineSize = lineSize;
      this.setEditable(editable);
    }
  }

  LargePolygon.prototype.setEditable = function(editable){
    if(_isBoolean(editable)){
      this.editable = editable;
    }
  };

  LargePolygon.prototype.getEditable = function(){
    return this.editable;
  };

  /**
   * Lifted from underscore
   */

  _isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  _isUndefined = function(obj) {
    return obj === void 0;
  };

  _isString = function(obj){
    return toString.call(obj) == '[object String]';
  };

  _isObject = function(obj) {
    return obj === Object(obj);
  };

  _isArray = Array.isArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

}());