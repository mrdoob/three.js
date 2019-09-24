import { Int16BufferAttribute } from "../core/BufferAttribute.js";

export function Int16Attribute( array, itemSize ) {

	console.warn( 'THREE.Int16Attribute has been removed. Use new THREE.Int16BufferAttribute() instead.' );
	return new Int16BufferAttribute( array, itemSize );

}
