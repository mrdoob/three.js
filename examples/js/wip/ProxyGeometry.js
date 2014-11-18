/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author bhouston / http://exocortex.com
 * @author jbaicoianu / http://baicoianu.com
 */

THREE.ProxyGeometry = function ( ) {

	THREE.BufferGeometry.call( this );

	this.addEventListener( 'allocate', this.onGeometryAllocate);

	// TODO - implement as BufferGeometry attributes
	this.morphTargets = [];
	this.morphColors = [];

};

THREE.ProxyGeometry.prototype = Object.create( THREE.IndexedGeometry2.prototype );
THREE.ProxyGeometry.prototype.constructor = THREE.ProxyGeometry;

Object.defineProperties(THREE.ProxyGeometry.prototype, {
	vertices: { 
		enumerable: true, 
		configurable: true, 
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
	colors: {
		enumerable: true,	
		get: function() { return this.createColorProxies() } 
	},
	skinIndices: {
		enumerable: true,	
		get: function() { return this.createSkinIndexProxies() } 
	},
	skinWeights: {
		enumerable: true,	
		get: function() { return this.createSkinWeightProxies() } 
	},
	// TODO - fill in additional proxies:
	// - morphColors
	// - morphNormals
	// - morphTargets

	verticesNeedUpdate: {
		enumerable: true,	
		get: function() { if (this.attributes[ 'position' ]) return this.attributes[ 'position' ].needsUpdate; } ,
		set: function(v) { if (this.attributes[ 'position' ]) this.attributes[ 'position' ].needsUpdate = v; } 
	},
	colorsNeedUpdate: {
		enumerable: true,	
		get: function() { if (this.attributes[ 'color' ]) return this.attributes[ 'color' ].needsUpdate; } ,
		set: function(v) { if (this.attributes[ 'color' ]) this.attributes[ 'color' ].needsUpdate = v; } 
	},
	normalsNeedUpdate: {
		enumerable: true,	
		get: function() { if (this.attributes[ 'normal' ]) return this.attributes[ 'normal' ].needsUpdate; } ,
		set: function(v) { if (this.attributes[ 'normal' ]) this.attributes[ 'normal' ].needsUpdate = v; } 
	},
});

THREE.ProxyGeometry.prototype.createVertexProxies = function(values) {

	if (!this.hasOwnProperty('vertices')) {

		// Replace the prototype getter with a local array property

		Object.defineProperty( this, "vertices", { value: [], writable: true } );

	} else {

		// Start with a new, empty array

		this.vertices = [];

	}

	// If the attribute buffer has already been populated, set up proxy objects

	this.populateProxyFromBuffer(this.vertices, "position", THREE.ProxyVector3, 3);

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0; i < values.length; i++) {

			this.vertices[i].copy(values[i]);

		}
	}

	// Return a reference to the newly-created array

	return this.vertices;

}

THREE.ProxyGeometry.prototype.createFaceProxies = function(values) {

	if (!this.hasOwnProperty("faces")) {

		// Replace the prototype getter with a local array property

		Object.defineProperty( this, "faces", { value: [], writable: true } );

	} else {

		// Start with a new, empty array

		this.faces = [];
	}

	// If the attribute buffer has already been populated, set up proxy objects

	var faces = this.faces,
			indexarray = false,
			positionarray = false,
			normalarray = false,
			colorarray = false,
			tangentarray = false;

	if ( this.attributes[ 'index' ] ) {
		indexarray = this.attributes[ 'index' ].array;
	}
	if ( this.attributes[ 'position' ] ) {
		positionarray = this.attributes[ 'position' ].array;
	}
	if (this.attributes[ 'normal' ]) {
		normalarray = this.attributes[ 'normal' ].array;
	}
	if (this.attributes[ 'color' ]) {
		colorarray = this.attributes[ 'color' ].array;
	}
	if (this.attributes[ 'tangent' ]) {
		tangentarray = this.attributes[ 'tangent' ].array;
	}

	// TODO - this should be accomplished using "virtual" functions on various classes (IndexedGeometry, SmoothGeometry, etc)

	if (indexarray) {

		for ( var i = 0, l = indexarray.length / 3; i < l; i ++ ) {

			var o = i * 3;

			var face = new THREE.ProxyFace3( indexarray, i * 3 );
			faces.push(face);

		}

	} else if (positionarray) {

		for ( var i = 0, l = positionarray.length / 3; i < l; i += 3 ) {

			var o = i * 3;
			var v1 = i, v2 = i+1, v3 = i+2;

			var face = new THREE.ProxyFace3( v1, v2, v3 );
			faces.push(face);

		}

	}

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0, l = values.length; i < l; i++) {

			var f = faces[i],
			    v = values[i];

			f.a = v.a;
			f.b = v.b;
			f.c = v.c;

		}

	}

	if (normalarray) {

		this.createFaceVertexNormalProxies(values);

	}

	if (colorarray) {

		this.createFaceVertexColorProxies(values);

	}

	if (tangentarray) {

		this.createFaceVertexTangentProxies(values);

	}

	// Return a reference to the newly-created array

	return this.faces;

}

