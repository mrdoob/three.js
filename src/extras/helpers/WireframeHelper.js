/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeHelper = function ( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0xffffff;

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c' ];
	var geometry = new THREE.BufferGeometry();
	var skinning = false;

	if ( object.geometry instanceof THREE.Geometry ) {

		var vertices = object.geometry.vertices;
		var faces = object.geometry.faces;
		var skinWeights = object.geometry.skinWeights;
		var skinIndices = object.geometry.skinIndices;
		var numEdges = 0;

		// allocate maximal size
		var edges = new Uint32Array( 6 * faces.length );

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

		var coords = new Float32Array( numEdges * 2 * 3 );
		var newSkinWeights;
		var newSkinIndices;
		if ( skinIndices && skinWeights && skinIndices.length && skinWeights.length ) {
			newSkinWeights = new Float32Array( numEdges * 2 * 4 );
			newSkinIndices = new Float32Array( numEdges * 2 * 4 );
			skinning = true;
		}

		for ( var i = 0, l = numEdges; i < l; i ++ ) {

			for ( var j = 0; j < 2; j ++ ) {

				var vertex = vertices[ edges [ 2 * i + j] ];

				var index = 6 * i + 3 * j;
				coords[ index + 0 ] = vertex.x;
				coords[ index + 1 ] = vertex.y;
				coords[ index + 2 ] = vertex.z;
				if ( skinning ) {
					var skinIndex = skinIndices[ edges [ 2 * i + j] ];
					var skinWeight = skinWeights[ edges [ 2 * i + j] ];
					index = 8 * i + 4 * j;
					newSkinIndices[ index + 0 ] = skinIndex.x;
					newSkinIndices[ index + 1 ] = skinIndex.y;
					newSkinIndices[ index + 2 ] = skinIndex.z;
					newSkinIndices[ index + 3 ] = skinIndex.w;
					newSkinWeights[ index + 0 ] = skinWeight.x;
					newSkinWeights[ index + 1 ] = skinWeight.y;
					newSkinWeights[ index + 2 ] = skinWeight.z;
					newSkinWeights[ index + 3 ] = skinWeight.w;
				}
			}

		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( coords, 3 ) );
		if ( skinning ) {
			geometry.addAttribute( 'skinWeight', new THREE.BufferAttribute( newSkinWeights, 4 ) );
			geometry.addAttribute( 'skinIndex', new THREE.BufferAttribute( newSkinIndices, 4 ) );
		}

	} else if ( object.geometry instanceof THREE.BufferGeometry ) {

		if ( object.geometry.attributes.index !== undefined ) { // Indexed BufferGeometry
			var vertices = object.geometry.attributes.position.array;
			var indices = object.geometry.attributes.index.array;
			var drawcalls = object.geometry.drawcalls;
			var numEdges = 0;

			if ( drawcalls.length === 0 ) {
				drawcalls = [ { count : indices.length, index : 0, start : 0 } ];
			}

			// allocate maximal size
			var wireframeIndices = new Uint16Array( 2 * indices.length );

			for ( var o = 0, ol = drawcalls.length; o < ol; ++ o ) {

				var start = drawcalls[ o ].start;
				var count = drawcalls[ o ].count;
				var index = drawcalls[ o ].index;

				geometry.drawcalls.push({ count : count * 2, index : index, start : start * 2 });

				for ( var i = start, il = start + count; i < il; i += 3 ) {

					for ( var j = 0; j < 3; j ++ ) {

						wireframeIndices[ 2 * (i + j) ] = indices[ i + j ];
						wireframeIndices[ 2 * (i + j) + 1 ] = indices[ i + ( j + 1 ) % 3 ];
					}
				}
			}

			geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
			geometry.addAttribute( 'index', new THREE.BufferAttribute( wireframeIndices, 1 ) );

			if ( object.geometry.attributes.skinIndex && object.geometry.attributes.skinWeight ) {
				var skinIndices = object.geometry.attributes.skinIndex.array;
				var skinWeights = object.geometry.attributes.skinWeight.array;
				geometry.addAttribute( 'skinWeight', new THREE.BufferAttribute( skinWeights, 4 ) );
				geometry.addAttribute( 'skinIndex', new THREE.BufferAttribute( skinIndices, 4 ) );
				skinning = true;
			}
		} else { // non-indexed BufferGeometry

			var vertices = object.geometry.attributes.position.array;
			var numEdges = vertices.length / 3;
			var numTris = numEdges / 3;

			var coords = new Float32Array( numEdges * 2 * 3 );

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

			geometry.addAttribute( 'position', new THREE.BufferAttribute( coords, 3 ) );

		}

	}

	if ( skinning && object.skeleton ) {
		this.skeleton = object.skeleton;
		this.bindMatrix = object.bindMatrix;
		this.bindMatrixInverse = object.bindMatrixInverse;
	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: color, skinning: skinning } ), THREE.LinePieces );

	this.matrix = object.matrixWorld;
	this.matrixAutoUpdate = false;

};

THREE.WireframeHelper.prototype = Object.create( THREE.Line.prototype );
THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper;
