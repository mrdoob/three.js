import TextureNode from './TextureNode.js';
import { reflectVector, refractVector } from './ReflectVector.js';
import { nodeProxy, vec3 } from '../tsl/TSLBase.js';

import { CubeReflectionMapping, CubeRefractionMapping, WebGPUCoordinateSystem } from '../../constants.js';
import { materialEnvRotation } from './MaterialProperties.js';

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
	 * Overwrites the default implementation to return a fixed value `'cubeTexture'`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( /*builder*/ ) {

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

			console.error( 'THREE.CubeTextureNode: Mapping "%s" not supported.', texture.mapping );

			return vec3( 0, 0, 0 );

		}

	}

	/**
	 * Overwritten with an empty implementation since the `updateMatrix` flag is ignored
	 * for cube textures. The uv transformation matrix is not applied to cube textures.
	 *
	 * @param {boolean} value - The update toggle.
	 */
	setUpdateMatrix( /*updateMatrix*/ ) { } // Ignore .updateMatrix for CubeTextureNode

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

		if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem || ! texture.isRenderTargetTexture ) {

			uvNode = vec3( uvNode.x.negate(), uvNode.yz );

		}

		return materialEnvRotation.mul( uvNode );

	}

	/**
	 * Generates the uv code snippet.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {Node} cubeUV - The uv node to generate code for.
	 * @return {string} The generated code snippet.
	 */
	generateUV( builder, cubeUV ) {

		return cubeUV.build( builder, 'vec3' );

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
export const cubeTexture = /*@__PURE__*/ nodeProxy( CubeTextureNode );