THREE.ProxyGeometry.prototype.createFaceVertexNormalProxies = function(values) {

	if ( this.attributes[ 'normal' ] && this.attributes[ 'normal' ].array ) {

		var normalarray = this.attributes[ 'normal' ].array;

		for (var i = 0, l = this.faces.length; i < l; i++) {

			var f = this.faces[i];

			f.vertexNormals = [
				new THREE.ProxyVector3(normalarray, f.a * 3),
				new THREE.ProxyVector3(normalarray, f.b * 3),
				new THREE.ProxyVector3(normalarray, f.c * 3),
			];
			f.normal = new THREE.MultiVector3(f.vertexNormals);

		}
	}

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0, l = values.length; i < l; i++) {

			var f = this.faces[i],
			    v = values[i];

			if (v.vertexNormals.length > 0) {

				for (var j = 0, l2 = f.vertexNormals.length; j < l2; j++) {

					f.vertexNormals[j].copy(v.vertexNormals[j]);

				}

			} else if (v.normal) {

				f.normal.copy(v.normal);

			}

		}

	}

}

THREE.ProxyGeometry.prototype.createFaceVertexColorProxies = function(values) {

	if ( this.attributes[ 'color' ] && this.attributes[ 'color' ].array ) {

		var colorarray = this.attributes[ 'color' ].array;

		for (var i = 0, l = this.faces.length; i < l; i++) {
			var f = this.faces[i];

			if ( this.attributes[ 'index' ] ) {
				f.vertexColors = [
						new THREE.ProxyColor(colorarray, f.a * 3),
						new THREE.ProxyColor(colorarray, f.b * 3),
						new THREE.ProxyColor(colorarray, f.c * 3),
					];
			} else {
				var o = i * 9;

				f.vertexColors = [
						new THREE.ProxyColor(colorarray, o),
						new THREE.ProxyColor(colorarray, o + 3),
						new THREE.ProxyColor(colorarray, o + 6),
					];
			}
			f.color = new THREE.MultiColor(f.vertexColors);

		}
	}

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0, l = values.length; i < l; i++) {

			var f = this.faces[i],
			    v = values[i];

			for (var j = 0, l2 = f.vertexColors.length; j < l2; j++) {

				if (v.vertexColors.length > 0) {

					f.vertexColors[j].copy(v.vertexColors[j]);

				} else if (v.color) {

					f.color.copy(v.color);

				}

			}

		}

	}

}

THREE.ProxyGeometry.prototype.createFaceVertexTangentProxies = function(values) {

	if ( this.attributes[ 'tangent' ] && this.attributes[ 'tangent' ].array ) {

		var tangentarray = this.attributes[ 'tangent' ].array;

		for (var i = 0, l = this.faces.length; i < l; i++) {

			var f = this.faces[i];

			f.vertexTangents = [
				new THREE.ProxyVector3(tangentarray, f.a * 3),
				new THREE.ProxyVector3(tangentarray, f.b * 3),
				new THREE.ProxyVector3(tangentarray, f.c * 3),
			];

		}
	}

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0, l = values.length; i < l; i++) {

			var f = this.faces[i],
			    v = values[i];

			if (v.vertexTangents.length > 0) {

				for (var j = 0, l2 = f.vertexTangents.length; j < l2; j++) {

					f.vertexTangents[j].copy(v.vertexTangents[j]);

				}

			}

		}

	}

}

THREE.ProxyGeometry.prototype.createUvProxies = function(values) {

	// Replace the prototype getter with a local array property

	if (!this.hasOwnProperty("faceVertexUvs")) {
		Object.defineProperty( this, "faceVertexUvs", { value: [[]], writable: true } );
	} else {
		this.faceVertexUvs = [[]];
	}

	// If the attribute buffer has already been populated, set up proxy objects

	if ( this.attributes[ 'uv' ] && this.attributes[ 'uv' ].array ) {

		var faces = this.faces;
		var uvarray = this.attributes[ 'uv' ].array;

		for (var i = 0, l = faces.length; i < l; i++) {
			var f = faces[i];

			this.faceVertexUvs[0][i] = [];

			if ( this.attributes[ 'index' ] ) {
				this.faceVertexUvs[0][i][0] = new THREE.ProxyVector2(uvarray, f.a * 2);
				this.faceVertexUvs[0][i][1] = new THREE.ProxyVector2(uvarray, f.b * 2);
				this.faceVertexUvs[0][i][2] = new THREE.ProxyVector2(uvarray, f.c * 2);
			} else {
				var o = i * 6;
				this.faceVertexUvs[0][i][0] = new THREE.ProxyVector2(uvarray, o);
				this.faceVertexUvs[0][i][1] = new THREE.ProxyVector2(uvarray, o + 2);
				this.faceVertexUvs[0][i][2] = new THREE.ProxyVector2(uvarray, o + 4);
			}

		}
	
	}

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0, l = values.length; i < l; i++) {

			for (var j = 0, l2 = values[i].length; j < l2; j++) {

				var uv = values[i][j];
				this.faceVertexUvs[0][i][j].copy(uv);

			}

		}

	}

	// Return a reference to the newly-created array

	return this.faceVertexUvs;

}

