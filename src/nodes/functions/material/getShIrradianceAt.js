import { Fn } from '../../tsl/TSLBase.js';
import { sphericalHarmonicsIrradianceAt } from './SphericalHarmonics.js';

const getShIrradianceAt = /*@__PURE__*/ Fn( ( [ normal, shCoefficients ] ) => {

	// normal is assumed to have unit length

	return sphericalHarmonicsIrradianceAt(
		normal,
		shCoefficients.element( 0 ),
		shCoefficients.element( 1 ),
		shCoefficients.element( 2 ),
		shCoefficients.element( 3 ),
		shCoefficients.element( 4 ),
		shCoefficients.element( 5 ),
		shCoefficients.element( 6 ),
		shCoefficients.element( 7 ),
		shCoefficients.element( 8 )
	);

} );

export default getShIrradianceAt;
