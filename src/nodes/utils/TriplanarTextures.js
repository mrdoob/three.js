import { add } from '../math/OperatorNode.js';
import { normalLocal } from '../accessors/Normal.js';
import { positionLocal } from '../accessors/Position.js';
import { texture } from '../accessors/TextureNode.js';
import { float, vec3, Fn } from '../tsl/TSLBase.js';

/**
 * TSL function for creating a triplanar textures node.
 *
 * Can be used for triplanar texture mapping.
 *
 * ```js
 * material.colorNode = triplanarTexture( texture( diffuseMap ) );
 * ```
 *
 * @tsl
 * @function
 * @param {Node} textureXNode - First texture node.
 * @param {?Node} [textureYNode=null] - Second texture node. When not set, the shader will sample from `textureXNode` instead.
 * @param {?Node} [textureZNode=null] - Third texture node. When not set, the shader will sample from `textureXNode` instead.
 * @param {?Node<float>} [scaleNode=float(1)] - The scale node.
 * @param {?Node<vec3>} [positionNode=positionLocal] - Vertex positions in local space.
 * @param {?Node<vec3>} [normalNode=normalLocal] - Normals in local space.
 * @returns {Node<vec4>}
 */
export const triplanarTextures = /*@__PURE__*/ Fn( ( [ textureXNode, textureYNode = null, textureZNode = null, scaleNode = float( 1 ), positionNode = positionLocal, normalNode = normalLocal ] ) => {

	// Reference: https://github.com/keijiro/StandardTriplanar

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

} );

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
 * @returns {Node<vec4>}
 */
export const triplanarTexture = ( ...params ) => triplanarTextures( ...params );
