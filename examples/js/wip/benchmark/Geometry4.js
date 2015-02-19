THREE.Geometry4 = function ( size ) {

	THREE.BufferGeometry.call( this );

	var verticesBuffer = new ArrayBuffer( size * 3 * 4 );
	var normalsBuffer = new ArrayBuffer( size * 3 * 4 );
	var uvsBuffer = new ArrayBuffer( size * 2 * 4 );

	this.attributes[ 'position' ] = { array: new Float32Array( verticesBuffer, 0, size * 3 ), itemSize: 3 };
	this.attributes[ 'normal' ] = { array: new Float32Array( normalsBuffer, 0, size * 3 ), itemSize: 3 };
	this.attributes[ 'uv' ] = { array: new Float32Array( uvsBuffer, 0, size * 2 ), itemSize: 2 };

	this.vertices = new THREE.VectorArrayProxy( this.attributes[ 'position' ] );
	this.normals = new THREE.VectorArrayProxy( this.attributes[ 'normal' ] );
	this.uvs = new THREE.VectorArrayProxy( this.attributes[ 'uv' ] );

};
THREE.Geometry4.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.Geometry4.prototype.constructor = THREE.Geometry4;

THREE.VectorArrayProxy = function(attribute) {

        // Acts as a proxy for an array of vectors, by setting up accessors which return THREE.Vector*Proxy objects

	this.attribute = attribute;

	for (var i = 0, l = this.attribute.array.length / this.attribute.itemSize; i < l; i ++) {

		Object.defineProperty(this, i, {
                        get: (function(i) { return function() { return this.getValue(i); }})(i),
                        set: (function(i) { return function(v) { return this.setValue(i, v); }})(i),
                });

	}

}

THREE.VectorArrayProxy.prototype.getValue = function(i) {

        // Allocates a new THREE.Vector2Proxy or THREE.Vector3Proxy depending on the itemSize of our attribute

	var subarray = this.attribute.array.subarray(i * this.attribute.itemSize, (i + 1) * this.attribute.itemSize);

	switch (this.attribute.itemSize) {

		case 2:
			return new THREE.Vector2Proxy(subarray);

		case 3:
			return new THREE.Vector3Proxy(subarray);

	}

}
THREE.VectorArrayProxy.prototype.setValue = function(i, v) {

	var vec = this[i];
	vec.copy(v);

}

// Vector Proxy Objects

THREE.Vector2Proxy = function(subarray) {

	this.subarray = subarray;

}
THREE.Vector2Proxy.prototype = Object.create( THREE.Vector2.prototype );
THREE.Vector2Proxy.prototype.constructor = THREE.Vector2Proxy;
Object.defineProperty(THREE.Vector2Proxy.prototype, 'x', { get: function() { return this.subarray[0]; }, set: function(v) { this.subarray[0] = v; } });
Object.defineProperty(THREE.Vector2Proxy.prototype, 'y', { get: function() { return this.subarray[1]; }, set: function(v) { this.subarray[1] = v; } });


THREE.Vector3Proxy = function(subarray) {

	this.subarray = subarray;

}
THREE.Vector3Proxy.prototype = Object.create( THREE.Vector3.prototype );
THREE.Vector3Proxy.prototype.constructor = THREE.Vector3Proxy;

Object.defineProperty(THREE.Vector3Proxy.prototype, 'x', { get: function() { return this.subarray[0]; }, set: function(v) { this.subarray[0] = v; } });
Object.defineProperty(THREE.Vector3Proxy.prototype, 'y', { get: function() { return this.subarray[1]; }, set: function(v) { this.subarray[1] = v; } });
Object.defineProperty(THREE.Vector3Proxy.prototype, 'z', { get: function() { return this.subarray[2]; }, set: function(v) { this.subarray[2] = v; } });