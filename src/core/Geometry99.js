
THREE.Geometry99 = function ( ) {

	THREE.BufferGeometry.call( this );

};

THREE.Geometry99.prototype = Object.create( THREE.BufferGeometry.prototype );

Object.defineProperties( THREE.Geometry99.prototype, {
	vertices: { 
		enumerable: true, 
		get: function () { return this.createVertexProxies(); } 
	},
	faces: {
		enumerable: true,	
		get: function () { return this.createFaceProxies() } 
	},
	faceVertexUvs: {
		enumerable: true,	
		get: function () { return this.createUvProxies() } 
	},
	// TODO - fill in additional proxies:
	// - morphColors
	// - morphNormals
	// - morphTargets
	// - skinIndex
	// - skinWeights


	verticesNeedUpdate: {
		enumerable: true,	
		get: function () { return this.attributes[ 'position' ].needsUpdate; } ,
		set: function ( v ) { this.attributes[ 'position' ].needsUpdate = v; } 
	},
	colorsNeedUpdate: {
		enumerable: true,	
		get: function () { if ( this.attributes[ 'color' ] ) return this.attributes[ 'color' ].needsUpdate; } ,
		set: function ( v ) { if ( this.attributes[ 'color' ] ) this.attributes[ 'color' ].needsUpdate = v; } 
	},
	normalsNeedUpdate: {
		enumerable: true,	
		get: function () { if ( this.attributes[ 'normal' ] ) return this.attributes[ 'normal' ].needsUpdate; } ,
		set: function ( v ) { if ( this.attributes[ 'normal' ] ) this.attributes[ 'normal' ].needsUpdate = v; } 
	},
});

THREE.Geometry99.prototype.createVertexProxies = function () {

	// Replace the prototype getter with a local array property

	Object.defineProperty( this, "vertices", { value: [] } );

	// If the attribute buffer has already been populated, set up proxy objects

	this.populateProxyFromBuffer( this.vertices, "position", THREE.TypedVector3, 3 );

	// Return a reference to the newly-created array

	return this.vertices;

}

THREE.Geometry99.prototype.createFaceProxies = function () {

	// Replace the prototype getter with a local array property

	Object.defineProperty( this, "faces", { value: [] } );

	// If the attribute buffer has already been populated, set up proxy objects

	var faces = this.faces,
	    indexarray = false,
	    positionarray = false,
	    normalarray = false,
	    colorarray = false;

	if ( this.attributes.position ) {
		positionarray = this.attributes[ 'position' ].array;
	}
	if ( this.attributes.index ) {
		indexarray = this.attributes[ 'index' ].array;
	}
	if (this.attributes[ 'normal' ]) {
		normalarray = this.attributes[ 'normal' ].array;
	}
	if (this.attributes[ 'color' ]) {
		colorarray = this.attributes[ 'color' ].array;
	}

	if (indexarray) {

		for ( var i = 0, l = indexarray.length / 3; i < l; i ++ ) {

			var o = i * 3;

			// Generate face.vertexNormals and face.vertexFaceColors
			var vertexNormals = false,
			    vertexColors = false;
			if (normalarray) {

				vertexNormals = [
					new THREE.TypedVector3(normalarray, indexarray[o] * 3),
					new THREE.TypedVector3(normalarray, indexarray[o+1] * 3),
					new THREE.TypedVector3(normalarray, indexarray[o+2] * 3),
				]

			}

			// TODO - do BufferGeometries support face normals?

			if (colorarray) {

				vertexColors = [
					new THREE.TypedColor(colorarray, indexarray[o] * 3),
					new THREE.TypedColor(colorarray, indexarray[o+1] * 3),
					new THREE.TypedColor(colorarray, indexarray[o+2] * 3),
				]

			}

			var face = new THREE.TypedFace3( indexarray, i * 3, vertexNormals );

		}

	} else {

		for ( var i = 0, l = positionarray.length / 3; i < l; i += 3 ) {

			var o = i * 3;

			var v1 = i, v2 = i+1, v3 = i+2;

			// Generate face.vertexNormals and face.vertexColors

			// TODO - do BufferGeometries support face normals/face colors?
			// Maybe they could be implemented using some sort of TypedMultiVector3 which would let us expose a single
			// face.normal Vector3, and it would simultaneously update the three vertexNormals involved in this face with the same values

			var vertexNormals = false,
			    vertexColors = false;
			if (normalarray) {

				vertexNormals = [
					new THREE.TypedVector3(normalarray, o),
					new THREE.TypedVector3(normalarray, o+3),
					new THREE.TypedVector3(normalarray, o+6),
				];

			}

			if (colorarray) {

				vertexColors = [
					new THREE.TypedColor(colorarray, o),
					new THREE.TypedColor(colorarray, o+3),
					new THREE.TypedColor(colorarray, o+6),
				];

			}

			var face = new THREE.Face3( v1, v2, v3, vertexNormals, vertexColors );

			faces.push(face);

		}

	}

	// Return a reference to the newly-created array

	return this.faces;

}
THREE.Geometry99.prototype.createUvProxies = function () {

	// Replace the prototype getter with a local array property

	Object.defineProperty( this, "faceVertexUvs", { value: [[]] } );

	// If the attribute buffer has already been populated, set up proxy objects

	if ( this.attributes.uv ) {

		var faces = this.faces;
		var uvarray = this.attributes.uv.array;

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var f = faces[i];

			this.faceVertexUvs[ 0 ][ i ] = [];
			this.faceVertexUvs[ 0 ][ i ][ 0 ] = new THREE.TypedVector2( uvarray, f.a * 2 );
			this.faceVertexUvs[ 0 ][ i ][ 1 ] = new THREE.TypedVector2( uvarray, f.b * 2 );
			this.faceVertexUvs[ 0 ][ i ][ 2 ] = new THREE.TypedVector2( uvarray, f.c * 2 );

		}
	
	}

	// Return a reference to the newly-created array

	return this.faceVertexUvs;

}

