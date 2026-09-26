import { DataTexture } from 'three/webgpu';

/**
 * Preserves the WebGL texture binding when replacing a storage attribute.
 *
 * @param {StorageBufferAttribute} oldAttribute - The previous attribute.
 * @param {StorageBufferAttribute} newAttribute - The replacement attribute.
 */
function retargetPBOAttribute( oldAttribute, newAttribute ) {

	if ( oldAttribute.pbo === undefined ) return;

	const originalArray = newAttribute.array;
	const itemSize = newAttribute.itemSize;
	const numElements = newAttribute.count * itemSize;
	const width = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( numElements / itemSize ) ) ) );
	let height = Math.ceil( ( numElements / itemSize ) / width );

	if ( width * height * itemSize < numElements ) height ++;

	const paddedArray = new originalArray.constructor( width * height * itemSize );
	paddedArray.set( originalArray );

	newAttribute.array = paddedArray;
	newAttribute.pboNode = oldAttribute.pboNode;

	const oldPBO = oldAttribute.pbo;

	// WebGL allocates PBO textures with texStorage2D, which cannot change size.
	// The shader indexes with textureSize(), so keeping a stale GPU width after
	// compact() mis-reads every splat. Rebuild the texture when the layout changes.
	if ( oldPBO.image.width !== width || oldPBO.image.height !== height ) {

		const newPBO = new DataTexture( paddedArray, width, height, oldPBO.format, oldPBO.type );
		newPBO.isPBOTexture = true;
		newPBO.needsUpdate = true;
		oldAttribute.pboNode.value = newPBO;
		newAttribute.pbo = newPBO;
		oldPBO.dispose();

	} else {

		newAttribute.pbo = oldPBO;
		oldPBO.image.data = paddedArray;
		oldPBO.needsUpdate = true;

	}

}

export { retargetPBOAttribute };
