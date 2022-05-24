import {
	ShaderNode, dotNV, vec2, vec4, add, mul, min, exp2
} from '../../shadernode/ShaderNodeElements.js';

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
const DFGApprox = new ShaderNode( ( inputs ) => {

	const { roughness } = inputs;

	const c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	const r = add( mul( roughness, c0 ), c1 );

	const a004 = add( mul( min( mul( r.x, r.x ), exp2( mul( - 9.28, dotNV ) ) ), r.x ), r.y );

	const fab = add( mul( vec2( - 1.04, 1.04 ), a004 ), r.zw );

	return fab;

} );

export default DFGApprox;
