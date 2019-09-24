import { InterleavedBuffer } from "../core/InterleavedBuffer.js";

Object.assign( InterleavedBuffer.prototype, {

	setArray: function ( array ) {

		console.warn( 'THREE.InterleavedBuffer: .setArray has been deprecated. Use BufferGeometry .setAttribute to replace/resize attribute buffers' );

		this.count = array !== undefined ? array.length / this.stride : 0;
		this.array = array;

		return this;

	}

} );