THREE.ProxyGeometry.prototype.createSkinIndexProxies = function(values) {

	// Replace the prototype getter with a local array property

	if (!this.hasOwnProperty('skinIndices')) {
		Object.defineProperty( this, "skinIndices", { value: [], writable: true } );
	} else {
		this.skinIndices = [];
	}

	// If the attribute buffer has already been populated, set up proxy objects

	this.populateProxyFromBuffer(this.skinIndices, "skinIndex", THREE.ProxyVector4, 4);

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0; i < values.length; i++) {

			this.skinIndices[i].copy(values[i]);

		}

	}

	// Return a reference to the newly-created array

	return this.skinIndices;

}

THREE.ProxyGeometry.prototype.createSkinWeightProxies = function(values) {

	// Replace the prototype getter with a local array property

	if (!this.hasOwnProperty('skinWeights')) {
		Object.defineProperty( this, "skinWeights", { value: [], writable: true } );
	} else {
		this.skinWeights = [];
	}

	// If the attribute buffer has already been populated, set up proxy objects

	this.populateProxyFromBuffer(this.skinWeights, "skinWeight", THREE.ProxyVector4, 4);

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0; i < values.length; i++) {

			this.skinWeights[i].copy(values[i]);

		}

	}

	// Return a reference to the newly-created array

	return this.skinWeights;

}

THREE.ProxyGeometry.prototype.createColorProxies = function(values) {

	// Replace the prototype getter with a local array property

	if (!this.hasOwnProperty('colors')) {
		Object.defineProperty( this, "colors", { value: [], writable: true } );
	} else {
		this.colors = [];
	}

	// If the attribute buffer has already been populated, set up proxy objects

	this.populateProxyFromBuffer(this.colors, "color", THREE.ProxyColor, 3);

	// If values were passed in, store them in the buffer via the proxy objects

	if (values) {

		for (var i = 0; i < values.length; i++) {

			this.colors[i].copy(values[i]);

		}

	}

	// Return a reference to the newly-created array

	return this.colors;

}

THREE.ProxyGeometry.prototype.populateProxyFromBuffer = function(attr, buffername, proxytype, itemsize, offset, count) {

	if ( this.attributes[ buffername ] && this.attributes[ buffername ].array ) {

		var array = this.attributes[ buffername ].array;
		var size = itemsize || this.attributes[ buffername ].itemSize;
		var start = offset || 0;
		
		count = count || (array.length / size - start);

		for ( var i = start, l = start + count; i < l; i ++ ) {

			attr.push( new proxytype( array, i * size ) );

		}

	}

}

/*
 * Checks for duplicate vertices with hashmap.
 * Duplicated vertices are removed
 * and faces' vertices are updated.
 */

THREE.ProxyGeometry.prototype.mergeVertices = function () {

	var verticesMap = {}; // Hashmap for looking up vertice by position coordinates (and making sure they are unique)
	var unique = [], changes = [];

	var v, key;
	var precisionPoints = 4; // number of decimal points, eg. 4 for epsilon of 0.0001
	var precision = Math.pow( 10, precisionPoints );
	var i,il, face;
	var indices, k, j, jl, u;

	for ( i = 0, il = this.vertices.length; i < il; i ++ ) {

		v = this.vertices[ i ];
		key = Math.round( v.x * precision ) + '_' + Math.round( v.y * precision ) + '_' + Math.round( v.z * precision );

		if ( verticesMap[ key ] === undefined ) {

			verticesMap[ key ] = i;
			unique.push( this.vertices[ i ] );
			changes[ i ] = unique.length - 1;

		} else {

			//console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
			changes[ i ] = changes[ verticesMap[ key ] ];

		}

	};


	// if faces are completely degenerate after merging vertices, we
	// have to remove them from the geometry.
	var faceIndicesToRemove = [];

	for( i = 0, il = this.faces.length; i < il; i ++ ) {

		face = this.faces[ i ];

		face.a = changes[ face.a ];
		face.b = changes[ face.b ];
		face.c = changes[ face.c ];

		indices = [ face.a, face.b, face.c ];

		var dupIndex = -1;

		// if any duplicate vertices are found in a Face3
		// we have to remove the face as nothing can be saved
		for ( var n = 0; n < 3; n ++ ) {
			if ( indices[ n ] == indices[ ( n + 1 ) % 3 ] ) {

				dupIndex = n;
				faceIndicesToRemove.push( i );
				break;

			}
		}

	}

	for ( i = faceIndicesToRemove.length - 1; i >= 0; i -- ) {
		var idx = faceIndicesToRemove[ i ];

		this.faces.splice( idx, 1 );

		for ( j = 0, jl = this.faceVertexUvs.length; j < jl; j ++ ) {

			this.faceVertexUvs[ j ].splice( idx, 1 );

		}

	}

	// Use unique set of vertices

	var diff = this.vertices.length - unique.length;
	this.vertices = unique;
	return diff;

}

