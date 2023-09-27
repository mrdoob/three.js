import TempNode from '../core/TempNode.js';
import { texture } from '../accessors/TextureNode.js';
import { addNodeClass } from '../core/Node.js';
import { uv } from '../accessors/UVNode.js';
import { normalView } from '../accessors/NormalNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { faceDirection } from './FrontFacingNode.js';
import { tslFn, nodeProxy, vec2 } from '../shadernode/ShaderNode.js';

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

const dHdxy_fwd = tslFn( ( { bumpTexture, bumpScale } ) => {

	const uvNode = uv();

	const Hll = texture( bumpTexture, uvNode ).x;

	return vec2(
		texture( bumpTexture, uvNode.add( uvNode.dFdx() ) ).x.sub( Hll ),
		texture( bumpTexture, uvNode.add( uvNode.dFdy() ) ).x.sub( Hll )
	).mul( bumpScale );

} );

const perturbNormalArb = tslFn( ( inputs ) => {

	const { surf_pos, surf_norm, dHdxy } = inputs;

	const vSigmaX = surf_pos.dFdx();
	const vSigmaY = surf_pos.dFdy();
	const vN = surf_norm; // normalized

	const R1 = vSigmaY.cross( vN );
	const R2 = vN.cross( vSigmaX );

	const fDet = vSigmaX.dot( R1 ).mul( faceDirection );

	const vGrad = fDet.sign().mul( dHdxy.x.mul( R1 ).add( dHdxy.y.mul( R2 ) ) );

	return fDet.abs().mul( surf_norm ).sub( vGrad ).normalize();

} );

class BumpMapNode extends TempNode {

	constructor( texture, scaleNode = null ) {

		super( 'vec3' );

		this.texture = texture;
		this.scaleNode = scaleNode;

	}

	setup() {

		const bumpScale = this.scaleNode !== null ? this.scaleNode : 1;
		const dHdxy = dHdxy_fwd( { bumpTexture: this.texture, bumpScale } );

		return perturbNormalArb( {
			surf_pos: positionView.negate(),
			surf_norm: normalView,
			dHdxy
		} );

	}

}

export default BumpMapNode;

export const bumpMap = nodeProxy( BumpMapNode );

addNodeClass( 'BumpMapNode', BumpMapNode );
