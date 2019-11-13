import { StaticDrawUsage } from '../constants.js';

/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

function InterleavedBuffer( array, stride ) {

	this._array = array;
	this._stride = stride;
	this.count = array !== undefined ? array.length / stride : 0;

	this.usage = StaticDrawUsage;
	this.updateRange = { offset: 0, count: - 1 };

	this.version = 0;
	this.versionVAO = 0;

}

Object.defineProperties( InterleavedBuffer.prototype, {

	needsUpdate: {

		set: function ( value ) {

			if ( value === true ) this.version ++;

		}

	},

	array: {

		get: function () {

			return this._array;

		},

		set: function ( value ) {

			this._array = value;
			this.versionVAO ++;

		}

	},

	stride: {

		get: function () {

			return this._stride;

		},

		set: function ( value ) {

			this._stride = value;
			this.versionVAO ++;

		}

	}

} );

Object.assign( InterleavedBuffer.prototype, {

	isInterleavedBuffer: true,

	onUploadCallback: function () {},

	setUsage: function ( value ) {

		this.usage = value;

		return this;

	},

	copy: function ( source ) {

		this.array = new source.array.constructor( source.array );
		this.count = source.count;
		this.stride = source.stride;
		this.usage = source.usage;

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

	},

	onUpload: function ( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

} );


export { InterleavedBuffer };
