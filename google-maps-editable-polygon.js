(function(){

  /**
   * Constructor
   */
  function EditablePolygon(options){
    this.setOptions(options);
  }

  // Mount it where the normal Polygons are
  google.maps.EditablePolygon = EditablePolygon;

  // EditablePolygon extends google.maps.Polygon
  EditablePolygon.prototype = new google.maps.Polygon();

  // Default lineSize to 100
  EditablePolygon.prototype.lineSize = 100;

  // Default to normal non-editable state
  EditablePolygon.prototype.editable = false;

  /**
   * Intercept functions that modify the polygon
   * so that we can properly update the lines
   * when necessary
   */

  EditablePolygon.prototype.setOptions = function(options){
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

  EditablePolygon.prototype.setEditable = function(editable){
    if(_isBoolean(editable)){
      this.editable = editable;
    }
  };

  EditablePolygon.prototype.getEditable = function(){
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