import TempNode from '../core/TempNode.js';
import { add } from '../math/OperatorNode.js';

import { normalView, transformNormalToView } from '../accessors/Normal.js';
import { positionView } from '../accessors/Position.js';
import { TBNViewMatrix } from '../accessors/AccessorsUtils.js';
import { uv } from '../accessors/UV.js';
import { faceDirection } from './FrontFacingNode.js';
import { Fn, nodeProxy, vec3 } from '../tsl/TSLBase.js';

import { TangentSpaceNormalMap, ObjectSpaceNormalMap } from '../../constants.js';

// Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180

const perturbNormal2Arb = /*@__PURE__*/ Fn( ( inputs ) => {

	const { eye_pos, surf_norm, mapN, uv } = inputs;

	const q0 = eye_pos.dFdx();
	const q1 = eye_pos.dFdy();
	const st0 = uv.dFdx();
	const st1 = uv.dFdy();

	const N = surf_norm; // normalized

	const q1perp = q1.cross( N );
	const q0perp = N.cross( q0 );

	const T = q1perp.mul( st0.x ).add( q0perp.mul( st1.x ) );
	const B = q1perp.mul( st0.y ).add( q0perp.mul( st1.y ) );

	const det = T.dot( T ).max( B.dot( B ) );
	const scale = faceDirection.mul( det.inverseSqrt() );

	return add( T.mul( mapN.x, scale ), B.mul( mapN.y, scale ), N.mul( mapN.z ) ).normalize();

} );

/**
 * This class can be used for applying normals maps to materials.
 *
 * ```js
 * material.normalNode = normalMap( texture( normalTex ) );
 * ```
 *
 * @augments TempNode
 */
class NormalMapNode extends TempNode {

	static get type() {

		return 'NormalMapNode';

	}

	/**
	 * Constructs a new normal map node.
	 *
	 * @param {Node<vec3>} node - Represents the normal map data.
	 * @param {?Node<vec2>} [scaleNode=null] - Controls the intensity of the effect.
	 */
	constructor( node, scaleNode = null ) {

		super( 'vec3' );

		/**
		 * Represents the normal map data.
		 *
		 * @type {Node<vec3>}
		 */
		this.node = node;

		/**
		 * Controls the intensity of the effect.
		 *
		 * @type {?Node<vec2>}
		 * @default null
		 */
		this.scaleNode = scaleNode;

		/**
		 * The normal map type.
		 *
		 * @type {(TangentSpaceNormalMap|ObjectSpaceNormalMap)}
		 * @default TangentSpaceNormalMap
		 */
		this.normalMapType = TangentSpaceNormalMap;

	}

	setup( builder ) {

		const { normalMapType, scaleNode } = this;

		let normalMap = this.node.mul( 2.0 ).sub( 1.0 );

		if ( scaleNode !== null ) {

			normalMap = vec3( normalMap.xy.mul( scaleNode ), normalMap.z );

		}

		let outputNode = null;

		if ( normalMapType === ObjectSpaceNormalMap ) {

			outputNode = transformNormalToView( normalMap );

		} else if ( normalMapType === TangentSpaceNormalMap ) {

			const tangent = builder.hasGeometryAttribute( 'tangent' );

			if ( tangent === true ) {

				outputNode = TBNViewMatrix.mul( normalMap ).normalize();

			} else {

				outputNode = perturbNormal2Arb( {
					eye_pos: positionView,
					surf_norm: normalView,
					mapN: normalMap,
					uv: uv()
				} );

			}

		}

		return outputNode;

	}

}

export default NormalMapNode;

/**
 * TSL function for creating a normal map node.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} node - Represents the normal map data.
 * @param {?Node<vec2>} [scaleNode=null] - Controls the intensity of the effect.
 * @returns {NormalMapNode}
 */
export const normalMap = /*@__PURE__*/ nodeProxy( NormalMapNode );
