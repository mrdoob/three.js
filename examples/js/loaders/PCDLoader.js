/**
 * @author Filipe Caixeta / http://filipecaixeta.com.br
 *
 * Description: A THREE loader for PCD ascii and binary files.
 *
 * Limitations: Compressed binary files are not supported.
 *
 */

THREE.PCDLoader = function( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.littleEndian = true;

};
THREE.PCDLoader.prototype = {

	constructor: THREE.PCDLoader,

	load: function( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function( data ) {

			onLoad( scope.parse( data, url ) );

		}, onProgress, onError );

	},

	binarryToStr: function( data ) {

		var text = "";
		var charArray = new Uint8Array( data );
		for ( var i = 0; i < data.byteLength; i ++ ) {

			text += String.fromCharCode( charArray[ i ] );

		}
		return text;

	},

	parseHeader: function( data ) {

		var PCDheader = {};
		var result1 = data.search( /[\r\n]DATA\s(\S*)\s/i );
		var result2 = /[\r\n]DATA\s(\S*)\s/i.exec( data.substr( result1 - 1 ) );
		PCDheader.data = result2[ 1 ];
		PCDheader.headerLen = result2[ 0 ].length + result1;
		PCDheader.str = data.substr( 0, PCDheader.headerLen );
		// Remove comments
		PCDheader.str = PCDheader.str.replace( /\#.*/gi, "" );
		PCDheader.version = /VERSION (.*)/i.exec( PCDheader.str );
		if ( PCDheader.version != null )
		PCDheader.version = parseFloat( PCDheader.version[ 1 ] );
		PCDheader.fields = /FIELDS (.*)/i.exec( PCDheader.str );
		if ( PCDheader.fields != null )
		PCDheader.fields = PCDheader.fields[ 1 ].split( " " );
		PCDheader.size = /SIZE (.*)/i.exec( PCDheader.str );
		if ( PCDheader.size != null )
			PCDheader.size = PCDheader.size[ 1 ].split( " " ).map( function( x ) {

				return parseInt( x, 10 );

			} );
		PCDheader.type = /TYPE (.*)/i.exec( PCDheader.str );
		if ( PCDheader.type != null )
		PCDheader.type = PCDheader.type[ 1 ].split( " " );
		PCDheader.count = /COUNT (.*)/i.exec( PCDheader.str );
		if ( PCDheader.count != null )
			PCDheader.count = PCDheader.count[ 1 ].split( " " ).map( function( x ) {

				return parseInt( x, 10 );

			} );
		PCDheader.width = /WIDTH (.*)/i.exec( PCDheader.str );
		if ( PCDheader.width != null )
		PCDheader.width = parseInt( PCDheader.width[ 1 ] );
		PCDheader.height = /HEIGHT (.*)/i.exec( PCDheader.str );
		if ( PCDheader.height != null )
		PCDheader.height = parseInt( PCDheader.height[ 1 ] );
		PCDheader.viewpoint = /VIEWPOINT (.*)/i.exec( PCDheader.str );
		if ( PCDheader.viewpoint != null )
		PCDheader.viewpoint = PCDheader.viewpoint[ 1 ];
		PCDheader.points = /POINTS (.*)/i.exec( PCDheader.str );
		if ( PCDheader.points != null )
		PCDheader.points = parseInt( PCDheader.points[ 1 ], 10 );
		if ( PCDheader.points == null )
		PCDheader.points = PCDheader.width * PCDheader.height;

		if ( PCDheader.count == null ) {

			PCDheader.count = [];
			for ( var i = 0; i < PCDheader.fields; i ++ )
			PCDheader.count.push( 1 );

		}

		PCDheader.offset = {}
		var sizeSum = 0;
		for ( var i = 0; i < PCDheader.fields.length; i ++ ) {

			if ( PCDheader.data == "ascii" ) {

				PCDheader.offset[ PCDheader.fields[ i ]] = i;

			} else {

				PCDheader.offset[ PCDheader.fields[ i ]] = sizeSum;
				sizeSum += PCDheader.size[ i ];

			}

		}
		// For binary only
		PCDheader.rowSize = sizeSum;

		return PCDheader;

	},

	parse: function( data, url ) {

		var textData = this.binarryToStr( data );

		// Parse the header
		// Header is always ascii format
		var PCDheader = this.parseHeader( textData );

		// Parse the data
		var position = false;
		if ( PCDheader.offset.x != undefined )
		position = new Float32Array( PCDheader.points * 3 );
		var color = false;
		if ( PCDheader.offset.rgb != undefined)
		color = new Float32Array( PCDheader.points * 3 );
		var normal = false;
		if ( PCDheader.offset.normal_x != undefined )
		normal = new Float32Array( PCDheader.points * 3 );

		if ( PCDheader.data == "ascii" ) {

			var offset = PCDheader.offset;
			var pcdData = textData.substr( PCDheader.headerLen );
			var lines = pcdData.split( '\n' );
			var i3 = 0;
			for ( var i = 0; i < lines.length; i ++, i3 += 3 ) {

				var line = lines[ i ].split( " " );
				if ( offset.x != undefined ) {

					position[ i3 + 0 ] = parseFloat( line[ offset.x ] );
					position[ i3 + 1 ] = parseFloat( line[ offset.y ] );
					position[ i3 + 2 ] = parseFloat( line[ offset.z ] );

				}
				if ( offset.rgb != undefined ) {

					var c = new Float32Array([parseFloat( line[ offset.rgb ] )]);
					var dataview = new DataView( c.buffer, 0 );
					color[ i3 + 0 ] = dataview.getUint8(0)/255.0;
					color[ i3 + 1 ] = dataview.getUint8(1)/255.0;
					color[ i3 + 2 ] = dataview.getUint8(2)/255.0;

				}
				if ( offset.normal_x != undefined ) {

					normal[ i3 + 0 ] = parseFloat( line[ offset.normal_x ] );
					normal[ i3 + 1 ] = parseFloat( line[ offset.normal_y ] );
					normal[ i3 + 2 ] = parseFloat( line[ offset.normal_z ] );

				}

			}

		}

		if ( PCDheader.data == "binary_compressed" ) {

			console.error( 'THREE.PCDLoader: binary_compressed files are not supported' );
			return;

		}

		if ( PCDheader.data == "binary" ) {

			var row = 0;
			var dataview = new DataView( data, PCDheader.headerLen );
			var i = 0;
			var offset = PCDheader.offset;
			for ( var i3 = 0; i < PCDheader.points; i3 += 3, row += PCDheader.rowSize, i ++ ) {

				if ( offset.x != undefined ) {

					position[ i3 + 0 ] = dataview.getFloat32( row + offset.x, this.littleEndian );
					position[ i3 + 1 ] = dataview.getFloat32( row + offset.y, this.littleEndian );
					position[ i3 + 2 ] = dataview.getFloat32( row + offset.z, this.littleEndian );

				}
				if ( offset.rgb != undefined ) {

					color[ i3 + 0 ] = dataview.getUint8( row + offset.rgb + 0 ) / 255.0;
					color[ i3 + 1 ] = dataview.getUint8( row + offset.rgb + 1 ) / 255.0;
					color[ i3 + 2 ] = dataview.getUint8( row + offset.rgb + 2 ) / 255.0;

				}
				if ( offset.normal_x != undefined ) {

					normal[ i3 + 0 ] = dataview.getFloat32( row + offset.normal_x, this.littleEndian );
					normal[ i3 + 1 ] = dataview.getFloat32( row + offset.normal_y, this.littleEndian );
					normal[ i3 + 2 ] = dataview.getFloat32( row + offset.normal_z, this.littleEndian );

				}

			}

		}

		var geometry = new THREE.BufferGeometry();
		if ( position != false )
		geometry.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ) );
		if ( color != false )
		geometry.addAttribute( 'color', new THREE.BufferAttribute( color, 3 ) );
		if ( normal != false )
		geometry.addAttribute( 'normal', new THREE.BufferAttribute( normal, 3 ) );

		geometry.computeBoundingSphere();

		var material = new THREE.PointsMaterial( { size: 0.005,
		vertexColors: !(color == false) } );
		if ( color == false )
			material.color.setHex( Math.random() * 0xffffff );
		
		var mesh = new THREE.Points( geometry, material );
		var name = url.split( '' ).reverse().join( '' );
		name = /([^\/]*)/.exec( name );
		name = name[ 1 ].split( '' ).reverse().join( '' );
		mesh.name = name;
		mesh.PCDheader = PCDheader;

		return mesh;

	},

};

THREE.EventDispatcher.prototype.apply( THREE.PCDLoader.prototype );
