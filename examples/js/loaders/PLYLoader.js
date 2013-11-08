/**
 * @author Wei Meng / http://about.me/menway
 *
 * Description: A THREE loader for PLY ASCII files (known as the Polygon File Format or the Stanford Triangle Format).
 *
 * Currently only supports ASCII encoded files.
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * Usage:
 * 	var loader = new THREE.PLYLoader();
 * 	loader.addEventListener( 'load', function ( event ) {
 *
 * 		var geometry = event.content;
 * 		scene.add( new THREE.Mesh( geometry ) );
 *
 * 	} );
 * 	loader.load( './models/ply/ascii/dolphins.ply' );
 */


THREE.PLYLoader = function () {};

THREE.PLYLoader.prototype = {

	constructor: THREE.PLYLoader,

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var geometry = scope.parse( event.target.response );

			scope.dispatchEvent( { type: 'load', content: geometry } );

			if ( callback ) callback( geometry );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.responseType = "arraybuffer";
		request.send( null );

	},

	bin2str: function (buf) {

		var array_buffer = new Uint8Array(buf);
		var str = '';
		for(var i = 0; i < buf.byteLength; i++) {
			str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
		}

		return str;

	},

	isASCII: function(buf){

    var header = this.parseHeader( buf );
    
		// currently only supports ASCII encoded files.
		return header.format === "ascii";

	},

	parse: function ( data ) {

		if ( data instanceof ArrayBuffer ) {

			return this.isASCII( this.bin2str( data ) )
				? this.parseASCII( this.bin2str( data ) )
				: this.parseBinary( data );

		} else {

			return this.parseASCII( data );

		}

	},

  parseHeader: function ( data ) {
		
    var patternHeader = /ply([\s\S]*)end_header/;
		var headerText = "";
		if ( ( result = patternHeader.exec( data ) ) != null ) {
			headerText = result [ 1 ];
		}
    
    var header = new Object();
    header.comments = [];
    header.elements = [];
    
		var lines = headerText.split( '\n' );
    var currentElement = undefined;
    var lineType, lineValues;

    function make_ply_element_property(propertValues) {
      
      var property = Object();

      property.type = propertValues[0]
      
      if ( property.type === "list" ) {
        
        property.name = propertValues[3]
        property.countType = propertValues[1]
        property.itemType = propertValues[2]

      } else {

        property.name = propertValues[1]

      }

      return property
      
    }
    
		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim()
      if ( line === "" ) { continue; }
      lineValues = line.split( /\s+/ );
      lineType = lineValues.shift()
      line = lineValues.join(" ")
      
      switch( lineType ) {
        
      case "format":
        header.format = lineValues[0];
        header.version = lineValues[1];
        break;

      case "comment":
        header.comments.push(line);
        break;

      case "element":
        if ( !(currentElement === undefined) ) {
          header.elements.push(currentElement);
        }
        currentElement = Object();
        currentElement.name = lineValues[0];
        currentElement.count = parseInt( lineValues[1] );
        currentElement.properties = [];
        break;
        
      case "property":
        currentElement.properties.push( make_ply_element_property( lineValues ) );
        break;
        

      default:
        console.log("unhandled", lineType, lineValues);

      }

    }
    
    if ( !(currentElement === undefined) ) {
      header.elements.push(currentElement);
    }
    
    return header;
    
  },

  parseASCIINumber: function ( n, type ) {
    
    switch( type ) {
      
    case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
    case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':
      return parseInt( n );

    case 'float': case 'double': case 'float32': case 'float64':
      return parseFloat( n );
      
    }
    
  },

  parseASCIIElement: function ( properties, line ) {

    values = line.split( /\s+/ );
    
    var element = Object();
    
    for ( var i = 0; i < properties.length; i ++ ) {
      
      if ( properties[i].type === "list" ) {
        
        var list = [];
        var n = this.parseASCIINumber( values.shift(), properties[i].countType );

        for ( j = 0; j < n; j ++ ) {
          
          list.push( this.parseASCIINumber( values.shift(), properties[i].itemType ) );
          
        }
        
        element[ properties[i].name ] = list;
        
      } else {
        
        element[ properties[i].name ] = this.parseASCIINumber( values.shift(), properties[i].type );
        
      }
      
    }
    
    return element;
    
  },

	parseASCII: function ( data ) {

		// PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

		var geometry = new THREE.Geometry();

		var result;

    var header = this.parseHeader( data );

		var patternBody = /end_header\n([\s\S]*)$/;
		var body = "";
		if ( ( result = patternBody.exec( data ) ) != null ) {
			body = result [ 1 ];
		}
    
		var lines = body.split( '\n' );
    var currentElement = 0;
    var currentElementCount = 0;
    
		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim()
      if ( line === "" ) { continue; }
      
      if ( currentElementCount >= header.elements[currentElement].count ) {

        currentElement++;
        currentElementCount = 0;

      }
      
      var element = this.parseASCIIElement( header.elements[currentElement].properties, line );
      
      if ( header.elements[currentElement].name === "vertex" ) {

        geometry.vertices.push(
          new THREE.Vector3( element.x, element.y, element.z )
        );

      } else if ( header.elements[currentElement].name === "face" ) {

        geometry.faces.push(
          new THREE.Face3( element.vertex_indices[0], element.vertex_indices[1], element.vertex_indices[2] )
        );

      }
      
      currentElementCount++;
      
    }

		geometry.computeCentroids();
		geometry.computeBoundingSphere();

		return geometry;

	},

	parseBinary: function (buf) {

		// not supported yet
		console.error('Not supported yet.');

	}


};

THREE.EventDispatcher.prototype.apply( THREE.PLYLoader.prototype );
