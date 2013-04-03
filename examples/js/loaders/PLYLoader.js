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

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent,

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

		// currently only supports ASCII encoded files.
		return true;

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

	parseASCII: function ( data ) {

		// PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

		var geometry = new THREE.Geometry();

		var result;

		var patternHeader = /ply([\s\S]*)end_header/;
		var header = "";
		if ( ( result = patternHeader.exec( data ) ) != null ) {
			header = result [ 1 ];
		}

		var patternBody = /end_header([\s\S]*)$/;
		var body = "";
		if ( ( result = patternBody.exec( data ) ) != null ) {
			body = result [ 1 ];
		}

		var patternVertexCount = /element[\s]+vertex[\s]+(\d+)/g;
		var vertexCount = 0;
		if ( ( result = patternVertexCount.exec( header ) ) != null ) {
			vertexCount = parseInt( result[ 1 ] );
		}

		var patternFaceCount = /element[\s]+face[\s]+(\d+)/g;
		var faceCount = 0;
		if ( ( result = patternFaceCount.exec( header ) ) != null ) {
			faceCount = parseInt( result[ 1 ] );
		}

		if ( vertexCount != 0 && faceCount != 0 ) {
			// Vertex
			// assume x y z
			var patternVertex = /([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;
			for ( var i = 0; i < vertexCount; i++) {
				if ( ( result = patternVertex.exec( body ) ) != null ) {
					geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );
				} else {
					console.error('Vertex error: vertex count mismatch.');
					return geometry;
				}
			}

			// Face
			// assume 3 index0 index1 index2
			var patternFace = /3[\s]+([-+]?[0-9]+)[\s]+([-+]?[0-9]+)[\s]+([-+]?[0-9]+)/g;
			for (var i = 0; i < faceCount; i++) {
				if ( ( result = patternFace.exec( body ) ) != null ) {
					geometry.faces.push( new THREE.Face3( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ) ) );
				} else {
					console.error('Face error: vertex count mismatch.');
					return geometry;
				}
			}

		} else {
			console.error( 'Header error: vertexCount(' + vertexCount + '), faceCount(' + faceCount + ').' );
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
