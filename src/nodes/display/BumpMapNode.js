import Node from '../core/Node.js';
import { uv } from '../accessors/UV.js';
import { normalView } from '../accessors/Normal.js';
import { positionView } from '../accessors/Position.js';
import { modelViewMatrix } from '../accessors/ModelNode.js';
import { faceDirection } from './FrontFacingNode.js';
import { Fn, nodeProxy, float, vec2, mat3 } from '../tsl/TSLBase.js';

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

const dHdxy_fwd = /*@__PURE__*/ Fn( ( { textureNode, bumpScale } ) => {

	// It's used to preserve the same TextureNode instance
	const sampleTexture = ( callback ) => textureNode.isolate().context( { getUV: ( texNode ) => callback( texNode.uvNode || uv() ), forceUVContext: true } );

	const Hll = float( sampleTexture( ( uvNode ) => uvNode ) );

	return vec2(
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdx() ) ) ).sub( Hll ),
		float( sampleTexture( ( uvNode ) => uvNode.add( uvNode.dFdy() ) ) ).sub( Hll )
	).mul( bumpScale );

} );

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

const perturbNormalArb = /*@__PURE__*/ Fn( ( inputs ) => {

	const { surf_pos, surf_norm, objectToView, dHdxy } = inputs;

	// the surface derivatives are not normalized so the bump height keeps its units and the
	// slope stays the same at any view distance
	const vSigmaX = surf_pos.dFdx();
	const vSigmaY = surf_pos.dFdy();

	// the scale is a height in local units, so the surface is displaced along the local
	// normal carried to view space as a direction, which matches the displacement map
	const objectNormal = objectToView.transpose().mul( surf_norm ).toVar();
	const invLength = objectNormal.dot( objectNormal ).inverseSqrt().toVar();
	const vN = objectToView.mul( objectNormal ).mul( invLength ).toVar();

	const R1 = vSigmaY.cross( vN );
	const R2 = vN.cross( vSigmaX );

	const fDet = vSigmaX.dot( R1 ).mul( faceDirection );

	const vGrad = fDet.sign().mul( dHdxy.x.mul( R1 ).add( dHdxy.y.mul( R2 ) ) );

	return fDet.abs().mul( invLength ).mul( surf_norm ).sub( vGrad ).normalize();

} );

/**
 * This class can be used for applying bump maps to materials.
 *
 * ```js
 * material.normalNode = bumpMap( texture( bumpTex ) );
 * ```
 *
 * @augments Node
 */
class BumpMapNode extends Node {

	static get type() {

		return 'BumpMapNode';

	}

	/**
	 * Constructs a new bump map node.
	 *
	 * @param {Node<float>} textureNode - Represents the bump map data.
	 * @param {?Node<float>} [scaleNode=null] - Controls the intensity of the bump effect.
	 * @param {Node<vec3>} [normalNode=normalView] - The view-space normal to perturb.
	 */
	constructor( textureNode, scaleNode = null, normalNode = normalView ) {

		super( 'vec3' );

		/**
		 * Represents the bump map data.
		 *
		 * @type {Node<float>}
		 */
		this.textureNode = textureNode;

		/**
		 * Controls the intensity of the bump effect.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.scaleNode = scaleNode;

		/**
		 * The view-space normal to perturb.
		 *
		 * @type {Node<vec3>}
		 * @default normalView
		 */
		this.normalNode = normalNode;

	}

	setup( builder ) {

		// Screen-space derivatives are unreliable on thin lines, so the bump
		// effect is disabled for wireframe rendering.

		if ( builder.material.wireframe === true ) return this.normalNode;

		const bumpScale = this.scaleNode !== null ? this.scaleNode : 1;
		const dHdxy = dHdxy_fwd( { textureNode: this.textureNode, bumpScale } );

		// the complete local to view transform, including the instance and batch matrices
		let objectToView = mat3( modelViewMatrix );

		const { instanceMatrix, batchingMatrix } = builder.context.geometryTransforms || {};

		if ( instanceMatrix ) objectToView = objectToView.mul( mat3( instanceMatrix ) );
		if ( batchingMatrix ) objectToView = objectToView.mul( mat3( batchingMatrix ) );

		// matrices can't be varyings in WGSL, so the columns are passed on their own
		objectToView = mat3( objectToView[ 0 ].toVarying(), objectToView[ 1 ].toVarying(), objectToView[ 2 ].toVarying() );

		return perturbNormalArb( {
			surf_pos: positionView,
			surf_norm: this.normalNode,
			objectToView,
			dHdxy
		} );

	}

}

export default BumpMapNode;

/**
 * TSL function for creating a bump map node.
 *
 * @tsl
 * @function
 * @param {Node<float>} textureNode - Represents the bump map data.
 * @param {?Node<float>} [scaleNode=null] - Controls the intensity of the bump effect.
 * @param {Node<vec3>} [normalNode=normalView] - The view-space normal to perturb.
 * @returns {BumpMapNode}
 */
export const bumpMap = /*@__PURE__*/ nodeProxy( BumpMapNode ).setParameterLength( 1, 3 );
