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
      if(editable){
        this.generateEditLines();
      }
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
   * Create the edit lines
   */
  polyProto.generateEditLines = function(){
    
    var self = this,
        map = self.getMap(),
        lineStyle = {
          strokeColor: self.get('strokeColor'),
          strokeOpacity: self.get('strokeOpacity'),
          strokeWeight: self.get('strokeWeight')
        };
    
    // Process each path independently
    this.getPaths().forEach(function(path, pathIndex){

      var lineLengths = _lineLengths(path.getLength(), self.lineSize),
          lines = [];
      
      // Iterate over each edit line
      var position = 0;
      for(var i = 0; i < lineLengths.length; i++){
        var newLinePath = [],
            end = Math.min(position + lineLengths[i], path.getLength());
        
        // Add the relevent points to the line's path
        for(; position < end; position++){
          newLinePath.push(path.getAt(position));
        }
        
        // Decrement position by 1 so that the next
        // line duplicates the last point of this line
        position--;
        
        // Create the google maps line object
        // and style it to match the polygon's borders
        var line = new google.maps.Polyline();
        line.setPath(newLinePath);
        line.setOptions(lineStyle);
        line.setMap(map);
        
        // Add events
        line.addListener('click', function(){
          this.setEditable(true);
        });
        line.addListener('mouseover', function(){
          this.set('strokeColor', self.highlightColor);
        });
        line.addListener('mouseout', function(){
          this.setOptions(lineStyle);
        });
        
        // Save the line
        lines.push(line);
      }
      
      // Add the first point of the path to the end of the last line
      lines[lines.length-1].getPath().push(path.getAt(0));
      
      // Setup event listeners on the line's paths so that
      // we can update the shape appropriately

    });
  };
  
  /**
   * Calculate length of each edit line.
   * Returns an array of numbers which represent
   * the length. Tries to even out the length of 
   * the lines as best it can.
   */
  function _lineLengths(pathLength, lineSizeLimit){
    
    // Short circuit if there will only be one edit line
    if(lineSizeLimit >= pathLength){
      return [pathLength];
    }
    
    var rawNum = _numLines(pathLength, lineSizeLimit),
        numLines = Math.floor(rawNum),
        remainder = rawNum - numLines,
        lineLengths = [];
    
    // If lineSizeLimit divides into pathLenght evenly
    // then just return an array of length numLines
    // filled with lineSizeLimit.
    lineLengths = _numberArray(lineSizeLimit, numLines);
    
    // If lineSize doesn't divide into the pathLength evently
    // then try to even out the lengths of the lines.
    if(remainder) {
      var lastLength = Math.ceil(lineSizeLimit * remainder);
      
      // The last line cannot have 1 point
      if(lastLength < 2){
        lastLength = 2;
      }
      
      lineLengths.push(lastLength);
      
      // Starting at the second to last number (skip the
      // number we just pushed on), iterate backwards
      // over the array and decrement the numbers by one
      // until we make up the difference between the
      // lastLength and the LineSizeLimit
      
      var difference = lineSizeLimit - lastLength - 1,
          i = lineLengths.length - 2,
          last = lineLengths.length - 1;
          
      while(difference > 0){
        // Allow i to wrap back to the end
        if(i < 0){
          i = lineLengths.length - 1;
        }
        lineLengths[i] = lineLengths[i] - 1;
        difference--; 
        i--; 
        lineLengths[last]++;
      }            
    }
    
    return lineLengths;
  };
  
  /**
   * Generate an array filled with a given number
   */
  function _numberArray(number, length){
    var array = [];
    for(var i = 0; i < length; i++){
      array[i] = number;
    }
    return array;
  };
  
  /**
   * Calculate number of edit lines
   */
  function _numLines(pathLength, lineSizeLimit){
    // Subtract one frome lineSizeLimit to account for
    // overlapping points at the edges.
    return pathLength / (lineSizeLimit - 1);
  };

  /**
   * Utility functions lifted from underscore
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
  
  /**
   * Expose some internal functions when testing
   */
  if(window.GMAPS_LARGE_POLYGON_TESTING){
    window.gmlp = {
      _lineLengths: _lineLengths,
      _numLines: _numLines
    };
  }

}());