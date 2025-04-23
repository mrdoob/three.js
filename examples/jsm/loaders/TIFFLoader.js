import {
	DataTextureLoader,
	LinearFilter,
	LinearMipmapLinearFilter
} from 'three';

import UTIF from '../libs/utif.module.js';

/**
 * A loader for the TIFF texture format.
 *
 * ```js
 * const loader = new TIFFLoader();
 * const texture = await loader.loadAsync( 'textures/tiff/crate_lzw.tif' );
 * texture.colorSpace = THREE.SRGBColorSpace;
 * ```
 *
 * @augments DataTextureLoader
 * @three_import import { TIFFLoader } from 'three/addons/loaders/TIFFLoader.js';
 */
class TIFFLoader extends DataTextureLoader {

	/**
	 * Constructs a new TIFF loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Parses the given TIFF texture data.
	 *
	 * @param {ArrayBuffer} buffer - The raw texture data.
	 * @return {DataTextureLoader~TexData} An object representing the parsed texture data.
	 */
	parse( buffer ) {

		const ifds = UTIF.decode( buffer );
		UTIF.decodeImage( buffer, ifds[ 0 ] );
		const rgba = UTIF.toRGBA8( ifds[ 0 ] );

		return {
			width: ifds[ 0 ].width,
			height: ifds[ 0 ].height,
			data: rgba,
			flipY: true,
			magFilter: LinearFilter,
			minFilter: LinearMipmapLinearFilter
		};

	}

}

export { TIFFLoader };
