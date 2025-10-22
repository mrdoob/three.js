import BRDF_GGX from './BRDF_GGX.js';
import DFGApprox from './DFGApprox.js';
import { normalView } from '../../accessors/Normal.js';
import { positionViewDirection } from '../../accessors/Position.js';
import { Fn, float } from '../../tsl/TSLBase.js';

// GGX BRDF with multi-scattering energy compensation for direct lighting
// Based on "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// by Fdez-Agüera: http://www.jcgt.org/published/0008/01/03/
const BRDF_GGX_Multiscatter = /*@__PURE__*/ Fn( ( { lightDirection, f0, f90, roughness: _roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } ) => {

	// Single-scattering BRDF (standard GGX)
	const singleScatter = BRDF_GGX( { lightDirection, f0, f90, roughness: _roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } );

	// Multi-scattering compensation using Fdez-Agüera's approximation
	const dotNV = normalView.dot( positionViewDirection ).clamp();
	const fab = DFGApprox( { roughness: _roughness, dotNV } );

	const FssEss = f0.mul( fab.x ).add( f90.mul( fab.y ) );
	const Ess = fab.x.add( fab.y );
	const Ems = float( 1.0 ).sub( Ess );

	const Favg = f0.add( f0.oneMinus().mul( 0.047619 ) ); // 1/21
	const Fms = FssEss.mul( Favg ).div( float( 1.0 ).sub( Ems.mul( Favg ) ) );

	// Add multi-scattering contribution
	const multiScatter = Fms.mul( Ems );

	return singleScatter.add( multiScatter );

} );

export default BRDF_GGX_Multiscatter;
