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
 *	var loader = new THREE.PLYLoader();
 *	loader.addEventListener( 'load', function ( event ) {
 *
 *		var geometry = event.content;
 *		scene.add( new THREE.Mesh( geometry ) );
 *
 *	} );
 *	loader.load( './models/ply/ascii/dolphins.ply' );
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

	isASCII: function( data ){

		var header = this.parseHeader( this.bin2str( data ) );
		
		return header.format === "ascii";

	},

	parse: function ( data ) {

		if ( data instanceof ArrayBuffer ) {

			return this.isASCII( data )
				? this.parseASCII( this.bin2str( data ) )
				: this.parseBinary( data );

		} else {

			return this.parseASCII( data );

		}

	},

	parseHeader: function ( data ) {
		
		var patternHeader = /ply([\s\S]*)end_header\n/;
		var headerText = "";
		if ( ( result = patternHeader.exec( data ) ) != null ) {
			headerText = result [ 1 ];
		}
		
		var header = new Object();
		header.comments = [];
		header.elements = [];
		header.headerLength = result[0].length;
		
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
		geometry.useColor = false;
		
		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim()
			if ( line === "" ) { continue; }
			
			if ( currentElementCount >= header.elements[currentElement].count ) {

				currentElement++;
				currentElementCount = 0;

			}
			
			var element = this.parseASCIIElement( header.elements[currentElement].properties, line );
			
			this.handleElement( geometry, header.elements[currentElement].name, element );
			
			currentElementCount++;
			
		}

		return this.postProcess( geometry );

	},

	postProcess: function ( geometry ) {
		
		if ( geometry.useColor ) {
			
			for ( var i = 0; i < geometry.faces.length; i ++ ) {
				
				geometry.faces[i].vertexColors = [
					geometry.colors[geometry.faces[i].a],
					geometry.colors[geometry.faces[i].b],
					geometry.colors[geometry.faces[i].c]
				];
				
			}
			
			geometry.elementsNeedUpdate = true;
			
		}

		geometry.computeBoundingSphere();

		return geometry;
		
	},

	handleElement: function ( geometry, elementName, element ) {
		
		if ( elementName === "vertex" ) {

			geometry.vertices.push(
				new THREE.Vector3( element.x, element.y, element.z )
			);
			
			if ( 'red' in element && 'green' in element && 'blue' in element ) {
				
				geometry.useColor = true;
				
				color = new THREE.Color();
				color.setRGB( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );
				geometry.colors.push( color );
				
			}

		} else if ( elementName === "face" ) {

			geometry.faces.push(
				new THREE.Face3( element.vertex_indices[0], element.vertex_indices[1], element.vertex_indices[2] )
			);

		}
		
	},

	binaryRead: function ( dataview, at, type, little_endian ) {

		switch( type ) {

			// corespondences for non-specific length types here match rply:
		case 'int8':		case 'char':	 return [ dataview.getInt8( at ), 1 ];

		case 'uint8':		case 'uchar':	 return [ dataview.getUint8( at ), 1 ];

		case 'int16':		case 'short':	 return [ dataview.getInt16( at, little_endian ), 2 ];

		case 'uint16':	case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];

		case 'int32':		case 'int':		 return [ dataview.getInt32( at, little_endian ), 4 ];

		case 'uint32':	case 'uint':	 return [ dataview.getUint32( at, little_endian ), 4 ];

		case 'float32': case 'float':	 return [ dataview.getFloat32( at, little_endian ), 4 ];

		case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];
			
		}
		
	},

	binaryReadElement: function ( dataview, at, properties, little_endian ) {
		
		var element = Object();
		var result, read = 0;
		
		for ( var i = 0; i < properties.length; i ++ ) {
		 
			if ( properties[i].type === "list" ) {
				
				var list = [];

				result = this.binaryRead( dataview, at+read, properties[i].countType, little_endian );
				var n = result[0];
				read += result[1];
				
				for ( j = 0; j < n; j ++ ) {
					
					result = this.binaryRead( dataview, at+read, properties[i].itemType, little_endian );
					list.push( result[0] );
					read += result[1];
					
				}
				
				element[ properties[i].name ] = list;
				
			} else {
				
				result = this.binaryRead( dataview, at+read, properties[i].type, little_endian );
				element[ properties[i].name ] = result[0];
				read += result[1];
				
			}
			
		}
		
		return [ element, read ];
		
	},

	parseBinary: function ( data ) {

		var geometry = new THREE.Geometry();

		var header = this.parseHeader( this.bin2str( data ) );
		var little_endian = (header.format === "binary_little_endian");
		var body = new DataView( data, header.headerLength );
		var result, loc = 0;

		for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {
			
			for ( var currentElementCount = 0; currentElementCount < header.elements[currentElement].count; currentElementCount ++ ) {
			
				result = this.binaryReadElement( body, loc, header.elements[currentElement].properties, little_endian );
				loc += result[1];
				var element = result[0];
			
				this.handleElement( geometry, header.elements[currentElement].name, element );
			
			}
			
		}
		
		return this.postProcess( geometry );
		
	}

};

THREE.EventDispatcher.prototype.apply( THREE.PLYLoader.prototype );
