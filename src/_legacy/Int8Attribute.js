import { Int8BufferAttribute } from "../core/BufferAttribute.js";

export function Int8Attribute( array, itemSize ) {

	console.warn( 'THREE.Int8Attribute has been removed. Use new THREE.Int8BufferAttribute() instead.' );
	return new Int8BufferAttribute( array, itemSize );

}
