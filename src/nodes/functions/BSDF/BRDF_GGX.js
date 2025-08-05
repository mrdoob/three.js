import F_Schlick from './F_Schlick.js';
import V_GGX_SmithCorrelated from './V_GGX_SmithCorrelated.js';
import V_GGX_SmithCorrelated_Anisotropic from './V_GGX_SmithCorrelated_Anisotropic.js';
import D_GGX from './D_GGX.js';
import D_GGX_Anisotropic from './D_GGX_Anisotropic.js';
import { normalView as NormalView } from '../../accessors/Normal.js';
import { positionViewDirection } from '../../accessors/Position.js';
import { iridescence, alphaT, anisotropyT, anisotropyB } from '../../core/PropertyNode.js';
import { Fn, defined } from '../../tsl/TSLBase.js';

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
const BRDF_GGX = /*@__PURE__*/ Fn( ( { lightDirection, f0, f90, roughness, f, normalView = NormalView, USE_IRIDESCENCE, USE_ANISOTROPY } ) => {

	const alpha = roughness.pow2(); // UE4's roughness

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNL = normalView.dot( lightDirection ).clamp();
	const dotNV = normalView.dot( positionViewDirection ).clamp(); // @ TODO: Move to core dotNV
	const dotNH = normalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	let F = F_Schlick( { f0, f90, dotVH } );
	let V, D;

	if ( defined( USE_IRIDESCENCE ) ) {

		F = iridescence.mix( F, f );

	}

	if ( defined( USE_ANISOTROPY ) ) {

		const dotTL = anisotropyT.dot( lightDirection );
		const dotTV = anisotropyT.dot( positionViewDirection );
		const dotTH = anisotropyT.dot( halfDir );
		const dotBL = anisotropyB.dot( lightDirection );
		const dotBV = anisotropyB.dot( positionViewDirection );
		const dotBH = anisotropyB.dot( halfDir );

		V = V_GGX_SmithCorrelated_Anisotropic( { alphaT, alphaB: alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL } );
		D = D_GGX_Anisotropic( { alphaT, alphaB: alpha, dotNH, dotTH, dotBH } );

	} else {

		V = V_GGX_SmithCorrelated( { alpha, dotNL, dotNV } );
		D = D_GGX( { alpha, dotNH } );

	}

	return F.mul( V ).mul( D );

} ); // validated

export default BRDF_GGX;
