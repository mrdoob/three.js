import { Uint8BufferAttribute } from "../core/BufferAttribute.js";

export function Uint8Attribute( array, itemSize ) {

	console.warn( 'THREE.Uint8Attribute has been removed. Use new THREE.Uint8BufferAttribute() instead.' );
	return new Uint8BufferAttribute( array, itemSize );

}
