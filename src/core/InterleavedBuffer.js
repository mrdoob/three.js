import { _Math } from '../math/Math';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InterleavedBuffer ( array, stride ) {
	this.isInterleavedBuffer = true;

	this.uuid = _Math.generateUUID();

	this.array = array;
	this.stride = stride;

	this.dynamic = false;
	this.updateRange = { offset: 0, count: - 1 };

	this.version = 0;

};

InterleavedBuffer.prototype = {

	constructor: InterleavedBuffer,

	get length () {

		return this.array.length;

	},

	get count () {

		return this.array.length / this.stride;

	},

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	},

	setDynamic: function ( value ) {

		this.dynamic = value;

		return this;

	},

	copy: function ( source ) {

		this.array = new source.array.constructor( source.array );
		this.stride = source.stride;
		this.dynamic = source.dynamic;

		return this;

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

		return new this.constructor().copy( this );

	}

};


export { InterleavedBuffer };