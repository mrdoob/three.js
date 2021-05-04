import * as MathUtils from '../math/MathUtils.js';
import { StaticDrawUsage } from '../constants.js';

class InterleavedBuffer {

	constructor( buffer ) {

		this.array = new Uint8Array( buffer );

		this.usage = StaticDrawUsage;
		this.updateRange = { offset: 0, count: - 1 };

		this.version = 0;

		this.uuid = MathUtils.generateUUID();

	}

	onUploadCallback() {}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	copy( source ) {

		this.array = source.array.slice();
		this.usage = source.usage;

		return this;

	}

	clone( data ) {

		if ( data.arrayBuffers === undefined ) {

			data.arrayBuffers = {};

		}

		if ( this.array.buffer._uuid === undefined ) {

			this.array.buffer._uuid = MathUtils.generateUUID();

		}

		if ( data.arrayBuffers[ this.array.buffer._uuid ] === undefined ) {

			data.arrayBuffers[ this.array.buffer._uuid ] = this.array.slice( 0 ).buffer;

		}

		const ib = new InterleavedBuffer( data.arrayBuffers[ this.array.buffer._uuid ] );
		ib.setUsage( this.usage );

		return ib;

	}

	onUpload( callback ) {

		this.onUploadCallback = callback;

		return this;

	}

	toJSON( data ) {

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

		const output = {
			uuid: this.uuid,
			buffer: this.array.buffer._uuid
		};

		if ( this.usage !== StaticDrawUsage ) output.usage = this.usage;
		if ( this.updateRange.offset !== 0 || this.updateRange.count !== - 1 ) output.updateRange = this.updateRange;

		return output;

	}

}

InterleavedBuffer.prototype.isInterleavedBuffer = true;

export { InterleavedBuffer };
