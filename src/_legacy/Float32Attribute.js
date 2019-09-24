import { Float32BufferAttribute } from "../core/BufferAttribute.js";

export function Float32Attribute( array, itemSize ) {

	console.warn( 'THREE.Float32Attribute has been removed. Use new THREE.Float32BufferAttribute() instead.' );
	return new Float32BufferAttribute( array, itemSize );

}
