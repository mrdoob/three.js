import DFGLUT from './DFGLUT.js';
import { Fn } from '../../tsl/TSLBase.js';

const EnvironmentBRDF = /*@__PURE__*/ Fn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGLUT( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multi-scattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
export const EnvironmentBRDF_MultiScattering = /*@__PURE__*/ Fn( ( { specularColor, specularF90, dfg } ) => {

	const FssEss = specularColor.mul( dfg.x ).add( specularF90.mul( dfg.y ) );

	const Ess = dfg.x.add( dfg.y );
	const Ems = Ess.oneMinus();

	const Favg = specularColor.add( specularColor.oneMinus().mul( 0.047619 ) ); // 1/21
	const Fms = FssEss.mul( Favg ).div( Ems.mul( Favg ).oneMinus() );

	return FssEss.add( Fms.mul( Ems ) );

}, { specularColor: 'vec3', specularF90: 'float', dfg: 'vec2', return: 'vec3' } );

export default EnvironmentBRDF;
