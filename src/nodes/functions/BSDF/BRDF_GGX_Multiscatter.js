import BRDF_GGX from './BRDF_GGX.js';
import DFGLUT from './DFGLUT.js';
import { normalView } from '../../accessors/Normal.js';
import { positionViewDirection } from '../../accessors/Position.js';
import { Fn } from '../../tsl/TSLBase.js';

// GGX BRDF with multi-scattering energy compensation for direct lighting
// Based on "Practical Multiple Scattering Compensation for Microfacet Models"
// https://blog.selfshadow.com/publications/turquin/ms_comp_final.pdf
const BRDF_GGX_Multiscatter = /*@__PURE__*/ Fn( ( { lightDirection, viewDirection = positionViewDirection, f0, f90, roughness: _roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } ) => {

	// Single-scattering BRDF (standard GGX)
	const singleScatter = BRDF_GGX( { lightDirection, viewDirection, f0, f90, roughness: _roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } );

	const dotNV = normalView.dot( viewDirection ).clamp();

	const fab = DFGLUT( { roughness: _roughness, dotNV } );

	// Energy of the single-scattering lobe in a white furnace ( F0 = F90 = 1 )
	const Ess = fab.x.add( fab.y );

	// Compensate for the energy lost to multiple scattering, tinting the added term by F0 ( equation 16 )
	const energyCompensation = f0.mul( Ess.reciprocal().sub( 1.0 ) ).add( 1.0 );

	return singleScatter.mul( energyCompensation );

} );

export default BRDF_GGX_Multiscatter;
