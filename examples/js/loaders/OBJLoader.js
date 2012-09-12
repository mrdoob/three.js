/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function () {

	THREE.EventTarget.call( this );

};

THREE.OBJLoader.prototype = {

	constructor: THREE.OBJLoader,

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

		function vector( x, y, z ) {

			return new THREE.Vector3( x, y, z );

		}

		function uv( u, v ) {

			return new THREE.UV( u, v );

		}

		function face3( a, b, c, normals ) {

			return new THREE.Face3( a, b, c, normals );

		}

		function face4( a, b, c, d, normals ) {

			return new THREE.Face4( a, b, c, d, normals );

		}

		var group = new THREE.Object3D();

		var vertices = [];
		var normals = [];
		var uvs = [];

		var pattern, result;

		// v float float float

		pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

		while ( ( result = pattern.exec( data ) ) != null ) {

			// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

			vertices.push( vector(
				parseFloat( result[ 1 ] ),
				parseFloat( result[ 2 ] ),
				parseFloat( result[ 3 ] )
			) );

		}


		// vn float float float

		pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

		while ( ( result = pattern.exec( data ) ) != null ) {

			// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

			normals.push( vector(
				parseFloat( result[ 1 ] ),
				parseFloat( result[ 2 ] ),
				parseFloat( result[ 3 ] )
			) );

		}

		// vt float float

		pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

		while ( ( result = pattern.exec( data ) ) != null ) {

			// ["vt 0.1 0.2", "0.1", "0.2"]

			uvs.push( uv(
				parseFloat( result[ 1 ] ),
				parseFloat( result[ 2 ] )
			) );

		}

		var data = data.split( '\no ');

		for ( var i = 0, l = data.length; i < l; i ++ ) {

			var object = data[ i ];

			var geometry = new THREE.Geometry();

			geometry.vertices = vertices;

			// f vertex vertex vertex ...

			pattern = /f( +[\d]+)( [\d]+)( [\d]+)( [\d]+)?/g;

			while ( ( result = pattern.exec( object ) ) != null ) {

				// ["f 1 2 3", "1", "2", "3", undefined]

				if ( result[ 4 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 1 ] ) - 1,
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 3 ] ) - 1
					) );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 1 ] ) - 1,
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 3 ] ) - 1,
						parseInt( result[ 4 ] ) - 1
					) );

				}

			}

			// f vertex/uv vertex/uv vertex/uv ...

			pattern = /f( +([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))?/g;

			while ( ( result = pattern.exec( object ) ) != null ) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

				if ( result[ 10 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 6 ] ) - 1 ],
						uvs[ parseInt( result[ 9 ] ) - 1 ]
					] );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1,
						parseInt( result[ 11 ] ) - 1
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 6 ] ) - 1 ],
						uvs[ parseInt( result[ 9 ] ) - 1 ],
						uvs[ parseInt( result[ 12 ] ) - 1 ]
					] );

				}

			}

			// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

			pattern = /f( +([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))?/g;

			while ( ( result = pattern.exec( object ) ) != null ) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

				if ( result[ 13 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 6 ] ) - 1,
						parseInt( result[ 10 ] ) - 1,
						[
							normals[ parseInt( result[ 4 ] ) - 1 ],
							normals[ parseInt( result[ 8 ] ) - 1 ],
							normals[ parseInt( result[ 12 ] ) - 1 ]
						]
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 7 ] ) - 1 ],
						uvs[ parseInt( result[ 11 ] ) - 1 ]
					] );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 6 ] ) - 1,
						parseInt( result[ 10 ] ) - 1,
						parseInt( result[ 14 ] ) - 1,
						[
							normals[ parseInt( result[ 4 ] ) - 1 ],
							normals[ parseInt( result[ 8 ] ) - 1 ],
							normals[ parseInt( result[ 12 ] ) - 1 ],
							normals[ parseInt( result[ 16 ] ) - 1 ]
						]
					) );

					geometry.faceVertexUvs[ 0 ].push( [
						uvs[ parseInt( result[ 3 ] ) - 1 ],
						uvs[ parseInt( result[ 7 ] ) - 1 ],
						uvs[ parseInt( result[ 11 ] ) - 1 ],
						uvs[ parseInt( result[ 15 ] ) - 1 ]
					] );

				}


			}

			// f vertex//normal vertex//normal vertex//normal ...

			pattern = /f( +([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))?/g;

			while ( ( result = pattern.exec( object ) ) != null ) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

				if ( result[ 10 ] === undefined ) {

					geometry.faces.push( face3(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1,
						[
							normals[ parseInt( result[ 3 ] ) - 1 ],
							normals[ parseInt( result[ 6 ] ) - 1 ],
							normals[ parseInt( result[ 9 ] ) - 1 ]
						]
					) );

				} else {

					geometry.faces.push( face4(
						parseInt( result[ 2 ] ) - 1,
						parseInt( result[ 5 ] ) - 1,
						parseInt( result[ 8 ] ) - 1,
						parseInt( result[ 11 ] ) - 1,
						[
							normals[ parseInt( result[ 3 ] ) - 1 ],
							normals[ parseInt( result[ 6 ] ) - 1 ],
							normals[ parseInt( result[ 9 ] ) - 1 ],
							normals[ parseInt( result[ 12 ] ) - 1 ]
						]
					) );

				}

			}

			geometry.computeCentroids();
			geometry.computeFaceNormals();
			geometry.computeBoundingSphere();

			group.add( new THREE.Mesh( geometry, new THREE.MeshLambertMaterial() ) );

		}

		return group;

	}

}
