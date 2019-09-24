import { Float64BufferAttribute } from "../core/BufferAttribute.js";

export function Float64Attribute( array, itemSize ) {

	console.warn( 'THREE.Float64Attribute has been removed. Use new THREE.Float64BufferAttribute() instead.' );
	return new Float64BufferAttribute( array, itemSize );

}
