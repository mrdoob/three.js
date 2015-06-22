/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.WireframeGeometry = function ( geometry ) {

	THREE.BufferGeometry.call( this );

	var edge = [ 0, 0 ], hash = {};
	var sortFunction = function ( a, b ) { return a - b };

	var keys = [ 'a', 'b', 'c' ];
	this.skinning = false;

	if ( geometry instanceof THREE.Geometry ) {

	    geometry = new THREE.BufferGeometry().fromGeometry( geometry );

	}
	

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
			this.skinning = true;
		}

	} else { // non-indexed BufferGeometry

		var vertices = geometry.attributes.position.array;
		var numEdges = vertices.length / 3;
		var numTris = numEdges / 3;

		var wireVerts = new Float32Array( numEdges * 2 * 3 );
		var skinWeights, skinIndices, wireSkinIndices, wireSkinWeights;
		if ( geometry.attributes.skinIndex && geometry.attributes.skinWeight ) {
			this.skinning = true;
			skinIndices = geometry.attributes.skinIndex.array;
			skinWeights = geometry.attributes.skinWeight.array;
			wireSkinIndices = new Float32Array( numEdges * 2 * 4 );
			wireSkinWeights = new Float32Array( numEdges * 2 * 4 );
		}

		for ( var i = 0, l = numTris; i < l; i ++ ) {

			for ( var j = 0; j < 3; j ++ ) {

				var index = 18 * i + 6 * j;

				var index1 = 9 * i + 3 * j;
				wireVerts[ index + 0 ] = vertices[ index1 ];
				wireVerts[ index + 1 ] = vertices[ index1 + 1 ];
				wireVerts[ index + 2 ] = vertices[ index1 + 2 ];

				var index2 = 9 * i + 3 * ( ( j + 1 ) % 3 );
				wireVerts[ index + 3 ] = vertices[ index2 ];
				wireVerts[ index + 4 ] = vertices[ index2 + 1 ];
				wireVerts[ index + 5 ] = vertices[ index2 + 2 ];

				if ( this.skinning ) {
					index = 24 * i + 8 * j;
					index1 = 12 * i + 4 * j;
					wireSkinIndices[ index + 0 ] = skinIndices[ index1 ];
					wireSkinIndices[ index + 1 ] = skinIndices[ index1 + 1 ];
					wireSkinIndices[ index + 2 ] = skinIndices[ index1 + 2 ];
					wireSkinIndices[ index + 3 ] = skinIndices[ index1 + 3 ];
					wireSkinWeights[ index + 0 ] = skinWeights[ index1 ];
					wireSkinWeights[ index + 1 ] = skinWeights[ index1 + 1 ];
					wireSkinWeights[ index + 2 ] = skinWeights[ index1 + 2 ];
					wireSkinWeights[ index + 3 ] = skinWeights[ index1 + 3 ];

					index2 = 12 * i + 4 * ( ( j + 1 ) % 3 );
					wireSkinIndices[ index + 4 ] = skinIndices[ index2 ];
					wireSkinIndices[ index + 5 ] = skinIndices[ index2 + 1 ];
					wireSkinIndices[ index + 6 ] = skinIndices[ index2 + 2 ];
					wireSkinIndices[ index + 7 ] = skinIndices[ index2 + 3 ];
					wireSkinWeights[ index + 4 ] = skinWeights[ index2 ];
					wireSkinWeights[ index + 5 ] = skinWeights[ index2 + 1 ];
					wireSkinWeights[ index + 6 ] = skinWeights[ index2 + 2 ];
					wireSkinWeights[ index + 7 ] = skinWeights[ index2 + 3 ];
				}

			}

		}

		this.addAttribute( 'position', new THREE.BufferAttribute( wireVerts, 3 ) );

		if ( this.skinning ) {
			this.addAttribute( 'skinWeight', new THREE.BufferAttribute( wireSkinWeights, 4 ) );
			this.addAttribute( 'skinIndex', new THREE.BufferAttribute( wireSkinIndices, 4 ) );
		}

	}

};

THREE.WireframeGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.WireframeGeometry.prototype.constructor = THREE.WireframeGeometry;
