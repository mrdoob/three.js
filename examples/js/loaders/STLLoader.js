/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 *
 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Limitations: Currently supports ASCII format only
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

	THREE.EventTarget.call( this );

};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	load: function ( url ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			scope.dispatchEvent( { type: 'load', content: scope.parse( event.target.responseText ) } );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( data ) {

		var geometry = new THREE.Geometry();

		var patternFace = /facet([\s\S]*?)endfacet/g;
		var result;

		while ( ( result = patternFace.exec( data ) ) != null ) {

			var text = result[ 0 ];

			// Normal
			var patternNormal = /normal[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;

			while( ( result = patternNormal.exec( text ) ) != null ) {

				var normal = new THREE.Vector3( result[ 1 ], result[ 3 ], result[ 5 ] );

			}

			// Vertex
			var patternVertex = /vertex[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;

			while( ( result = patternVertex.exec( text ) ) != null ) {

				geometry.vertices.push(
					new THREE.Vector3( result[ 1 ], result[ 3 ], result[ 5 ] )
				);

			}

			var len = geometry.vertices.length;
			geometry.faces.push( new THREE.Face3( len - 3, len - 2, len - 1, normal ) );

		}

		geometry.computeCentroids();
		geometry.computeBoundingSphere();

		return geometry;

	}

};
