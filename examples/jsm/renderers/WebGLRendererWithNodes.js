import { WebGLRenderer } from 'three';
import { NodeFrame } from 'three/webgpu';
import { NodeMaterialCompiler } from '../utils/NodeMaterialCompiler.js';
import StandardNodeLibrary from '../../../src/renderers/webgpu/nodes/StandardNodeLibrary.js';

/**
 * Extended WebGLRenderer that adds support for NodeMaterials and TSL without
 * modifying the core renderer internals.
 *
 * This renderer automatically detects NodeMaterials and compiles them to
 * ShaderMaterials that work with the traditional WebGLRenderer.
 *
 * @example
 * ```js
 * import * as THREE from 'three';
 * import { WebGLRendererWithNodes } from 'three/addons/renderers/WebGLRendererWithNodes.js';
 * import { MeshBasicNodeMaterial, color, time, oscSine } from 'three/tsl';
 *
 * const renderer = new WebGLRendererWithNodes({ antialias: true });
 *
 * // Use NodeMaterials directly
 * const material = new MeshBasicNodeMaterial();
 * material.colorNode = color(oscSine(time), 0, 0);
 *
 * const mesh = new THREE.Mesh(geometry, material);
 * scene.add(mesh);
 *
 * // Render normally - NodeMaterials are automatically compiled
 * renderer.render(scene, camera);
 * ```
 *
 * @augments WebGLRenderer
 */
class WebGLRendererWithNodes extends WebGLRenderer {

	/**
	 * Constructs a new WebGL renderer with NodeMaterial support.
	 *
	 * @param {Object} [parameters] - The configuration parameters.
	 */
	constructor( parameters = {} ) {

		super( parameters );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGLRendererWithNodes = true;

		/**
		 * Node library for material type mapping.
		 *
		 * @type {StandardNodeLibrary}
		 */
		this.library = new StandardNodeLibrary();

		/**
		 * Cache for compiled materials.
		 * Maps NodeMaterial instances to their compiled ShaderMaterial counterparts.
		 *
		 * @private
		 * @type {WeakMap<NodeMaterial, ShaderMaterial>}
		 */
		this._compiledMaterials = new WeakMap();

		/**
		 * Cache for material versions.
		 * Tracks when materials need recompilation.
		 *
		 * @private
		 * @type {WeakMap<NodeMaterial, number>}
		 */
		this._materialVersions = new WeakMap();

		/**
		 * Node frame for time and frame updates.
		 *
		 * @private
		 * @type {NodeFrame}
		 */
		this._nodeFrame = new NodeFrame();

		/**
		 * Whether to automatically update node uniforms each frame.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoUpdateNodeUniforms = true;

	}

	/**
	 * Compiles a NodeMaterial to a ShaderMaterial.
	 *
	 * @private
	 * @param {NodeMaterial} nodeMaterial - The node material.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @param {Object3D} object - The object using the material.
	 * @return {ShaderMaterial} The compiled shader material.
	 */
	_compileNodeMaterial( nodeMaterial, scene, camera, object ) {

		const context = {
			scene: scene,
			camera: camera,
			object: object,
			renderer: this
		};

		const shaderMaterial = NodeMaterialCompiler.compile( nodeMaterial, context );

		// Store the material version
		shaderMaterial.userData.materialVersion = nodeMaterial.version;

		return shaderMaterial;

	}

	/**
	 * Gets or compiles a ShaderMaterial for the given NodeMaterial.
	 *
	 * @private
	 * @param {NodeMaterial} nodeMaterial - The node material.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @param {Object3D} object - The object using the material.
	 * @return {ShaderMaterial} The compiled shader material.
	 */
	_getCompiledMaterial( nodeMaterial, scene, camera, object ) {

		let shaderMaterial = this._compiledMaterials.get( nodeMaterial );
		const currentVersion = nodeMaterial.version;
		const cachedVersion = this._materialVersions.get( nodeMaterial );

		// Check if we need to recompile
		if ( ! shaderMaterial || cachedVersion !== currentVersion ) {

			shaderMaterial = this._compileNodeMaterial( nodeMaterial, scene, camera, object );
			this._compiledMaterials.set( nodeMaterial, shaderMaterial );
			this._materialVersions.set( nodeMaterial, currentVersion );

		} else if ( this.autoUpdateNodeUniforms ) {

			// Update uniforms if auto-update is enabled
			NodeMaterialCompiler.updateUniforms( shaderMaterial, this._nodeFrame );

		}

		return shaderMaterial;

	}

	/**
	 * Processes the scene before rendering to convert NodeMaterials.
	 *
	 * @private
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 */
	_processNodeMaterials( scene, camera ) {

		const nodeMaterialObjects = [];

		scene.traverse( object => {

			if ( object.material ) {

				const materials = Array.isArray( object.material ) ? object.material : [ object.material ];

				for ( let i = 0; i < materials.length; i ++ ) {

					const material = materials[ i ];

					if ( material && material.isNodeMaterial ) {

						// Compile and replace with ShaderMaterial
						const shaderMaterial = this._getCompiledMaterial( material, scene, camera, object );

						if ( Array.isArray( object.material ) ) {

							object.material[ i ] = shaderMaterial;

						} else {

							object.material = shaderMaterial;

						}

						// Store for restoration
						nodeMaterialObjects.push( {
							object: object,
							index: i,
							originalMaterial: material,
							isArray: Array.isArray( object.material )
						} );

					}

				}

			}

		} );

		return nodeMaterialObjects;

	}

	/**
	 * Restores original NodeMaterials after rendering.
	 *
	 * @private
	 * @param {Array} nodeMaterialObjects - Array of objects to restore.
	 */
	_restoreNodeMaterials( nodeMaterialObjects ) {

		for ( const entry of nodeMaterialObjects ) {

			if ( entry.isArray ) {

				entry.object.material[ entry.index ] = entry.originalMaterial;

			} else {

				entry.object.material = entry.originalMaterial;

			}

		}

	}

	/**
	 * Renders a scene using a camera.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render from.
	 */
	render( scene, camera ) {

		// Update node frame
		this._nodeFrame.update();

		// Process and temporarily replace NodeMaterials
		const nodeMaterialObjects = this._processNodeMaterials( scene, camera );

		// Render with the parent WebGLRenderer
		super.render( scene, camera );

		// Restore original NodeMaterials
		this._restoreNodeMaterials( nodeMaterialObjects );

	}

	/**
	 * Clears the compiled material cache.
	 * Useful when you want to force recompilation of all NodeMaterials.
	 */
	clearNodeMaterialCache() {

		this._compiledMaterials = new WeakMap();
		this._materialVersions = new WeakMap();

	}

	/**
	 * Manually compiles a NodeMaterial without rendering.
	 * Useful for pre-compilation to avoid hitches during rendering.
	 *
	 * @param {NodeMaterial} nodeMaterial - The node material to compile.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @param {Object3D} object - The object using the material.
	 * @return {ShaderMaterial} The compiled shader material.
	 */
	compileNodeMaterial( nodeMaterial, scene, camera, object ) {

		return this._getCompiledMaterial( nodeMaterial, scene, camera, object );

	}

}

export { WebGLRendererWithNodes };
