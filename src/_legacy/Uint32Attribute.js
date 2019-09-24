import { Uint32BufferAttribute } from "../core/BufferAttribute.js";

export function Uint32Attribute( array, itemSize ) {

	console.warn( 'THREE.Uint32Attribute has been removed. Use new THREE.Uint32BufferAttribute() instead.' );
	return new Uint32BufferAttribute( array, itemSize );

}
