/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object ) {

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c', 'd' ];
	var geometry = new THREE.Geometry();

	if ( object.geometry instanceof THREE.Geometry ) {

		var vertices = object.geometry.vertices;
		var faces = object.geometry.faces;

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			for ( var j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
				edge.sort( sortFunction );

				var key = edge.toString();

				if ( hash[ key ] === undefined ) {

					geometry.vertices.push( vertices[ edge[ 0 ] ] );
					geometry.vertices.push( vertices[ edge[ 1 ] ] );

					hash[ key ] = true;

				}

			}

		}

    } else {
		vertices = object.geometry.attributes.position.array;
		faces = object.geometry.attributes.index.array;

		for ( i = 0, l = faces.length / 3; i < l; i ++ ) {

			for ( j = 0; j < 3; j ++ ) {
                var index = i * 3;
				edge[ 0 ] = faces[ index + j ];
				edge[ 1 ] = faces[ index + (j + 1) % 3 ];
				edge.sort( sortFunction );

				key = edge.toString();

				if ( hash[ key ] === undefined ) {

                    for (var k = 0; k < 2; k ++) {

                        var vertex = new THREE.Vector3(vertices[ 3 * edge[ k ] ],
                            vertices[ 3 * edge[ k ] + 1 ],
                            vertices[ 3 * edge[ k ] + 2 ]);
    
                        geometry.vertices.push( vertex );
                        hash[ key ] = true;
                    }

				}

			}

		}
	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: 0xffffff } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.WireframeHelper.prototype = Object.create( THREE.Line.prototype );