THREE.ProxyGeometry.prototype.onGeometryAllocate = function (ev) {

	// Prevent allocate event listener from firing multiple times
	this.removeEventListener( 'allocate', this.onGeometryAllocate);

	if (this.hasOwnProperty('vertices')) {
		var attr = new THREE.Float32Attribute(this.vertices.length, 3);
		this.addAttribute('position', attr);
		this.createVertexProxies(this.vertices);
	}
	if (this.hasOwnProperty('faces')) {
		var idxattr = new THREE.Uint16Attribute(this.faces.length, 3);
		this.addAttribute('index', idxattr);

		if (this.faces.length > 0) {
			var hasnormals = (this.hasOwnProperty('normals') || this.faces[0].normal || this.faces[0].vertexNormals.length > 0);
			var hascolors = (this.hasOwnProperty('colors') || this.faces[0].color || this.faces[0].vertexColors.length > 0);
			var hastangents = (this.faces[0].vertexTangents.length > 0);

			if (hasnormals) {
				var normalattr = new THREE.Float32Attribute(this.vertices.length, 3);
				this.addAttribute('normal', normalattr);
			}

			if (hascolors) {
				var colorattr = new THREE.Float32Attribute(this.faces.length * 3, 3);
				this.addAttribute('color', colorattr);
			}

			if (hastangents) {
				var tangentattr = new THREE.Float32Attribute(this.faces.length * 3, 3);
				this.addAttribute('tangent', tangentattr);
			}
		}

		this.createFaceProxies(this.faces);
	}

	if (this.hasOwnProperty('faceVertexUvs')) {

		var uvattr = new THREE.Float32Attribute(this.faces.length * 3, 2);
		this.addAttribute('uv', uvattr);
		this.createUvProxies(this.faceVertexUvs[0]);

	}

	if (this.hasOwnProperty('skinIndices')) {

		var skinidxattr = new THREE.Float32Attribute(this.skinIndices.length, 4);
		this.addAttribute('skinIndex', skinidxattr);
		this.createSkinIndexProxies(this.skinIndices);

	}

	if (this.hasOwnProperty('skinWeights')) {

		var skinweightattr = new THREE.Float32Attribute(this.skinWeights.length, 4);
		this.addAttribute('skinWeight', skinweightattr);
		this.createSkinWeightProxies(this.skinWeights);

	}
}

THREE.ProxyGeometry.prototype.computeFaceNormals = function() {

	this.dispatchEvent( { type: 'allocate' } );

	return THREE.BufferGeometry.prototype.computeFaceNormals.call(this);

}

THREE.ProxyGeometry.prototype.computeVertexNormals = function() {

	this.dispatchEvent( { type: 'allocate' } );

	return THREE.BufferGeometry.prototype.computeVertexNormals.call(this);

}

THREE.ProxyGeometry.prototype.computeTangents = function() {

	this.dispatchEvent( { type: 'allocate' } );

	var ret = THREE.BufferGeometry.prototype.computeTangents.call(this);

	// FIXME - this doesn't work yet
	//this.createFaceVertexTangentProxies();

	return ret;

}

THREE.ProxyGeometry.prototype.computeBoundingSphere = function() {

	this.dispatchEvent( { type: 'allocate' } );

	return THREE.BufferGeometry.prototype.computeBoundingSphere.call(this);

}

THREE.ProxyGeometry.prototype.computeBoundingBox = function () {

	this.dispatchEvent( { type: 'allocate' } );

	return THREE.BufferGeometry.prototype.computeBoundingBox.call(this);

}
THREE.ProxyGeometry.prototype.clone = function () {

	var buff = THREE.BufferGeometry.prototype.clone.call(this);
	var geo = new THREE.ProxyGeometry();
	geo.attributes = buff.attributes;
	geo.offsets = buff.offsets;

	return geo;

}

THREE.EventDispatcher.prototype.apply( THREE.ProxyGeometry.prototype );

THREE.ProxyGeometryIdCount = 0;
