import { normalView as NormalView } from '../../accessors/Normal.js';
import { positionViewDirection } from '../../accessors/Position.js';
import { Fn } from '../../tsl/TSLBase.js';

const EON_EPSILON = 1e-7;
const FON_A_COEFFICIENT = 0.5 - 2 / ( 3 * Math.PI );
const FON_AVERAGE_ALBEDO_COEFFICIENT = 2 / 3 - 28 / ( 15 * Math.PI );

const FON_DirectionalAlbedo = /*@__PURE__*/ Fn( ( { mu, roughness, A } ) => {

	const muComp = mu.oneMinus();
	const gOverPi = muComp.mul(
		muComp.mul(
			muComp.mul(
				muComp.mul( 0.0714429953 ).sub( 0.332181442 )
			).add( 0.491881867 )
		).add( 0.0571085289 )
	);

	return A.mul( roughness.mul( gOverPi ).add( 1.0 ) );

} );

// Portsmouth et al. 2025, "EON: A Practical Energy-Preserving Rough Diffuse BRDF"
// https://jcgt.org/published/0014/01/06/
const BRDF_EON = /*@__PURE__*/ Fn( ( { lightDirection, diffuseColor, roughness, normalView = NormalView, viewDirection = positionViewDirection } ) => {

	const rho = diffuseColor.clamp();
	const dotNL = normalView.dot( lightDirection ).clamp();
	const dotNV = normalView.dot( viewDirection ).clamp();
	const s = lightDirection.dot( viewDirection ).sub( dotNL.mul( dotNV ) );
	const sOverT = s.greaterThan( 0.0 ).select( s.div( dotNL.max( dotNV ).max( EON_EPSILON ) ), s );

	const A = roughness.mul( FON_A_COEFFICIENT ).add( 1.0 ).reciprocal();
	const singleScatter = rho.mul( 1 / Math.PI, A, roughness.mul( sOverT ).add( 1.0 ) );

	const averageAlbedo = A.mul( roughness.mul( FON_AVERAGE_ALBEDO_COEFFICIENT ).add( 1.0 ) );
	const albedoV = FON_DirectionalAlbedo( { mu: dotNV, roughness, A } );
	const albedoL = FON_DirectionalAlbedo( { mu: dotNL, roughness, A } );
	const rhoMultiScatter = rho.mul( rho, averageAlbedo ).div( rho.mul( averageAlbedo.oneMinus() ).oneMinus().max( EON_EPSILON ) );
	const multiScatter = rhoMultiScatter.mul(
		1 / Math.PI,
		albedoV.oneMinus().max( EON_EPSILON ),
		albedoL.oneMinus().max( EON_EPSILON )
	).div( averageAlbedo.oneMinus().max( EON_EPSILON ) );
	const eon = singleScatter.add( multiScatter );

	return roughness.lessThanEqual( EON_EPSILON ).select( rho.mul( 1 / Math.PI ), eon );

} );

export const EON_DirectionalAlbedo = /*@__PURE__*/ Fn( ( { diffuseColor, roughness, dotNV } ) => {

	const rho = diffuseColor.clamp();
	const A = roughness.mul( FON_A_COEFFICIENT ).add( 1.0 ).reciprocal();
	const directionalAlbedo = FON_DirectionalAlbedo( { mu: dotNV.clamp(), roughness, A } );
	const averageAlbedo = A.mul( roughness.mul( FON_AVERAGE_ALBEDO_COEFFICIENT ).add( 1.0 ) );
	const rhoMultiScatter = rho.mul( rho, averageAlbedo ).div( rho.mul( averageAlbedo.oneMinus() ).oneMinus().max( EON_EPSILON ) );
	const eonAlbedo = rho.mul( directionalAlbedo ).add( rhoMultiScatter.mul( directionalAlbedo.oneMinus() ) );

	return roughness.lessThanEqual( EON_EPSILON ).select( rho, eonAlbedo );

} );

export default BRDF_EON;
