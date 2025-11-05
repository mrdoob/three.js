import { ShaderMaterial } from 'three';
import { NodeFrame } from 'three/webgpu';
import GLSLNodeBuilder from '../../../src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js';
import StandardNodeLibrary from '../../../src/renderers/webgpu/nodes/StandardNodeLibrary.js';

/**
 * Utility class for compiling NodeMaterials to ShaderMaterials that work
 * with the legacy WebGLRenderer.
 *
 * This allows using NodeMaterials and TSL with the traditional WebGLRenderer
 * without modifying the renderer's internals.
 *
 * @example
 * ```js
 * import * as THREE from 'three';
 * import { NodeMaterialCompiler } from 'three/addons/utils/NodeMaterialCompiler.js';
 * import { MeshBasicNodeMaterial, color } from 'three/tsl';
 *
 * const nodeMaterial = new MeshBasicNodeMaterial();
 * nodeMaterial.colorNode = color(1, 0, 0);
 *
 * const shaderMaterial = NodeMaterialCompiler.compile(nodeMaterial, {
 *   scene: scene,
 *   camera: camera,
 *   object: mesh
 * });
 *
 * mesh.material = shaderMaterial;
 * ```
 */
class NodeMaterialCompiler {

	/**
	 * Compiles a NodeMaterial to a ShaderMaterial.
	 *
	 * @param {NodeMaterial} nodeMaterial - The node material to compile.
	 * @param {Object} context - The compilation context.
	 * @param {Scene} context.scene - The scene.
	 * @param {Camera} context.camera - The camera.
	 * @param {Object3D} context.object - The object using this material.
	 * @param {Object} [context.renderer] - Optional renderer reference for context.
	 * @param {Node} [context.lightsNode] - Optional lights node.
	 * @param {Node} [context.environmentNode] - Optional environment node.
	 * @param {Node} [context.fogNode] - Optional fog node.
	 * @return {ShaderMaterial} The compiled shader material.
	 */
	static compile( nodeMaterial, context ) {

		if ( ! nodeMaterial.isNodeMaterial ) {

			console.error( 'NodeMaterialCompiler: Material is not a NodeMaterial', nodeMaterial );
			return nodeMaterial;

		}

		const { scene, camera, object, renderer, lightsNode, environmentNode, fogNode } = context;

		// Create a minimal renderer-like object for the node builder
		const rendererRef = renderer || {
			getOutputRenderTarget: () => null,
			getRenderTarget: () => null,
			info: { render: { calls: 0 } },
			library: new StandardNodeLibrary(),
			overrideNodes: {
				modelViewMatrix: null,
				modelNormalViewMatrix: null
			},
			backend: {
				isWebGPUBackend: false
			}
		};

		// Ensure library exists
		if ( ! rendererRef.library ) {

			rendererRef.library = new StandardNodeLibrary();

		}

		// Create the node builder
		const nodeBuilder = new GLSLNodeBuilder( object, rendererRef );
		nodeBuilder.scene = scene;
		nodeBuilder.material = nodeMaterial;
		nodeBuilder.camera = camera;
		nodeBuilder.context.material = nodeMaterial;
		nodeBuilder.lightsNode = lightsNode || null;
		nodeBuilder.environmentNode = environmentNode || null;
		nodeBuilder.fogNode = fogNode || null;

		// Build the shader
		try {

			nodeBuilder.build();

		} catch ( error ) {

			console.error( 'NodeMaterialCompiler: Failed to build node material', error );
			throw error;

		}

		// Extract shader code
		const vertexShader = nodeBuilder.vertexShader;
		const fragmentShader = nodeBuilder.fragmentShader;

		// Create uniforms object
		const uniforms = {};
		const bindings = nodeBuilder.getBindings();

		// Convert node uniforms to shader material uniforms
		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const uniforms_ = binding.uniforms || binding.buffer?.uniforms;

				if ( uniforms_ ) {

					for ( const uniform of uniforms_ ) {

						uniforms[ uniform.name ] = { value: uniform.value };

					}

				}

			} else if ( binding.isSampledTexture ) {

				// Texture binding
				uniforms[ binding.name ] = { value: binding.texture };

			}

		}

		// Create the shader material
		const shaderMaterial = new ShaderMaterial( {
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: uniforms,
			lights: nodeMaterial.lights !== undefined ? nodeMaterial.lights : false,
			fog: nodeMaterial.fog !== undefined ? nodeMaterial.fog : false,
			transparent: nodeMaterial.transparent,
			opacity: nodeMaterial.opacity,
			side: nodeMaterial.side,
			depthTest: nodeMaterial.depthTest,
			depthWrite: nodeMaterial.depthWrite,
			blending: nodeMaterial.blending
		} );

		// Store reference to original material and node builder for updates
		shaderMaterial.userData.nodeMaterial = nodeMaterial;
		shaderMaterial.userData.nodeBuilder = nodeBuilder;
		shaderMaterial.userData.compilationContext = context;

		// Mark as compiled from node material
		shaderMaterial.isCompiledNodeMaterial = true;

		return shaderMaterial;

	}

	/**
	 * Updates a compiled shader material's uniforms from its source node material.
	 *
	 * Call this in your render loop if the node material has dynamic values.
	 *
	 * @param {ShaderMaterial} shaderMaterial - The compiled shader material.
	 * @param {NodeFrame} [nodeFrame] - Optional node frame for time/frame updates.
	 */
	static updateUniforms( shaderMaterial, nodeFrame ) {

		if ( ! shaderMaterial.isCompiledNodeMaterial ) {

			return;

		}

		const nodeBuilder = shaderMaterial.userData.nodeBuilder;

		if ( ! nodeBuilder ) {

			return;

		}

		// Update node values
		if ( nodeBuilder.updateNodes && nodeBuilder.updateNodes.length > 0 ) {

			const frame = nodeFrame || new NodeFrame();

			for ( const node of nodeBuilder.updateNodes ) {

				if ( node.update ) {

					node.update( frame );

				}

			}

		}

		// Update uniforms
		const bindings = nodeBuilder.getBindings();

		for ( const binding of bindings ) {

			if ( binding.isUniformsGroup || binding.isUniformBuffer ) {

				const uniforms_ = binding.uniforms || binding.buffer?.uniforms;

				if ( uniforms_ ) {

					for ( const uniform of uniforms_ ) {

						if ( shaderMaterial.uniforms[ uniform.name ] ) {

							shaderMaterial.uniforms[ uniform.name ].value = uniform.value;

						}

					}

				}

			} else if ( binding.isSampledTexture ) {

				if ( shaderMaterial.uniforms[ binding.name ] ) {

					shaderMaterial.uniforms[ binding.name ].value = binding.texture;

				}

			}

		}

	}

	/**
	 * Checks if recompilation is needed (e.g., if node graph changed).
	 *
	 * @param {ShaderMaterial} shaderMaterial - The compiled shader material.
	 * @return {boolean} True if recompilation is needed.
	 */
	static needsRecompile( shaderMaterial ) {

		if ( ! shaderMaterial.isCompiledNodeMaterial ) {

			return false;

		}

		const nodeMaterial = shaderMaterial.userData.nodeMaterial;

		// Check if the material's version has changed (indicates graph modification)
		return nodeMaterial && nodeMaterial.version !== shaderMaterial.userData.materialVersion;

	}

	/**
	 * Recompiles a shader material from its source node material.
	 *
	 * @param {ShaderMaterial} shaderMaterial - The compiled shader material to recompile.
	 * @return {ShaderMaterial} The recompiled shader material.
	 */
	static recompile( shaderMaterial ) {

		if ( ! shaderMaterial.isCompiledNodeMaterial ) {

			return shaderMaterial;

		}

		const nodeMaterial = shaderMaterial.userData.nodeMaterial;
		const context = shaderMaterial.userData.compilationContext;

		if ( ! nodeMaterial || ! context ) {

			console.error( 'NodeMaterialCompiler: Cannot recompile, missing source data' );
			return shaderMaterial;

		}

		// Compile fresh
		const newMaterial = this.compile( nodeMaterial, context );

		// Copy over the version
		newMaterial.userData.materialVersion = nodeMaterial.version;

		return newMaterial;

	}

}

export { NodeMaterialCompiler };
