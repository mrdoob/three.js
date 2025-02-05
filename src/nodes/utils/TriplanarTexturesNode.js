import Node from '../core/Node.js';
import { add } from '../math/OperatorNode.js';
import { normalLocal } from '../accessors/Normal.js';
import { positionLocal } from '../accessors/Position.js';
import { texture } from '../accessors/TextureNode.js';
import { nodeProxy, float, vec3 } from '../tsl/TSLBase.js';

/**
 * Can be used for triplanar texture mapping.
 *
 * ```js
 * material.colorNode = triplanarTexture( texture( diffuseMap ) );
 * ```
 *
 * @augments Node
 */
class TriplanarTexturesNode extends Node {

	static get type() {

		return 'TriplanarTexturesNode';

	}

	/**
	 * Constructs a new triplanar textures node.
	 *
	 * @param {Node} textureXNode - First texture node.
	 * @param {?Node} [textureYNode=null] - Second texture node. When not set, the shader will sample from `textureXNode` instead.
	 * @param {?Node} [textureZNode=null] - Third texture node. When not set, the shader will sample from `textureXNode` instead.
	 * @param {?Node<float>} [scaleNode=float(1)] - The scale node.
	 * @param {?Node<vec3>} [positionNode=positionLocal] - Vertex positions in local space.
	 * @param {?Node<vec3>} [normalNode=normalLocal] - Normals in local space.
	 */
	constructor( textureXNode, textureYNode = null, textureZNode = null, scaleNode = float( 1 ), positionNode = positionLocal, normalNode = normalLocal ) {

		super( 'vec4' );

		/**
		 * First texture node.
		 *
		 * @type {Node}
		 */
		this.textureXNode = textureXNode;

		/**
		 * Second texture node. When not set, the shader will sample from `textureXNode` instead.
		 *
		 * @type {Node}
		 * @default null
		 */
		this.textureYNode = textureYNode;

		/**
		 * Third texture node. When not set, the shader will sample from `textureXNode` instead.
		 *
		 * @type {Node}
		 * @default null
		 */
		this.textureZNode = textureZNode;

		/**
		 * The scale node.
		 *
		 * @type {Node<float>}
		 * @default float(1)
		 */
		this.scaleNode = scaleNode;

		/**
		 * Vertex positions in local space.
		 *
		 * @type {Node<vec3>}
		 * @default positionLocal
		 */
		this.positionNode = positionNode;

		/**
		 * Normals in local space.
		 *
		 * @type {Node<vec3>}
		 * @default normalLocal
		 */
		this.normalNode = normalNode;

	}

	setup() {

		const { textureXNode, textureYNode, textureZNode, scaleNode, positionNode, normalNode } = this;

		// Ref: https://github.com/keijiro/StandardTriplanar

		// Blending factor of triplanar mapping
		let bf = normalNode.abs().normalize();
		bf = bf.div( bf.dot( vec3( 1.0 ) ) );

		// Triplanar mapping
		const tx = positionNode.yz.mul( scaleNode );
		const ty = positionNode.zx.mul( scaleNode );
		const tz = positionNode.xy.mul( scaleNode );

		// Base color
		const textureX = textureXNode.value;
		const textureY = textureYNode !== null ? textureYNode.value : textureX;
		const textureZ = textureZNode !== null ? textureZNode.value : textureX;

		const cx = texture( textureX, tx ).mul( bf.x );
		const cy = texture( textureY, ty ).mul( bf.y );
		const cz = texture( textureZ, tz ).mul( bf.z );

		return add( cx, cy, cz );

	}

}

export default TriplanarTexturesNode;

/**
 * TSL function for creating a triplanar textures node.
 *
 * @tsl
 * @function
 * @param {Node} textureXNode - First texture node.
 * @param {?Node} [textureYNode=null] - Second texture node. When not set, the shader will sample from `textureXNode` instead.
 * @param {?Node} [textureZNode=null] - Third texture node. When not set, the shader will sample from `textureXNode` instead.
 * @param {?Node<float>} [scaleNode=float(1)] - The scale node.
 * @param {?Node<vec3>} [positionNode=positionLocal] - Vertex positions in local space.
 * @param {?Node<vec3>} [normalNode=normalLocal] - Normals in local space.
 * @returns {TriplanarTexturesNode}
 */
export const triplanarTextures = /*@__PURE__*/ nodeProxy( TriplanarTexturesNode );

/**
 * TSL function for creating a triplanar textures node.
 *
 * @tsl
 * @function
 * @param {Node} textureXNode - First texture node.
 * @param {?Node} [textureYNode=null] - Second texture node. When not set, the shader will sample from `textureXNode` instead.
 * @param {?Node} [textureZNode=null] - Third texture node. When not set, the shader will sample from `textureXNode` instead.
 * @param {?Node<float>} [scaleNode=float(1)] - The scale node.
 * @param {?Node<vec3>} [positionNode=positionLocal] - Vertex positions in local space.
 * @param {?Node<vec3>} [normalNode=normalLocal] - Normals in local space.
 * @returns {TriplanarTexturesNode}
 */
export const triplanarTexture = ( ...params ) => triplanarTextures( ...params );
