/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object ) {

	var edge = [ 0, 0 ], hash = {}, key;
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c', 'd' ];
	var geometry = new THREE.BufferGeometry();
    var numEdges = 0;
    var vertices, edges, faces, coords;
    var i, j, index;

	if ( object.geometry instanceof THREE.Geometry ) {

		vertices = object.geometry.vertices;
		faces = object.geometry.faces;

		// allocate maximal size
        edges = new Uint32Array(6 * faces.length);

		for ( i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			for ( j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
				edge.sort( sortFunction );

				key = edge.toString();

				if ( hash[ key ] === undefined ) {

                    edges[ 2 * numEdges ] = edge[ 0 ];
                    edges[ 2 * numEdges + 1 ] = edge[ 1 ];
					hash[ key ] = true;
					numEdges ++;

				}

			}

		}

        geometry.addAttribute( 'position', Float32Array, 2 * numEdges , 3 );
        coords = geometry.attributes.position.array;

		for ( i = 0, l = numEdges; i < l; i ++ ) {

            for ( j = 0; j < 2; j ++ ) {

                var vertex = vertices[ edges [ 2 * i + j] ];

                index = 6 * i + 3 * j;
                coords[ index + 0 ] = vertex.x;
                coords[ index + 1 ] = vertex.y;
                coords[ index + 2 ] = vertex.z;

            }

		}

    } else {
		vertices = object.geometry.attributes.position.array;
		faces = object.geometry.attributes.index.array;

		// allocate maximal size
        edges = new Uint32Array(2 * faces.length);

        for ( i = 0, l = faces.length / 3; i < l; i ++ ) {

			for ( j = 0; j < 3; j ++ ) {
                index = i * 3;
				edge[ 0 ] = faces[ index + j ];
				edge[ 1 ] = faces[ index + (j + 1) % 3 ];
				edge.sort( sortFunction );

				key = edge.toString();

				if ( hash[ key ] === undefined ) {

                    edges[ 2 * numEdges ] = edge[ 0 ];
                    edges[ 2 * numEdges + 1 ] = edge[ 1 ];
                    hash[ key ] = true;
                    numEdges ++;

				}

			}

		}

        geometry.addAttribute( 'position', Float32Array, 2 * numEdges , 3 );
        coords = geometry.attributes.position.array;

		for ( i = 0, l = numEdges; i < l; i ++ ) {

            for ( j = 0; j < 2; j ++ ) {

                index = 6 * i + 3 * j;
                var index2 = 3 * edges[ 2 * i + j];
                coords[ index + 0 ] = vertices[ index2 ];
                coords[ index + 1 ] = vertices[ index2 + 1 ];
                coords[ index + 2 ] = vertices[ index2 + 2 ];

            }

		}
	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: 0xffffff } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.WireframeHelper.prototype = Object.create( THREE.Line.prototype );
