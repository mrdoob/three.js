import { BufferAttribute } from "../core/BufferAttribute.js";

Object.assign( BufferAttribute.prototype, {

	copyIndicesArray: function ( /* indices */ ) {

		console.error( 'THREE.BufferAttribute: .copyIndicesArray() has been removed.' );

	},
	setArray: function ( array ) {

		console.warn( 'THREE.BufferAttribute: .setArray has been deprecated. Use BufferGeometry .setAttribute to replace/resize attribute buffers' );

		this.count = array !== undefined ? array.length / this.itemSize : 0;
		this.array = array;

		return this;

	}

} );

Object.defineProperties( BufferAttribute.prototype, {

	length: {
		get: function () {

			console.warn( 'THREE.BufferAttribute: .length has been deprecated. Use .count instead.' );
			return this.array.length;

		}
	}

} );
