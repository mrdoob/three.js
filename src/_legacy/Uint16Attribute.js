import { Uint16BufferAttribute } from "../core/BufferAttribute.js";

export function Uint16Attribute( array, itemSize ) {

	console.warn( 'THREE.Uint16Attribute has been removed. Use new THREE.Uint16BufferAttribute() instead.' );
	return new Uint16BufferAttribute( array, itemSize );

}
