import { Fn, float, vec3 } from '../../tsl/TSLBase.js';

const RECIPROCAL_PI = /*@__PURE__*/ float( 1 / Math.PI );

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf

const D_GGX_Anisotropic = /*@__PURE__*/ Fn( ( { alphaT, alphaB, dotNH, dotTH, dotBH } ) => {

	const a2 = alphaT.mul( alphaB );
	const v = vec3( alphaB.mul( dotTH ), alphaT.mul( dotBH ), a2.mul( dotNH ) );
	const v2 = v.dot( v );
	const w2 = a2.div( v2 );

	return RECIPROCAL_PI.mul( a2.mul( w2.pow2() ) );

}, {
	alphaT: 'float',
	alphaB: 'float',
	dotNH: 'float',
	dotTH: 'float',
	dotBH: 'float',
	return: 'float'
} );

export default D_GGX_Anisotropic;
