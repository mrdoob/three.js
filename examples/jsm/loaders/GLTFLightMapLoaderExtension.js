import { LinearSRGBColorSpace } from 'three';

/**
 * A glTF loader plugin for the vendor extension `MOZ_lightmap`.
 * Light maps contain linear irradiance. The UV set defaults to the second UV set
 * for compatibility with Hubs assets. Texture transforms are supported.
 *
 * ```js
 * loader.register( parser => new GLTFLightMapLoaderExtension( parser ) );
 * ```
 *
 * @three_import import { GLTFLightMapLoaderExtension } from 'three/addons/loaders/GLTFLightMapLoaderExtension.js';
 */
class GLTFLightMapLoaderExtension {

	/**
	 * Constructs a light map loader plugin.
	 *
	 * @param {GLTFParser} parser - The glTF parser.
	 */
	constructor( parser ) {

		this.parser = parser;
		this.name = 'MOZ_lightmap';

	}

	/**
	 * Loads a material with a light map, including unlit materials.
	 *
	 * @param {number} materialIndex - The material index.
	 * @return {?Promise<Material>} The material, or null when the extension is absent.
	 */
	loadMaterial( materialIndex ) {

		const parser = this.parser;
		const extension = parser.json.materials[ materialIndex ].extensions?.[ this.name ];

		if ( extension === undefined ) return null;

		// extendMaterialParams is only called for PBR materials by GLTFLoader.
		return parser.loadMaterial( materialIndex ).then( async material => {

			await parser.assignTexture( material, 'lightMap', { texCoord: 1, ...extension } );

			if ( material.lightMap ) {

				// A texture may also be used by an sRGB material slot.
				material.lightMap = material.lightMap.clone();
				material.lightMap.colorSpace = LinearSRGBColorSpace;

			}

			material.lightMapIntensity = extension.intensity ?? 1;

			return material;

		} );

	}

}

export { GLTFLightMapLoaderExtension };
