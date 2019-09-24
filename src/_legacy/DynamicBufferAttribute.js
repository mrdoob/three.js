import { BufferAttribute } from "../core/BufferAttribute.js";

export function DynamicBufferAttribute( array, itemSize ) {

	console.warn( 'THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead.' );
	return new BufferAttribute( array, itemSize ).setDynamic( true );

}
