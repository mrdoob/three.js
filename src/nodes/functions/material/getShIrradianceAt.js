import { Fn, mul } from '../../tsl/TSLBase.js';

const getShIrradianceAt = /*@__PURE__*/ Fn( ( [ normal, shCoefficients ] ) => {

	// normal is assumed to have unit length

	const x = normal.x, y = normal.y, z = normal.z;

	// band 0
	let result = shCoefficients.element( 0 ).mul( 0.886227 );

	// band 1
	result = result.add( shCoefficients.element( 1 ).mul( 2.0 * 0.511664 ).mul( y ) );
	result = result.add( shCoefficients.element( 2 ).mul( 2.0 * 0.511664 ).mul( z ) );
	result = result.add( shCoefficients.element( 3 ).mul( 2.0 * 0.511664 ).mul( x ) );

	// band 2
	result = result.add( shCoefficients.element( 4 ).mul( 2.0 * 0.429043 ).mul( x ).mul( y ) );
	result = result.add( shCoefficients.element( 5 ).mul( 2.0 * 0.429043 ).mul( y ).mul( z ) );
	result = result.add( shCoefficients.element( 6 ).mul( z.mul( z ).mul( 0.743125 ).sub( 0.247708 ) ) );
	result = result.add( shCoefficients.element( 7 ).mul( 2.0 * 0.429043 ).mul( x ).mul( z ) );
	result = result.add( shCoefficients.element( 8 ).mul( 0.429043 ).mul( mul( x, x ).sub( mul( y, y ) ) ) );

	return result;

} );

export default getShIrradianceAt;
