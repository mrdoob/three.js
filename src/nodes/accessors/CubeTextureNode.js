import TextureNode from './TextureNode.js';
import SamplerNode, { sampleTexture } from './SamplerNode.js';
import { reflectVector, refractVector } from './ReflectVector.js';
import { nodeProxy, vec3 } from '../tsl/TSLBase.js';

import { CubeReflectionMapping, CubeRefractionMapping, WebGPUCoordinateSystem } from '../../constants.js';

import { CubeTexture } from '../../textures/CubeTexture.js';
import { error } from '../../utils.js';

const EmptyTexture = /*@__PURE__*/ new CubeTexture();

/**
 * This type of uniform node represents a cube texture.
 *
 * @augments TextureNode
 */
class CubeTextureNode extends TextureNode {

	static get type() {

		return 'CubeTextureNode';

	}

	/**
	 * Constructs a new cube texture node.
	 *
	 * @param {CubeTexture} value - The cube texture.
	 * @param {?Node<vec3>} [uvNode=null] - The uv node.
	 * @param {?Node<int>} [levelNode=null] - The level node.
	 * @param {?Node<float>} [biasNode=null] - The bias node.
	 */
	constructor( value, uvNode = null, levelNode = null, biasNode = null ) {

		super( value, uvNode, levelNode, biasNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeTextureNode = true;

	}

	/**
	 * Returns `false` because cube textures are sampled using 3D direction vectors.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	get updateMatrix() {

		return false;

	}

	/**
	 * Overwrites the default implementation to return the appropriate cube texture type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

		if ( this.value.isDepthTexture === true ) {

			return 'cubeDepthTexture';

		}

		return 'cubeTexture';

	}

	/**
	 * Returns a default uvs based on the mapping type of the cube texture.
	 *
	 * @return {Node<vec3>} The default uv attribute.
	 */
	getDefaultUV() {

		const texture = this.value;

		if ( texture.mapping === CubeReflectionMapping ) {

			return reflectVector;

		} else if ( texture.mapping === CubeRefractionMapping ) {

			return refractVector;

		} else {

			error( 'CubeTextureNode: Mapping "%s" not supported.', texture.mapping );

			return vec3( 0, 0, 0 );

		}

	}

	/**
	 * Setups the uv node. Depending on the backend as well as the texture type, it might be necessary
	 * to modify the uv node for correct sampling.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} uvNode - The uv node to setup.
	 * @return {Node} The updated uv node.
	 */
	setupUV( builder, uvNode ) {

		const texture = this.value;

		if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem || ( ! texture.isRenderTargetTexture && ! texture.isDepthTexture ) ) {

			uvNode = vec3( uvNode.x.negate(), uvNode.yz );

		}

		return uvNode;

	}

	/**
	 * Generates the uv code snippet.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} cubeUV - The uv node to generate code for.
	 * @param {SamplerNode} samplerNode - The sampler node.
	 * @return {string} The generated code snippet.
	 */
	generateUV( builder, cubeUV, samplerNode ) {

		return cubeUV.build( builder, samplerNode.sampler === true ? 'vec3' : 'ivec3' );

	}

}

/**
 * A sampler node that creates a cube texture node for its texture.
 *
 * @private
 * @augments SamplerNode
 */
class CubeSamplerNode extends SamplerNode {

	static get type() {

		return 'CubeSamplerNode';

	}

	createTextureNode( texture ) {

		return new CubeTextureNode( texture );

	}

}

export default CubeTextureNode;

/**
 * TSL function for creating a cube texture node.
 *
 * @tsl
 * @function
 * @param {CubeTexture} value - The cube texture.
 * @param {?Node<vec3>} [uvNode=null] - The uv node.
 * @param {?Node<int>} [levelNode=null] - The level node.
 * @param {?Node<float>} [biasNode=null] - The bias node.
 * @returns {CubeTextureNode}
 */
export const cubeTextureBase = /*@__PURE__*/ nodeProxy( CubeTextureNode ).setParameterLength( 1, 4 ).setName( 'cubeTexture' );

/**
 * TSL function for sampling a cube texture, a cube texture node or a sampler node.
 * The samples of a cube texture share a single binding with the other samples of the
 * same texture.
 *
 * @tsl
 * @function
 * @param {?(CubeTexture|CubeTextureNode|SamplerNode)} [value=EmptyTexture] - The cube texture.
 * @param {?Node<vec3>} [uvNode=null] - The uv node.
 * @param {?Node<int>} [levelNode=null] - The level node.
 * @param {?Node<float>} [biasNode=null] - The bias node.
 * @returns {SamplerNode}
 */
export const cubeTexture = ( value = EmptyTexture, uvNode = null, levelNode = null, biasNode = null ) => sampleTexture( CubeSamplerNode, value, uvNode, levelNode, biasNode );

/**
 * TSL function for creating a uniform cube texture node: the binding of a cube texture,
 * never merged with other texture nodes.
 *
 * @tsl
 * @function
 * @param {?CubeTexture} [value=EmptyTexture] - The cube texture.
 * @returns {CubeTextureNode}
 */
export const uniformCubeTexture = ( value = EmptyTexture ) => new CubeTextureNode( value );
