import { div } from '../../math/OperatorNode.js';
import { EPSILON } from '../../math/MathNode.js';
import { Fn, vec3 } from '../../tsl/TSLBase.js';

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf

const V_GGX_SmithCorrelated_Anisotropic = /*@__PURE__*/ Fn( ( { alphaT, alphaB, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL } ) => {

	const gv = dotNL.mul( vec3( alphaT.mul( dotTV ), alphaB.mul( dotBV ), dotNV ).length() );
	const gl = dotNV.mul( vec3( alphaT.mul( dotTL ), alphaB.mul( dotBL ), dotNL ).length() );

	return div( 0.5, gv.add( gl ).max( EPSILON ) );

}, {
	alphaT: 'float',
	alphaB: 'float',
	dotTV: 'float',
	dotBV: 'float',
	dotTL: 'float',
	dotBL: 'float',
	dotNV: 'float',
	dotNL: 'float',
	return: 'float'
} );

export default V_GGX_SmithCorrelated_Anisotropic;
