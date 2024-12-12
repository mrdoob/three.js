import TempNode from '../core/TempNode.js';
import { uv } from '../accessors/UV.js';
import { normalView } from '../accessors/Normal.js';
import { positionView } from '../accessors/Position.js';
import { faceDirection } from './FrontFacingNode.js';
import { Fn, nodeProxy, float, vec2 } from '../tsl/TSLBase.js';

/** @module BumpMapNode **/

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

const dHdxy_fwd = Fn( ( { textureNode, bumpScale } ) => {

	// It's used to preserve the same TextureNode instance
	const sampleTexture = ( callback ) => textureNode.cache().context( { getUV: ( texNode ) => callback( texNode.uvNode || uv() ), forceUVContext: true } );

	const Hll = float( sampleTexture( ( uvNode ) => uvNode ) );

	return vec2(
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdx() ) ) ).sub( Hll ),
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdy() ) ) ).sub( Hll )
	).mul( bumpScale );

} );

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

const perturbNormalArb = Fn( ( inputs ) => {

	const { surf_pos, surf_norm, dHdxy } = inputs;

	// normalize is done to ensure that the bump map looks the same regardless of the texture's scale
	const vSigmaX = surf_pos.dFdx().normalize();
	const vSigmaY = surf_pos.dFdy().normalize();
	const vN = surf_norm; // normalized

	const R1 = vSigmaY.cross( vN );
	const R2 = vN.cross( vSigmaX );

	const fDet = vSigmaX.dot( R1 ).mul( faceDirection );

	const vGrad = fDet.sign().mul( dHdxy.x.mul( R1 ).add( dHdxy.y.mul( R2 ) ) );

	return fDet.abs().mul( surf_norm ).sub( vGrad ).normalize();

} );

/**
 * This class can be used for applying bump maps to materials.
 *
 * ```js
 * material.normalNode = bumpMap( texture( bumpTex ) );
 * ```
 *
 * @augments TempNode
 */
class BumpMapNode extends TempNode {

	static get type() {

		return 'BumpMapNode';

	}

	/**
	 * Constructs a new bump map node.
	 *
	 * @param {Node} textureNode - Represents the bump map data.
	 * @param {Node?} [scaleNode=null] - Controls the intensity of the bump effect.
	 */
	constructor( textureNode, scaleNode = null ) {

		super( 'vec3' );

		/**
		 * Represents the bump map data.
		 *
		 * @type {Node}
		 */
		this.textureNode = textureNode;

		/**
		 * Controls the intensity of the bump effect.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.scaleNode = scaleNode;

	}

	setup() {

		const bumpScale = this.scaleNode !== null ? this.scaleNode : 1;
		const dHdxy = dHdxy_fwd( { textureNode: this.textureNode, bumpScale } );

		return perturbNormalArb( {
			surf_pos: positionView,
			surf_norm: normalView,
			dHdxy
		} );

	}

}

export default BumpMapNode;

/**
 * TSL function for creating a bump map node.
 *
 * @function
 * @param {Node} textureNode - Represents the bump map data.
 * @param {Node?} [scaleNode=null] - Controls the intensity of the bump effect.
 * @returns {BumpMapNode}
 */
export const bumpMap = /*@__PURE__*/ nodeProxy( BumpMapNode );
