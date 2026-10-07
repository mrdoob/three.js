import { MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three';

/** Shared wood finish and loading barrier for the comparison tables. */
function createWoodTableMaterial() {

	const material = new MeshStandardMaterial( { roughness: 0.7 } );
	const ready = new TextureLoader().loadAsync( new URL( '../../textures/hardwood2_diffuse.jpg', import.meta.url ).href ).then( texture => {

		texture.colorSpace = SRGBColorSpace;
		texture.wrapS = texture.wrapT = RepeatWrapping;
		texture.repeat.set( 2, 1 );
		material.map = texture;
		material.needsUpdate = true;

	} );
	return { material, ready };

}

export { createWoodTableMaterial };
