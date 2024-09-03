// https://github.com/cabbibo/glsl-tri-noise-3d

import { Loop } from '../utils/LoopNode.js';
import { float, vec3, Fn } from '../tsl/TSLBase.js';

export const tri = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return x.fract().sub( .5 ).abs();

} ).setLayout( {
	name: 'tri',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' }
	]
} );

export const tri3 = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return vec3( tri( p.z.add( tri( p.y.mul( 1. ) ) ) ), tri( p.z.add( tri( p.x.mul( 1. ) ) ) ), tri( p.y.add( tri( p.x.mul( 1. ) ) ) ) );

} ).setLayout( {
	name: 'tri3',
	type: 'vec3',
	inputs: [
		{ name: 'p', type: 'vec3' }
	]
} );

export const triNoise3D = /*@__PURE__*/ Fn( ( [ p_immutable, spd, time ] ) => {

	const p = vec3( p_immutable ).toVar();
	const z = float( 1.4 ).toVar();
	const rz = float( 0.0 ).toVar();
	const bp = vec3( p ).toVar();

	Loop( { start: float( 0.0 ), end: float( 3.0 ), type: 'float', condition: '<=' }, () => {

		const dg = vec3( tri3( bp.mul( 2.0 ) ) ).toVar();
		p.addAssign( dg.add( time.mul( float( 0.1 ).mul( spd ) ) ) );
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
		{ name: 'p', type: 'vec3' },
		{ name: 'spd', type: 'float' },
		{ name: 'time', type: 'float' }
	]
} );
