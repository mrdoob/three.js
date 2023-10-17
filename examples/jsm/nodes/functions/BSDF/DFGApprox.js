import { tslFn, vec2, vec4 } from '../../shadernode/ShaderNode.js';

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
const DFGApprox = tslFn( ( { roughness, dotNV } ) => {

	const c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	const r = roughness.mul( c0 ).add( c1 );

	const a004 = r.x.mul( r.x ).min( dotNV.mul( - 9.28 ).exp2() ).mul( r.x ).add( r.y );

	const fab = vec2( - 1.04, 1.04 ).mul( a004 ).add( r.zw );

	return fab;

} ).setLayout( {
	name: 'DFGApprox',
	type: 'vec2',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'dotNV', type: 'vec3' }
	]
} );

export default DFGApprox;
