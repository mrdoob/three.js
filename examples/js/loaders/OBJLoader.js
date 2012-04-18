/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function () {};

THREE.OBJLoader.prototype = new THREE.Loader();
THREE.OBJLoader.prototype.constructor = THREE.OBJLoader;

THREE.OBJLoader.prototype.load = function ( url, callback ) {

	var that = this;
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				callback( that.parse( xhr.responseText ) );

				that.onLoadComplete();

			} else {

				console.error( 'THREE.OBJLoader: Couldn\'t load ' + url + ' (' + xhr.status + ')' );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.send( null );

	that.onLoadStart();

};

THREE.OBJLoader.prototype.parse = function ( data ) {

	function vertex( a, b, c ) {

		return new THREE.Vector3( parseFloat( a ), parseFloat( b ), parseFloat( c ) );

	}

	function face3( a, b, c ) {

		return new THREE.Face3( parseInt( a ) - 1, parseInt( b ) - 1, parseInt( c ) - 1 );

	}

	function face4( a, b, c, d ) {

		return new THREE.Face4( parseInt( a ) - 1, parseInt( b ) - 1, parseInt( c ) - 1, parseInt( d ) - 1 );

	}

	var objects = [];
	var vertices = [];

	var pattern, result;

	// v float float float

	pattern = /v( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

		vertices.push( vertex( result[ 1 ], result[ 2 ], result[ 3 ] ) );

	}

	var data = data.split( '\no ');

	for ( var i = 0, l = data.length; i < l; i ++ ) {

		var object = data[ i ];

		var geometry = new THREE.Geometry();

		geometry.vertices = vertices;

		// f vertex vertex vertex ...

		pattern = /f( [\d]+)( [\d]+)( [\d]+)( [\d]+)?/g;

		while ( ( result = pattern.exec( object ) ) != null ) {

			// ["f 1 2 3", "1", "2", "3", undefined]

			geometry.faces.push(
				result[ 4 ] === undefined ?
				face3( result[ 1 ], result[ 2 ], result[ 3 ] ) :
				face4( result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] )
			);

		}

		// f vertex/uv vertex/uv vertex/uv ...

		pattern = /f( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))?/g;

		while ( ( result = pattern.exec( object ) ) != null ) {

			// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

			geometry.faces.push(
				result[ 10 ] === undefined ?
				face3( result[ 2 ], result[ 5 ], result[ 8 ] ) :
				face4( result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] )
			);

		}

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

		pattern = /f( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))?/g;

		while ( ( result = pattern.exec( object ) ) != null ) {

			// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

			geometry.faces.push(
				result[ 13 ] === undefined ?
				face3( result[ 2 ], result[ 6 ], result[ 10 ] ) :
				face4( result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] )
			);

		}

		// f vertex//normal vertex//normal vertex//normal ...

		pattern = /f( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))?/g;

		while ( ( result = pattern.exec( object ) ) != null ) {

			// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

			geometry.faces.push(
				result[ 10 ] === undefined ?
				face3( result[ 2 ], result[ 5 ], result[ 8 ] ) :
				face4( result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] )
			);

		}

		geometry.computeCentroids();

		objects.push( new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) ) );

	}

	return objects;

}
