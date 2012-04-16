/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function () {};
THREE.OBJLoader.prototype.load = function ( url, callback ) {

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {

		if ( xhr.readyState == 4 ) {

			if ( xhr.status == 200 || xhr.status == 0 ) {

				THREE.OBJLoader.prototype.parse( xhr.responseText, callback );

			} else {

				console.error( 'THREE.OBJLoader: Couldn\'t load ' + url + ' (' + xhr.status + ')' );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.send( null );

};

THREE.OBJLoader.prototype.parse = function ( data, callback ) {

	var geometry = new THREE.Geometry();

	var pattern, result;

	// vertices

	pattern = /v ([\-|\d|.]+) ([\-|\d|.]+) ([\-|\d|.]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		var vertex = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );
		geometry.vertices.push( vertex );

	}

	// faces: vertex/uv/normal

	pattern = /f ([\d]+)\/([\d]+)\/([\d]+) ([\d]+)\/([\d]+)\/([\d]+) ([\d]+)\/([\d]+)\/([\d]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		var face = new THREE.Face3( parseInt( result[ 1 ] ) - 1, parseInt( result[ 4 ] ) - 1, parseInt( result[ 7 ] ) - 1 );
		geometry.faces.push( face );

	}

	// faces: vertex/normal

	pattern = /f ([\d]+)\/\/([\d]+) ([\d]+)\/\/([\d]+) ([\d]+)\/\/([\d]+)/g;

	while ( ( result = pattern.exec( data ) ) != null ) {

		var face = new THREE.Face3( parseInt( result[ 1 ] ) - 1, parseInt( result[ 3 ] ) - 1, parseInt( result[ 5 ] ) - 1 );
		geometry.faces.push( face );

	}

	geometry.computeCentroids();

	callback( geometry );

}
