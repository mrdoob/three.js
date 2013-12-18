/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object ) {

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c', 'd' ];
	var geometry = new THREE.BufferGeometry();
	var numEdges = 0;

	if ( object.geometry instanceof THREE.Geometry ) {

		var vertices = object.geometry.vertices;
		var faces = object.geometry.faces;

		// allocate maximal size
		var edges = new Uint32Array(6 * faces.length);

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			for ( var j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
				edge.sort( sortFunction );

				var key = edge.toString();

				if ( hash[ key ] === undefined ) {

					edges[ 2 * numEdges ] = edge[ 0 ];
					edges[ 2 * numEdges + 1 ] = edge[ 1 ];
					hash[ key ] = true;
					numEdges ++;

				}

			}

		}

		geometry.addAttribute( 'position', Float32Array, 2 * numEdges , 3 );
		var coords = geometry.attributes.position.array;

		for ( var i = 0, l = numEdges; i < l; i ++ ) {

			for ( var j = 0; j < 2; j ++ ) {

				var vertex = vertices[ edges [ 2 * i + j] ];

				var index = 6 * i + 3 * j;
				coords[ index + 0 ] = vertex.x;
				coords[ index + 1 ] = vertex.y;
				coords[ index + 2 ] = vertex.z;

			}

		}

	} else if ( object.geometry.offsets ) {

		var vertices = object.geometry.attributes.position.array;
		var indices = object.geometry.attributes.index.array;
		var offsets = object.geometry.offsets

		// allocate maximal size
		var edges = new Uint32Array(2 * indices.length);

		for ( var o = 0, ol = offsets.length; o < ol; ++ o ) {

			var start = offsets[ o ].start;
			var count = offsets[ o ].count;
			var index = offsets[ o ].index;
			var il;

			for ( var i = start, il = start + count; i < il; i += 3 ) {

				for ( var j = 0; j < 3; j ++ ) {

					edge[ 0 ] = index + indices[ i + j ];
					edge[ 1 ] = index + indices[ i + ( j + 1 ) % 3 ];
					edge.sort( sortFunction );

					var key = edge.toString();

					if ( hash[ key ] === undefined ) {

						edges[ 2 * numEdges ] = edge[ 0 ];
						edges[ 2 * numEdges + 1 ] = edge[ 1 ];
						hash[ key ] = true;
						numEdges ++;

					}

				}

			}

		}

		geometry.addAttribute( 'position', Float32Array, 2 * numEdges , 3 );

		var coords = geometry.attributes.position.array;

		for ( var i = 0, l = numEdges; i < l; i ++ ) {

			for ( var j = 0; j < 2; j ++ ) {

				var index = 6 * i + 3 * j;
				var index2 = 3 * edges[ 2 * i + j];
				coords[ index + 0 ] = vertices[ index2 ];
				coords[ index + 1 ] = vertices[ index2 + 1 ];
				coords[ index + 2 ] = vertices[ index2 + 2 ];

			}

		}
	} else {

		var vertices = object.geometry.attributes.position.array;
		var numEdges = vertices.length / 3;
		var numTris = numEdges / 3;

		geometry.addAttribute( 'position', Float32Array, 2 * numEdges , 3 );
		var coords = geometry.attributes.position.array;

		for ( var i = 0, l = numTris; i < l; i ++ ) {

			var index = i * 9;
			var index2 = 2 * index;

			for ( var j = 0; j < 3; j ++ ) {

				var vertex1 = j * 3;
				var vertex2 = ( ( j + 1 ) % 3 ) * 3;
				coords[ index2 + 0 ] = vertices[ index + vertex1 ];
				coords[ index2 + 1 ] = vertices[ index + vertex1 + 1 ];
				coords[ index2 + 2 ] = vertices[ index + vertex1 + 2 ];

				coords[ index2 + 3 ] = vertices[ index + vertex2 ];
				coords[ index2 + 4 ] = vertices[ index + vertex2 + 1 ];
				coords[ index2 + 5 ] = vertices[ index + vertex2 + 2 ];

			}

		}

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: 0xffffff } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.WireframeHelper.prototype = Object.create( THREE.Line.prototype );
