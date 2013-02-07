/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 *
 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations: Binary decoding ignores header. There doesn't seem to be much of a use for it.
 *				There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *				ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 * 	var loader = new THREE.STLLoader();
 * 	loader.addEventListener( 'load', function ( event ) {
 *
 * 		var geometry = event.content;
 * 		scene.add( new THREE.Mesh( geometry ) );
 *
 * 	} );
 * 	loader.load( './models/stl/slotted_disk.stl' );
 */


THREE.STLLoader = function () {

	THREE.EventDispatcher.call( this );

};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

            var geometry;
            geometry = scope.parse( event.target.response );

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
		return str

	},

	isASCII: function(buf){

		var dv = new DataView(buf);
		var str = '';
		for(var i = 0; i < 5; i++) {
			str += String.fromCharCode(dv.getUint8(i, true)); // assume little-endian
		}
		return (str.toLowerCase() === 'solid'); // All ASCII stl files begin with 'solid'

    },

	parse: function (buf) {

		if( this.isASCII(buf) )
		{
			var str = this.bin2str(buf);
			return this.parseASCII(str);
		}
		else
		{
			return this.parseBinary(buf);
		}

    },

	parseASCII: function ( data ) {

		var geometry = new THREE.Geometry();

		var patternFace = /facet([\s\S]*?)endfacet/g;
		var result;

		while ( ( result = patternFace.exec( data ) ) != null ) {

			var text = result[ 0 ];

			// Normal
			var patternNormal = /normal[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;

			while ( ( result = patternNormal.exec( text ) ) != null ) {

				var normal = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );

			}

			// Vertex
			var patternVertex = /vertex[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;

			while ( ( result = patternVertex.exec( text ) ) != null ) {

				geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );

			}

			var len = geometry.vertices.length;
			geometry.faces.push( new THREE.Face3( len - 3, len - 2, len - 1, normal ) );

		}

		geometry.computeCentroids();
		geometry.computeBoundingSphere();

		return geometry;

	},

	parseBinary: function (buf) {

		// STL binary format specification, as per http://en.wikipedia.org/wiki/STL_(file_format)
		//
		// UINT8[80] – Header
		// UINT32 – Number of triangles
		//
		// foreach triangle
		//   REAL32[3] – Normal vector
		//   REAL32[3] – Vertex 1
		//   REAL32[3] – Vertex 2
		//   REAL32[3] – Vertex 3
		//   UINT16 – Attribute byte count
		// end
		//

		var geometry = new THREE.Geometry();

		var headerLength = 80;
		var dataOffset = 84;
		var faceLength = 12*4 + 2;

		var le = true; // is little-endian  // This might be processor dependent...

		// var header = new Uint8Array(buf, 0, headerLength); // not presently used
		var dvTriangleCount = new DataView(buf, headerLength, 4);
		var numTriangles = dvTriangleCount.getUint32(0, le);

		for (var i = 0; i < numTriangles; i++) {

			var dv = new DataView(buf, dataOffset + i*faceLength, faceLength);

			var normal = new THREE.Vector3( dv.getFloat32(0, le), dv.getFloat32(4, le), dv.getFloat32(8, le) );

			for(var v = 3; v < 12; v+=3) {

				geometry.vertices.push( new THREE.Vector3( dv.getFloat32(v*4, le), dv.getFloat32((v+1)*4, le), dv.getFloat32( (v+2)*4, le ) ) );

			}
			var len = geometry.vertices.length;
			geometry.faces.push( new THREE.Face3( len - 3, len - 2, len - 1, normal ) );
		}

		geometry.computeCentroids();
		geometry.computeBoundingSphere();

		return geometry;
	}

};
