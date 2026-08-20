import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';
import {
	ShadowMaterial,
	SpriteMaterial,
	RawShaderMaterial,
	ShaderMaterial,
	PointsMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	MeshToonMaterial,
	MeshNormalMaterial,
	MeshLambertMaterial,
	MeshDepthMaterial,
	MeshDistanceMaterial,
	MeshBasicMaterial,
	MeshMatcapMaterial,
	LineDashedMaterial,
	LineBasicMaterial,
	Material,
} from '../materials/Materials.js';
import { error, warnOnce } from '../utils.js';

const _customMaterials = {};

/**
 * Class for loading materials. The files are internally
 * loaded via {@link FileLoader}.
 *
 * ```js
 * const loader = new THREE.MaterialLoader();
 * const material = await loader.loadAsync( 'material.json' );
 * ```
 * This loader does not support node materials. Use {@link NodeMaterialLoader} instead.
 *
 * @augments Loader
 */
class MaterialLoader extends Loader {

	/**
	 * Constructs a new material loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * A dictionary holding textures used by the material.
		 *
		 * @type {Object<string,Texture>}
		 */
		this.textures = {};

	}

	/**
	 * Starts loading from the given URL and pass the loaded material to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Material)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given JSON object and returns a material.
	 *
	 * @param {Object} json - The serialized material.
	 * @return {Material} The parsed material.
	 */
	parse( json ) {

		const material = this.createMaterialFromType( json.type );

		material.fromJSON( json, this.textures );

		return material;

	}

	/**
	 * Textures are not embedded in the material JSON so they have
	 * to be injected before the loading process starts.
	 *
	 * @param {Object} value - A dictionary holding textures for material properties.
	 * @return {MaterialLoader} A reference to this material loader.
	 */
	setTextures( value ) {

		this.textures = value;
		return this;

	}

	/**
	 * Creates a material for the given type.
	 *
	 * @param {string} type - The material type.
	 * @return {Material} The new material.
	 */
	createMaterialFromType( type ) {

		return MaterialLoader.createMaterialFromType( type );

	}

	/**
	 * Creates a material for the given type.
	 *
	 * @static
	 * @param {string} type - The material type.
	 * @return {Material} The new material.
	 */
	static createMaterialFromType( type ) {

		const materialLib = {
			ShadowMaterial,
			SpriteMaterial,
			RawShaderMaterial,
			ShaderMaterial,
			PointsMaterial,
			MeshPhysicalMaterial,
			MeshStandardMaterial,
			MeshPhongMaterial,
			MeshToonMaterial,
			MeshNormalMaterial,
			MeshLambertMaterial,
			MeshDepthMaterial,
			MeshDistanceMaterial,
			MeshBasicMaterial,
			MeshMatcapMaterial,
			LineDashedMaterial,
			LineBasicMaterial,
			Material,
			... _customMaterials
		};

		const MaterialType = materialLib[ type ];

		let materialInstance;

		if ( MaterialType === undefined ) {

			warnOnce( `MaterialLoader: Unknown material type "${ type }". Use .registerMaterial() before starting the deserialization process.` );
			materialInstance = new Material();

		} else {

			materialInstance = new MaterialType();

		}

		return materialInstance;

	}

	/**
	 * Registers the given material at the internal
	 * material library.
	 *
	 * @static
	 * @param {string} type - The material type.
	 * @param {Material.constructor} materialClass - The material class.
	 */
	static registerMaterial( type, materialClass ) {

		_customMaterials[ type ] = materialClass;

	}

}

export { MaterialLoader };
