import { Texture, LinearFilter } from 'three';
import { GPUStorageTextureAccess } from '../webgpu/utils/WebGPUConstants.js';

class StorageTexture extends Texture {

	constructor( width = 1, height = 1, access = GPUStorageTextureAccess.WriteOnly ) {

		super();

		this.image = { width, height };

		this.magFilter = LinearFilter;
		this.minFilter = LinearFilter;

		this.isStorageTexture = true;

		this.access = access;

	}

}

export default StorageTexture;
