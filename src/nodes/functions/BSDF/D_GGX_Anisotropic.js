import { tslFn, float, vec3 } from '../../shadernode/ShaderNode.js';

const RECIPROCAL_PI = float( 1 / Math.PI );

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf

const D_GGX_Anisotropic = tslFn( ( { alphaT, alphaB, dotNH, dotTH, dotBH } ) => {

	const a2 = alphaT.mul( alphaB );
	const v = vec3( alphaB.mul( dotTH ), alphaT.mul( dotBH ), a2.mul( dotNH ) );
	const v2 = v.dot( v );
	const w2 = a2.div( v2 );

	return RECIPROCAL_PI.mul( a2.mul( w2.pow2() ) );

} ).setLayout( {
	name: 'D_GGX_Anisotropic',
	type: 'float',
	inputs: [
		{ name: 'alphaT', type: 'float', qualifier: 'in' },
		{ name: 'alphaB', type: 'float', qualifier: 'in' },
		{ name: 'dotNH', type: 'float', qualifier: 'in' },
		{ name: 'dotTH', type: 'float', qualifier: 'in' },
		{ name: 'dotBH', type: 'float', qualifier: 'in' }
	]
} );

export default D_GGX_Anisotropic;
