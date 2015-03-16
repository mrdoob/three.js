// Allows updating of multiple THREE.Vector3 objects with the same value
// Used for face.normal -> face.vertexNormal[] compatibility layer for FlatShading

THREE.MultiVector3 = function(links) {

	this.links = links;

}

THREE.MultiVector3.prototype = Object.create( THREE.Vector3.prototype );
THREE.MultiVector3.prototype.constructor = THREE.MultiVector3;

THREE.MultiVector3.prototype.setAll = function(axis, value) {

	for (var i = 0, l = this.links.length; i < l; i ++) {

		this.links[i][axis] = value;

	}

}

// Getters return value from the first linked vector
// Setters set the same value for all linked vectors
Object.defineProperties( THREE.MultiVector3.prototype, {
	'x': {
		get: function () { return (this.links[0] ? this.links[0].x : 0); },
		set: function ( v ) { this.setAll('x', v); }
	},
	'y': {
		get: function () { return (this.links[0] ? this.links[0].y : 0); },
		set: function ( v ) { this.setAll('y', v); }
	},
	'z': {
		get: function () { return (this.links[0] ? this.links[0].z : 0); },
		set: function ( v ) { this.setAll('z', v); }
	}
} );


