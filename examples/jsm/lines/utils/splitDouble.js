export function splitDouble( value ) {

	const high = Math.fround( value );
	const low = value - high;

	return [ high, low ];

}
