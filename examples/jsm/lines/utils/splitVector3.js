import { splitDouble } from './splitDouble.js';

/**
 * Splits a Vector3 into high and low precision components.
 * @param {import('three').Vector3} v
 * @param {import('three').Vector3} high
 * @param {import('three').Vector3} low
 */
export function splitVector3( v, high, low ) {

	const [ hx, lx ] = splitDouble( v.x );
	const [ hy, ly ] = splitDouble( v.y );
	const [ hz, lz ] = splitDouble( v.z );

	high.set( hx, hy, hz );
	low.set( lx, ly, lz );

}
