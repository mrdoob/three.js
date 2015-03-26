/**
 * @author WestLangley / http://github.com/WestLangley
 * @param object THREE.Mesh whose geometry will be used
 * @param hex line color
 * @param thresholdAngle the minimim angle (in degrees),
 * between the face normals of adjacent faces,
 * that is required to render an edge. A value of 10 means
 * an edge is only rendered if the angle is at least 10 degrees.
 */

THREE.EdgesHelper = function ( object, hex, thresholdAngle ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;
	thresholdAngle = ( thresholdAngle !== undefined ) ? thresholdAngle : 1;

	var thresholdDot = Math.cos( THREE.Math.degToRad( thresholdAngle ) );

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c' ];
	var geometry = new THREE.BufferGeometry();

	var geometry2;

	if ( object.geometry instanceof THREE.BufferGeometry ) {

		geometry2 = new THREE.Geometry();
		geometry2.fromBufferGeometry( object.geometry );

	} else {

		geometry2 = object.geometry.clone();

	}

	geometry2.mergeVertices();
	geometry2.computeFaceNormals();

	var vertices = geometry2.vertices;
	var faces = geometry2.faces;
	var numEdges = 0;

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

	var coords = new Float32Array( numEdges * 2 * 3 );

	var index = 0;

	for ( var key in hash ) {

		var h = hash[ key ];

		if ( h.face2 === undefined || faces[ h.face1 ].normal.dot( faces[ h.face2 ].normal ) <= thresholdDot ) {

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

	geometry.addAttribute( 'position', new THREE.BufferAttribute( coords, 3 ) );

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: color } ), THREE.LinePieces );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

THREE.EdgesHelper.prototype = Object.create( THREE.Line.prototype );
THREE.EdgesHelper.prototype.constructor = THREE.EdgesHelper;
