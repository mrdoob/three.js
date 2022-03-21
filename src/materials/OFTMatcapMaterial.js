import { MeshMatcapMaterial } from './MeshMatcapMaterial.js';

/**
 * Used in gltfloader, filp uv's v for matcap texture.
 */
class OFTMatcapMaterial extends MeshMatcapMaterial {

	constructor( parameters ) {

		super( parameters );

		this.type = 'OFTMatcapMaterial';

		this.defines.OFT_MATCAP = '';

	}

	copy( source ) {

		super.copy( source );

		this.defines = Object.assign( {}, source.defines );

		return this;

	}

}

OFTMatcapMaterial.prototype.isOFTMatcapMaterial = true;

export { OFTMatcapMaterial };
