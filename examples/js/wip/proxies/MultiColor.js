// Allows updating of multiple THREE.Color objects with the same value
// Used for face.color -> face.vertexColor[] compatibility layer for non-indexed geometry

THREE.MultiColor = function(links) {

	this.links = links;

}

THREE.MultiColor.prototype = Object.create( THREE.Color.prototype );
THREE.MultiColor.prototype.constructor = THREE.MultiColor;

THREE.MultiColor.prototype.setAll = function(axis, value) {

	for (var i = 0, l = this.links.length; i < l; i++) {

		this.links[i][axis] = value;

	}

}

// Getters return value from the first linked color
// Setters set the same value for all linked colors
Object.defineProperties( THREE.MultiColor.prototype, {
	'r': {
		get: function () { return (this.links[0] ? this.links[0].r : 0); },
		set: function ( v ) { this.setAll('r', v); }
	},
	'g': {
		get: function () { return (this.links[0] ? this.links[0].g : 0); },
		set: function ( v ) { this.setAll('g', v); }
	},
	'b': {
		get: function () { return (this.links[0] ? this.links[0].b : 0); },
		set: function ( v ) { this.setAll('b', v); }
	}
} );

