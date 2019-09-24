import { Int32BufferAttribute } from "../core/BufferAttribute.js";

export function Int32Attribute( array, itemSize ) {

	console.warn( 'THREE.Int32Attribute has been removed. Use new THREE.Int32BufferAttribute() instead.' );
	return new Int32BufferAttribute( array, itemSize );

}
