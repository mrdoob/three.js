import { Vector4 } from "../math/Vector4.js";

Object.assign( Vector4.prototype, {

	fromAttribute: function ( attribute, index, offset ) {

		console.warn( 'THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute().' );
		return this.fromBufferAttribute( attribute, index, offset );

	},
	lengthManhattan: function () {

		console.warn( 'THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength().' );
		return this.manhattanLength();

	}

} );
