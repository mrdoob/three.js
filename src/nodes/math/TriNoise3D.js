// https://github.com/cabbibo/glsl-tri-noise-3d

import { Loop } from '../utils/LoopNode.js';
import { float, vec3, Fn } from '../tsl/TSLBase.js';

const tri = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return x.fract().sub( .5 ).abs();

} ).setLayout( {
	name: 'tri',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

const tri3 = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return vec3( tri( p.z.add( tri( p.y.mul( 1. ) ) ) ), tri( p.z.add( tri( p.x.mul( 1. ) ) ) ), tri( p.y.add( tri( p.x.mul( 1. ) ) ) ) );

} ).setLayout( {
	name: 'tri3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

/**
 * Generates a noise value from the given position, speed and time parameters.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} position - The position.
 * @param {Node<float>} speed - The speed.
 * @param {Node<float>} time - The time.
 * @return {Node<float>} The generated noise.
 */
export const triNoise3D = /*@__PURE__*/ Fn( ( [ position, speed, time ] ) => {

	const p = vec3( position ).toVar();
	const z = float( 1.4 ).toVar();
	const rz = float( 0.0 ).toVar();
	const bp = vec3( p ).toVar();

	Loop( { start: float( 0.0 ), end: float( 3.0 ), type: 'float', condition: '<=' }, () => {

		const dg = vec3( tri3( bp.mul( 2.0 ) ) ).toVar();
		p.addAssign( dg.add( time.mul( float( 0.1 ).mul( speed ) ) ) );
		bp.mulAssign( 1.8 );
		z.mulAssign( 1.5 );
		p.mulAssign( 1.2 );

		const t = float( tri( p.z.add( tri( p.x.add( tri( p.y ) ) ) ) ) ).toVar();
		rz.addAssign( t.div( z ) );
		bp.addAssign( 0.14 );

	} );

	return rz;

} ).setLayout( {
	name: 'triNoise3D',
	type: 'float',
	inputs: [
		{ name: 'position', type: 'vec3' },
		{ name: 'speed', type: 'float' },
		{ name: 'time', type: 'float' }
	]
} );
