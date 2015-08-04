/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.InterleavedBuffer = function ( array, stride, dynamic ) {

	this.uuid = THREE.Math.generateUUID();

	this.array = array;
	this.stride = stride;

	this.version = 0;

	this.dynamic = dynamic || false;
	this.updateRange = { offset: 0, count: - 1 };

};

THREE.InterleavedBuffer.prototype = {

	constructor: THREE.InterleavedBuffer,

	get length () {

		return this.array.length;

	},

	get count () {

		return this.array.length / this.stride;

	},

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	},

	copyAt: function ( index1, attribute, index2 ) {

		index1 *= this.stride;
		index2 *= attribute.stride;

		for ( var i = 0, l = this.stride; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	},

	set: function ( value, offset ) {

		if ( offset === undefined ) offset = 0;

		this.array.set( value, offset );

		return this;

	},

	clone: function () {

		return new THREE.InterleavedBuffer( new this.array.constructor( this.array ), this.stride, this.dynamic );

	}

};
