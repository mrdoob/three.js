/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.WireframeHelper = function ( object, hex, edgesOnly ) {

	var color = hex || 0xffffff;

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c' ];
	var geometry = new THREE.BufferGeometry();

	if ( object.geometry instanceof THREE.Geometry ) {

		var numEdges = 0;

		if ( edgesOnly === true ) {

			var geometry2 = object.geometry.clone();

			geometry2.mergeVertices();
			geometry2.computeFaceNormals();

			var vertices = geometry2.vertices;
			var faces = geometry2.faces;

		} else {

			var vertices = object.geometry.vertices;
			var faces = object.geometry.faces;

		}

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			for ( var j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
				edge.sort( sortFunction );

				var key = edge.toString();

				if ( hash[ key ] === undefined ) {

					hash[ key ] = { vert1: edge[ 0 ], vert2: edge[ 1 ], face1: i, face2: undefined };
					numEdges ++;

				} else {

					hash[ key ].face2 = i;

				}

			}

		}

		geometry.addAttribute( 'position', Float32Array, 2 * numEdges, 3 );

		var coords = geometry.attributes.position.array;

		var index = 0;

		for ( var key in hash ) {

			var h = hash[ key ];

			if ( ! edgesOnly || h.face2 === undefined || faces[ h.face1 ].normal.dot( faces[ h.face2 ].normal ) < 0.9999 ) { // hardwired const OK

				var vertex = vertices[ h.vert1 ];
				coords[ index ++ ] = vertex.x;
				coords[ index ++ ] = vertex.y;
				coords[ index ++ ] = vertex.z;

				vertex = vertices[ h.vert2 ];
				coords[ index ++ ] = vertex.x;
				coords[ index ++ ] = vertex.y;
				coords[ index ++ ] = vertex.z;

			}

		}

	} else if ( object.geometry instanceof THREE.BufferGeometry && object.geometry.attributes.index !== undefined ) { // indexed BufferGeometry

		var vertices = object.geometry.attributes.position.array;
		var indices = object.geometry.attributes.index.array;
		var offsets = object.geometry.offsets;
		var numEdges = 0;

		// allocate maximal size
		var edges = new Uint32Array( 2 * indices.length );

		for ( var o = 0, ol = offsets.length; o < ol; ++ o ) {

			var start = offsets[ o ].start;
			var count = offsets[ o ].count;
			var index = offsets[ o ].index;

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

		geometry.addAttribute( 'position', Float32Array, 2 * numEdges, 3 );

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

	} else if ( object.geometry instanceof THREE.BufferGeometry	) { // non-indexed BufferGeometry

		var vertices = object.geometry.attributes.position.array;
		var numEdges = vertices.length / 3;
		var numTris = numEdges / 3;

		geometry.addAttribute( 'position', Float32Array, 2 * numEdges, 3 );
		var coords = geometry.attributes.position.array;

		for ( var i = 0, l = numTris; i < l; i ++ ) {

			for ( var j = 0; j < 3; j ++ ) {

				var index = 18 * i + 6 * j;

				var index1 = 9 * i + 3 * j;
				coords[ index + 0 ] = vertices[ index1 ];
				coords[ index + 1 ] = vertices[ index1 + 1 ];
				coords[ index + 2 ] = vertices[ index1 + 2 ];

				var index2 = 9 * i + 3 * ( ( j + 1 ) % 3 );
				coords[ index + 3 ] = vertices[ index2 ];
				coords[ index + 4 ] = vertices[ index2 + 1 ];
				coords[ index + 5 ] = vertices[ index2 + 2 ];

			}

		}

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: color } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.WireframeHelper.prototype = Object.create( THREE.Line.prototype );
