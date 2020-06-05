import { MathUtils } from '../math/MathUtils.js';
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

	this.uuid = MathUtils.generateUUID();

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

		for ( let i = 0, l = this.stride; i < l; i ++ ) {

			this.array[ index1 + i ] = attribute.array[ index2 + i ];

		}

		return this;

	},

	set: function ( value, offset ) {

		if ( offset === undefined ) offset = 0;

		this.array.set( value, offset );

		return this;

	},

	clone: function ( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = MathUtils.generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = this.array.slice( 0 ).buffer;

		}

		const array = new this.array.constructor( data.arrayBuffers[ this.array.buffer._uuid ] );

		const ib = new InterleavedBuffer( array, this.stride );
		ib.setUsage( this.usage );

		return ib;

	},

	onUpload: function ( callback ) {

		this.onUploadCallback = callback;

		return this;

	},

	toJSON: function ( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		// generate UUID for array buffer if necessary

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = MathUtils.generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = Array.prototype.slice.call( new Uint32Array( this.array.buffer ) );

		}

		//

		return {
			uuid: this.uuid,
			buffer: this.array.buffer._uuid,
			type: this.array.constructor.name,
			stride: this.stride
		};

	}

} );

export { InterleavedBuffer };
