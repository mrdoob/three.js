/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeGeometry = function ( geometry ) {

	THREE.BufferGeometry.call( this );

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c' ];
	var skinning = false;

	if ( geometry instanceof THREE.Geometry ) {

		var vertices = geometry.vertices;
		var faces = geometry.faces;
		var skinWeights = geometry.skinWeights;
		var skinIndices = geometry.skinIndices;
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

		this.addAttribute( 'position', new THREE.BufferAttribute( coords, 3 ) );
		if ( skinning ) {
			this.addAttribute( 'skinWeight', new THREE.BufferAttribute( newSkinWeights, 4 ) );
			this.addAttribute( 'skinIndex', new THREE.BufferAttribute( newSkinIndices, 4 ) );
		}

	} else if ( geometry instanceof THREE.BufferGeometry ) {

		if ( geometry.attributes.index !== undefined ) { // Indexed BufferGeometry
			var vertices = geometry.attributes.position.array;
			var indices = geometry.attributes.index.array;
			var drawcalls = geometry.drawcalls;
			
			if ( drawcalls.length === 0 ) {
				drawcalls = [ { count : indices.length, index : 0, start : 0 } ];
			}

			// allocate maximal size
			var wireframeIndices = new Uint16Array( 2 * indices.length );

			for ( var o = 0, ol = drawcalls.length; o < ol; ++ o ) {

				var start = drawcalls[ o ].start;
				var count = drawcalls[ o ].count;
				var index = drawcalls[ o ].index;

				this.drawcalls.push({ count : count * 2, index : index, start : start * 2 });

				for ( var i = start, il = start + count; i < il; i += 3 ) {

					for ( var j = 0; j < 3; j ++ ) {

						wireframeIndices[ 2 * (i + j) ] = indices[ i + j ];
						wireframeIndices[ 2 * (i + j) + 1 ] = indices[ i + ( j + 1 ) % 3 ];
					}
				}
			}

			this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
			this.addAttribute( 'index', new THREE.BufferAttribute( wireframeIndices, 1 ) );

			if ( geometry.attributes.skinIndex && geometry.attributes.skinWeight ) {
				var skinIndices = geometry.attributes.skinIndex.array;
				var skinWeights = geometry.attributes.skinWeight.array;
				this.addAttribute( 'skinWeight', new THREE.BufferAttribute( skinWeights, 4 ) );
				this.addAttribute( 'skinIndex', new THREE.BufferAttribute( skinIndices, 4 ) );
				skinning = true;
			}

		} else { // non-indexed BufferGeometry

			var vertices = geometry.attributes.position.array;
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

			this.addAttribute( 'position', new THREE.BufferAttribute( coords, 3 ) );

		}

	}

};

THREE.WireframeGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.WireframeGeometry.prototype.constructor = THREE.WireframeGeometry;
