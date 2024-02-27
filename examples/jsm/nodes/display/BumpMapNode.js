import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { uv } from '../accessors/UVNode.js';
import { normalView } from '../accessors/NormalNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { faceDirection } from './FrontFacingNode.js';
import { addNodeElement, tslFn, nodeProxy, float, vec2 } from '../shadernode/ShaderNode.js';

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

const dHdxy_fwd = tslFn( ( { textureNode, bumpScale } ) => {

	let texNode = textureNode;

	if ( texNode.isTextureNode !== true ) {

		texNode.traverse( ( node ) => {

			if ( node.isTextureNode === true ) texNode = node;

		} );

	}

	if ( texNode.isTextureNode !== true ) {

		throw new Error( 'THREE.TSL: dHdxy_fwd() requires a TextureNode.' );

	}

	const Hll = float( textureNode );
	const uvNode = texNode.uvNode || uv();

	// It's used to preserve the same TextureNode instance
	const sampleTexture = ( uv ) => textureNode.cache().context( { getUV: () => uv, forceUVContext: true } );

	return vec2(
		float( sampleTexture( uvNode.add( uvNode.dFdx() ) ) ).sub( Hll ),
		float( sampleTexture( uvNode.add( uvNode.dFdy() ) ) ).sub( Hll )
	).mul( bumpScale );

} );

const perturbNormalArb = tslFn( ( inputs ) => {

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

class BumpMapNode extends TempNode {

	constructor( textureNode, scaleNode = null ) {

		super( 'vec3' );

		this.textureNode = textureNode;
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

export const bumpMap = nodeProxy( BumpMapNode );

addNodeElement( 'bumpMap', bumpMap );

addNodeClass( 'BumpMapNode', BumpMapNode );
