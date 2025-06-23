import TempNode from '../core/TempNode.js';

import { normalView, transformNormalToView } from '../accessors/Normal.js';
import { TBNViewMatrix } from '../accessors/AccessorsUtils.js';
import { nodeProxy, vec3 } from '../tsl/TSLBase.js';

import { TangentSpaceNormalMap, ObjectSpaceNormalMap } from '../../constants.js';
import { directionToFaceDirection } from './FrontFacingNode.js';

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

	setup( { material } ) {

		const { normalMapType, scaleNode } = this;

		let normalMap = this.node.mul( 2.0 ).sub( 1.0 );

		if ( scaleNode !== null ) {

			let scale = scaleNode;

			if ( material.flatShading === true ) {

				scale = directionToFaceDirection( scale );

			}

			normalMap = vec3( normalMap.xy.mul( scale ), normalMap.z );

		}

		let output = null;

		if ( normalMapType === ObjectSpaceNormalMap ) {

			output = transformNormalToView( normalMap );

		} else if ( normalMapType === TangentSpaceNormalMap ) {

			output = TBNViewMatrix.mul( normalMap ).normalize();

		} else {

			console.error( `THREE.NodeMaterial: Unsupported normal map type: ${ normalMapType }` );

			output = normalView; // Fallback to default normal view

		}

		return output;

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
export const normalMap = /*@__PURE__*/ nodeProxy( NormalMapNode ).setParameterLength( 1, 2 );
