import BRDF_GGX from './BRDF_GGX.js';
import DFGApprox from './DFGApprox.js';
import { normalView } from '../../accessors/Normal.js';
import { positionViewDirection } from '../../accessors/Position.js';
import { EPSILON } from '../../math/MathNode.js';
import { Fn, float } from '../../tsl/TSLBase.js';

// GGX BRDF with multi-scattering energy compensation for direct lighting
// This provides more accurate energy conservation, especially for rough materials
// Based on "Practical Multiple Scattering Compensation for Microfacet Models"
// https://blog.selfshadow.com/publications/turquin/ms_comp_final.pdf
const BRDF_GGX_Multiscatter = /*@__PURE__*/ Fn( ( { lightDirection, f0, f90, roughness: _roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } ) => {

	// Single-scattering BRDF (standard GGX)
	const singleScatter = BRDF_GGX( { lightDirection, f0, f90, roughness: _roughness, f, USE_IRIDESCENCE, USE_ANISOTROPY } );

	// Multi-scattering compensation
	const dotNL = normalView.dot( lightDirection ).clamp();
	const dotNV = normalView.dot( positionViewDirection ).clamp();

	// Precomputed DFG values for view and light directions
	const dfgV = DFGApprox( { roughness: _roughness, dotNV } );
	const dfgL = DFGApprox( { roughness: _roughness, dotNV: dotNL } );

	// Single-scattering energy for view and light
	const FssEss_V = f0.mul( dfgV.x ).add( f90.mul( dfgV.y ) );
	const FssEss_L = f0.mul( dfgL.x ).add( f90.mul( dfgL.y ) );

	const Ess_V = dfgV.x.add( dfgV.y );
	const Ess_L = dfgL.x.add( dfgL.y );

	// Energy lost to multiple scattering
	const Ems_V = float( 1.0 ).sub( Ess_V );
	const Ems_L = float( 1.0 ).sub( Ess_L );

	// Average Fresnel reflectance
	const Favg = f0.add( f0.oneMinus().mul( 0.047619 ) ); // 1/21

	// Multiple scattering contribution
	// Uses geometric mean of view and light contributions for better energy distribution
	const Fms = FssEss_V.mul( FssEss_L ).mul( Favg ).div( float( 1.0 ).sub( Ems_V.mul( Ems_L ).mul( Favg ).mul( Favg ) ).add( EPSILON ) );

	// Energy compensation factor
	const compensationFactor = Ems_V.mul( Ems_L );

	const multiScatter = Fms.mul( compensationFactor );

	return singleScatter.add( multiScatter );

} );

export default BRDF_GGX_Multiscatter;
