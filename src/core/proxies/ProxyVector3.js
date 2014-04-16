/**
 * @author mrdoob / http://mrdoob.com/
 * @author jbaicoianu / http://baicoianu.com/
 */

THREE.ProxyVector3 = function ( array, offset ) {
	
	this.array = array;
	this.offset = offset;

};

THREE.ProxyVector3.prototype = Object.create( THREE.Vector3.prototype );

Object.defineProperties( THREE.ProxyVector3.prototype, {
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

