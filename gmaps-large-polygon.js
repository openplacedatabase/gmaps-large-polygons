(function(){

  var polyProto = google.maps.Polygon.prototype;      

  // Default lineSize to 100
  polyProto.lineSize = 100;

  // Default to normal non-editable state
  polyProto.editable = false;

  /**
   * Intercept functions that modify the polygon
   * so that we can properly update the lines
   * when necessary
   */
   
  var _setOptions = polyProto.setOptions;
   
  /**
   * Override setOptions so that we can intercept
   * the editable and lineSize options.
   */
  polyProto.setOptions = function(options){
    if(_isObject(options)){
      
      // Intercept the editable and lineSize options
      var editable = this.getEditable();
      if(!_isUndefined(options.editable)){
        editable = options.editable;
        delete options.editable;
      }
      
      var lineSize = this.getLineSize();
      if(!_isUndefined(options.lineSize)){
        lineSize = options.lineSize;
        delete options.lineSize;
      }

      // Pass other options on to the Polygon
      _setOptions.call(this, options);

      this.lineSize = lineSize;
      this.setEditable(editable);
    }
  }
 
  /**
   * Intercept the setEditable function so that
   * we know when to generate the polylines
   */
  polyProto.setEditable = function(editable){
    if(_isBoolean(editable)){
      this.editable = editable;
    }
  };
  
  polyProto.getEditable = function(){
    return this.editable;
  };
  
  polyProto.getLineSize = function(){
    return this.lineSize;
  };

  /**
   * Utility function lifted from underscore
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