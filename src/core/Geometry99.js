
THREE.Geometry99 = function ( ) {

	THREE.BufferGeometry.call( this );

};

THREE.Geometry99.prototype = Object.create( THREE.BufferGeometry.prototype );

Object.defineProperties(THREE.Geometry99.prototype, {
	vertices: { 
		enumerable: true, 
		get: function() { return this.createVertexProxies(); } 
	},
	faces: {
		enumerable: true,  
		get: function() { return this.createFaceProxies() } 
	},
	faceVertexUvs: {
		enumerable: true,  
		get: function() { return this.createUvProxies() } 
	},
	// TODO - fill in additional proxies:
  // - colors
  // - morphColors
  // - morphNormals
  // - morphTargets
  // - skinIndex
  // - skinWeights
});

THREE.Geometry99.prototype.createVertexProxies = function() {

	// Replace the prototype getter with a local array property

	Object.defineProperty( this, "vertices", { value: [] } );

	// If the attribute buffer has already been populated, set up proxy objects

	this.populateProxyFromBuffer(this.vertices, "position", THREE.TypedVector3, 3);

	// Return a reference to the newly-created array

	return this.vertices;

}

THREE.Geometry99.prototype.createFaceProxies = function() {

	// Replace the prototype getter with a local array property

	Object.defineProperty( this, "faces", { value: [] } );

	// If the attribute buffer has already been populated, set up proxy objects

	if ( this.attributes.index ) {

		this.populateProxyFromBuffer(this.faces, "index", THREE.TypedFace3, 3);

	} else {

		// TODO - should be able to generate Face data even for non-indexed geometries

	}

	// Return a reference to the newly-created array

	return this.faces;

}
THREE.Geometry99.prototype.createUvProxies = function() {

	// Replace the prototype getter with a local array property

	Object.defineProperty( this, "faceVertexUvs", { value: [[]] } );

	// If the attribute buffer has already been populated, set up proxy objects

	if ( this.attributes.uv ) {

		var faces = this.faces;
		var uvarray = this.attributes.uv.array;

		for (var i = 0, l = faces.length; i < l; i++) {
			var f = faces[i];

			this.faceVertexUvs[0][i] = [];
			this.faceVertexUvs[0][i][0] = new THREE.TypedVector2(uvarray, f.a * 2);
			this.faceVertexUvs[0][i][1] = new THREE.TypedVector2(uvarray, f.b * 2);
			this.faceVertexUvs[0][i][2] = new THREE.TypedVector2(uvarray, f.c * 2);

		}
	
	}

	// Return a reference to the newly-created array

	return this.faceVertexUvs;

}
THREE.Geometry99.prototype.populateProxyFromBuffer = function(attr, buffername, proxytype, itemsize, offset, count) {

	if ( this.attributes[ buffername ] ) {

		var array = this.attributes[ buffername ].array;
		var size = itemsize || this.attributes[ buffername ].itemSize;
		var start = offset || 0;
		var count = count || (array.length / size - start);

		for ( var i = start, l = start + count; i < l; i ++ ) {

			attr.push( new proxytype( array, i * size ) );

		}

	}

}

THREE.TypedFace3 = function ( array, offset ) {

	this.array = array;
	this.offset = offset;

	//THREE.Face3.call( this, array[offset], array[offset+1], array[offset+2] /*, normal, color, materialIndex */);

}

THREE.TypedFace3.prototype = Object.create( THREE.Face3.prototype );

Object.defineProperties( THREE.TypedFace3.prototype, {
	'a': {
		enumerable: true,  
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'b': {
		enumerable: true,  
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	},
	'c': {
		enumerable: true,  
		get: function () { return this.array[ this.offset + 2 ]; },
		set: function ( v ) { this.array[ this.offset + 2 ] = v; }
	},
} );
