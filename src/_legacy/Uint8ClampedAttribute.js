import { Uint8ClampedBufferAttribute } from "../core/BufferAttribute.js";

export function Uint8ClampedAttribute( array, itemSize ) {

	console.warn( 'THREE.Uint8ClampedAttribute has been removed. Use new THREE.Uint8ClampedBufferAttribute() instead.' );
	return new Uint8ClampedBufferAttribute( array, itemSize );

}
