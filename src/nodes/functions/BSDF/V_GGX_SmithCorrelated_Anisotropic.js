import { div } from '../../math/OperatorNode.js';
import { Fn, vec3 } from '../../tsl/TSLBase.js';

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf

const V_GGX_SmithCorrelated_Anisotropic = /*@__PURE__*/ Fn( ( { alphaT, alphaB, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL } ) => {

	const gv = dotNL.mul( vec3( alphaT.mul( dotTV ), alphaB.mul( dotBV ), dotNV ).length() );
	const gl = dotNV.mul( vec3( alphaT.mul( dotTL ), alphaB.mul( dotBL ), dotNL ).length() );
	const v = div( 0.5, gv.add( gl ) );

	return v.saturate();

} ).setLayout( {
	name: 'V_GGX_SmithCorrelated_Anisotropic',
	type: 'float',
	inputs: [
		{ name: 'alphaT', type: 'float', qualifier: 'in' },
		{ name: 'alphaB', type: 'float', qualifier: 'in' },
		{ name: 'dotTV', type: 'float', qualifier: 'in' },
		{ name: 'dotBV', type: 'float', qualifier: 'in' },
		{ name: 'dotTL', type: 'float', qualifier: 'in' },
		{ name: 'dotBL', type: 'float', qualifier: 'in' },
		{ name: 'dotNV', type: 'float', qualifier: 'in' },
		{ name: 'dotNL', type: 'float', qualifier: 'in' }
	]
} );

export default V_GGX_SmithCorrelated_Anisotropic;
