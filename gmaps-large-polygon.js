(function(){

  var polyProto = google.maps.Polygon.prototype;      

  // Default lineSize to 100
  polyProto.lineSize = 100;

  // Default to normal non-editable state
  polyProto.editable = false;
  
  // Default highlight color for edit lines
  polyProto.highlightColor = '#cccccc';
   
  /**
   * Override setOptions so that we can intercept
   * the editable and lineSize options.
   */
  var _setOptions = polyProto.setOptions;
  polyProto.setOptions = function(options){
    if(_isObject(options)){
      
      // Intercept the editable option
      var editable = this.getEditable();
      if(!_isUndefined(options.editable)){
        editable = options.editable;
        delete options.editable;
      }
      
      // Intercept the lineSize option
      var lineSize = this.lineSize;
      if(!_isUndefined(options.lineSize)){
        lineSize = options.lineSize;
        delete options.lineSize;
      }
      
      // Intercept the highlightColor option
      var highlightColor = this.highlightColor;
      if(!_isUndefined(options.highlightColor)){
        highlightColor = options.highlightColor;
        delete options.highlightColor;
      }

      // Pass other options on to the Polygon
      _setOptions.call(this, options);

      // Set the new properties after setting
      // normal Polygon properties so that we
      // can be sure to get the last say on
      // any settings or behavior
      this.lineSize = lineSize;
      this.setEditable(editable);
      this.highlightColor = highlightColor;
    }
  }
 
  /**
   * Override the setEditable function so that
   * we know when to generate the polylines
   */
  polyProto.setEditable = function(editable){
    if(_isBoolean(editable)){
      this.editable = editable;
    }
  };
  
  /**
   * Override getEditable since we don't
   * actually make the underlying polygon
   * editable
   */
  polyProto.getEditable = function(){
    return this.editable;
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