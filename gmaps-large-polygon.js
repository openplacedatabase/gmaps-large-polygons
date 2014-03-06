(function(){

  var polyProto = google.maps.Polygon.prototype;      

  // Default lineSize to 100
  polyProto.lineSize = 100;

  // Default to normal non-editable state
  polyProto.editable = false;
  
  // Default highlight color for edit lines
  polyProto.highlightColor = '#cccccc';
  
  polyProto.editLines = [];
   
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
      
      // Keep track of whether a point event was fired
      // by the user or by us updating a neighbor point
      var updatingNeighbor = false;
      
      // Setup event listeners on the line's paths so that
      // we can update the underlying shape when the lines change
      $.each(lines, function(i, line){
        
        // New point
        line.getPath().addListener('insert_at', function(){
          self.updateFromLines(pathIndex, lines);
        });
        
        // Point removed
        line.getPath().addListener('remove_at', function(){
          self.updateFromLines(pathIndex, lines);
        });
        
        // Point moved
        line.getPath().addListener('set_at', function(vertex){
          
          // When either the first or last point was moved we need
          // to move the matching point of the neighboring line.
          // Because lines may be deleted (unlikely, but possible)
          // we have to figure out the line's position and neighbors
          // at runtime.
          if((vertex === 0 || vertex === this.getLength() - 1) && !updatingNeighbor){
            var neighbor = findNeighbor(lines, line, vertex);
            updatingNeighbor = true;
            neighbor.path.setAt(neighbor.index, this.getAt(vertex));
          } 
          
          // Update underlying shape with changes only if we're moving
          // a point in the middle of the line or we're updating a neighbor
          // point after the user moved a first/last point
          else {
            updatingNeighbor = false;
            self.updateFromLines(pathIndex, lines);
          }
        });
        
        // Deleting a point when rightclicked.
        // updateFromLines is not called here to update the polygon
        // because we modify the lines which fire the event listeners
        // bound above which then call updateFromLines
        // Inspired by http://stackoverflow.com/a/14441786
        line.addListener('rightclick', function(event){
          var vertex = event.vertex;
          
          if(vertex != null){
            
            // Remove the point
            this.getPath().removeAt(event.vertex);
            
            // If the point being removed is the first or last
            // point in the line then we need to find and move
            // the neigbor's point to match our new end point.
            if(vertex === 0 || vertex === this.getPath().getLength()){
              var neighbor = findNeighbor(lines, this, vertex),
                  newEndIndex = vertex === 0 ? 0 : this.getPath().getLength() - 1;
              neighbor.path.setAt(neighbor.index, this.getPath().getAt(newEndIndex));
            }
            
            // If there is only one point left then delete the line.
            // It's neghbors should both be overlapping now.
            if(this.getPath().getLength() === 1){
              this.setMap(null);
              var linePos = lines.indexOf(this);
              lines.splice(linePos, 1);
            }            

            // Delete the entire path if there is less than
            // three points left; with only one or two points
            // you don't have a polygon
            if(self.getPaths().getAt(pathIndex).getLength() < 3){
              self.getPaths().removeAt(pathIndex);
              // If this path isn't the last one then it will change
              // the ordering and make pathIndex irrelevent and break
              // a lot of code
            }
          }
        });
      });
      
      self.editLines = self.editLines.concat(lines);

    });
  };
  
  /** 
   * Called whenever lines change; updates the specified
   * path of the shape based on the lines that were
   * derived from it
   */
  polyProto.updateFromLines = function(pathIndex, lines){
    var newPoints = [];
    for(var i = 0; i < lines.length; i++){
      var linePath = lines[i].getPath(),
          lineLength = linePath.getLength();
      linePath.forEach(function(point, j){
        // Don't add the last point of each line
        // because those are duplicated
        if(j !== lineLength - 1){
          newPoints.push(point);
        }
      });
    }
    this.getPaths().setAt(pathIndex, new google.maps.MVCArray(newPoints));
    // This gets fired twice when deleting the ends of edit lines
    // google.maps.event.trigger(this, 'changed');
  };
  
  /**
   * Finds the neighboring path and point index for
   * updating a neighbor's matching end point.
   */
  function findNeighbor(lines, line, pointIndex){
    var numLines = lines.length,
        lineIndex = lines.indexOf(line),
        neighborLineIndex, neighborPath, neighborPointIndex;
    
    // First point in line
    if(pointIndex === 0){
      neighborLineIndex = lineIndex === 0 ? numLines - 1 : lineIndex - 1;
      neighborPath = lines[neighborLineIndex].getPath();
      neighborPointIndex = neighborPath.getLength() - 1;
    }
    
    // Last point in line
    else {
      neighborLineIndex = lineIndex === numLines - 1 ? 0 : lineIndex + 1;
      neighborPath = lines[neighborLineIndex].getPath();
      neighborPointIndex = 0;
    }
    
    return {
      path: neighborPath,
      index: neighborPointIndex
    };
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