THREE.Geometry99.prototype.populateProxyFromBuffer = function ( attr, buffername, proxytype, itemsize, offset, count ) {

	if ( this.attributes[ buffername ] ) {

		var array = this.attributes[ buffername ].array;
		var size = itemsize || this.attributes[ buffername ].itemSize;
		var start = offset || 0;
		
		count = count || ( array.length / size - start );

		for ( var i = start, l = start + count; i < l; i ++ ) {

			attr.push( new proxytype( array, i * size ) );

		}

	}

}

// Proxies

THREE.TypedVector2 = function ( array, offset ) {

	this.array = array;
	this.offset = offset;
	
};

THREE.TypedVector2.prototype = Object.create( THREE.Vector2.prototype );

Object.defineProperties( THREE.TypedVector2.prototype, {
	'x': {
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'y': {
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	}
} );

//


THREE.TypedVector3 = function ( array, offset ) {
	
	this.array = array;
	this.offset = offset;

};

THREE.TypedVector3.prototype = Object.create( THREE.Vector3.prototype );

Object.defineProperties( THREE.TypedVector3.prototype, {
	'x': {
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'y': {
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	},
	'z': {
		get: function () { return this.array[ this.offset + 2 ]; },
		set: function ( v ) { this.array[ this.offset + 2 ] = v; }
	}
} );

//

THREE.TypedFace3 = function ( array, offset, vertexNormals ) {

	this.array = array;
	this.offset = offset;
	this.vertexNormals = vertexNormals;

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

THREE.TypedColor = function ( array, offset ) {
	this.array = array;
	this.offset = offset;
}
THREE.TypedColor.prototype = Object.create( THREE.Color.prototype );

Object.defineProperties( THREE.TypedColor.prototype, {
	'r': {
		enumerable: true,	
		get: function () { return this.array[ this.offset ]; },
		set: function ( v ) { this.array[ this.offset ] = v; }
	},
	'g': {
		enumerable: true,	
		get: function () { return this.array[ this.offset + 1 ]; },
		set: function ( v ) { this.array[ this.offset + 1 ] = v; }
	},
	'b': {
		enumerable: true,	
		get: function () { return this.array[ this.offset + 2 ]; },
		set: function ( v ) { this.array[ this.offset + 2 ] = v; }
	}
} );
