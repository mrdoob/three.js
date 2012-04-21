/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VTKLoader = function () {};

THREE.VTKLoader.prototype = new THREE.Loader();
THREE.VTKLoader.prototype.constructor = THREE.VTKLoader;

THREE.VTKLoader.prototype.load = function ( url, callback ) {

	var that = this;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				callback( that.parse( xhr.responseText ) );

			} else {

				console.error( 'THREE.VTKLoader: Couldn\'t load ' + url + ' (' + xhr.status + ')' );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.send( null );

};

THREE.VTKLoader.prototype.parse = function ( data ) {

	var geometry = new THREE.Geometry();

	function vertex( x, y, z ) {

		geometry.vertices.push( new THREE.Vector3( x, y, z ) );

	}

	function face3( a, b, c ) {

		geometry.faces.push( new THREE.Face3( a, b, c ) );

	}

	function face4( a, b, c, d ) {

		geometry.faces.push( new THREE.Face4( a, b, c, d ) );

	}

	var pattern, result;

	// float float float

	pattern = /([\d|\.|\+|\-|e]+)[ ]+([\d|\.|\+|\-|e]+)[ ]+([\d|\.|\+|\-|e]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		// ["1.0 2.0 3.0", "1.0", "2.0", "3.0"]

		vertex( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );

	}

	// 3 int int int

	pattern = /3[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		// ["3 1 2 3", "1", "2", "3"]

		face3( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ) );

	}

	// 4 int int int int

	pattern = /4[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		// ["4 1 2 3 4", "1", "2", "3", "4"]

		face4( parseInt( result[ 1 ] ), parseInt( result[ 2 ] ), parseInt( result[ 3 ] ), parseInt( result[ 4 ] ) );

	}

	geometry.computeCentroids();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeBoundingSphere();

	return geometry;

}
