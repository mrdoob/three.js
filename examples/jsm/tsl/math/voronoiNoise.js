import { Fn, Loop, dot, float, fract, int, min, sin, vec2, vec3, TWO_PI } from 'three/tsl';

/**
 * @module VoronoiNoise
 * @three_import import { voronoi, voronoi3d } from 'three/addons/tsl/math/voronoiNoise.js';
 */

/**
 * Generates a pseudo-random vec2 from the given coordinate.
 *
 * Reference: {@link https://www.shadertoy.com/view/MslGD8}.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} p - The input coordinate.
 * @return {Node<vec2>} A pseudo-random value in the range `[0, 1]`.
 */
export const hash2 = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return fract( sin( vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) ) ).mul( 18.5453 ) );

}, { p: 'vec2', return: 'vec2' } );

/**
 * Animated 2D Voronoi noise. The feature points orbit inside their cells so the
 * resulting pattern morphs over time.
 *
 * Reference: {@link https://www.shadertoy.com/view/MslGD8}.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} p - The input coordinate.
 * @param {Node<float>} time - The animation time.
 * @return {Node<float>} The squared distance to the closest feature point, roughly in the range `[0, 1]`.
 */
export const voronoi = /*@__PURE__*/ Fn( ( [ p, time ] ) => {

	const n = p.floor().toConst();
	const f = p.fract().toConst();
	const minDist = float( 8 ).toVar();

	Loop( { start: int( - 1 ), end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: int( - 1 ), end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const g = vec2( float( x ), float( y ) ).toConst();
			const o = hash2( n.add( g ) ).toConst();
			const r = g.sub( f ).add( sin( time.add( o.mul( TWO_PI ) ) ).mul( 0.5 ).add( 0.5 ) );

			minDist.assign( min( minDist, dot( r, r ) ) );

		} );

	} );

	return minDist;

}, { p: 'vec2', time: 'float', return: 'float' } );

/**
 * Generates a pseudo-random vec3 from the given coordinate.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} p - The input coordinate.
 * @return {Node<vec3>} A pseudo-random value in the range `[0, 1]`.
 */
export const hash3 = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return fract( sin( vec3( dot( p, vec3( 127.1, 311.7, 74.7 ) ), dot( p, vec3( 269.5, 183.3, 246.1 ) ), dot( p, vec3( 113.5, 271.9, 124.6 ) ) ) ).mul( 18.5453 ) );

}, { p: 'vec3', return: 'vec3' } );

/**
 * Animated 3D Voronoi noise. Like {@link voronoi} but with a volumetric input
 * coordinate so the pattern can be applied to arbitrary surfaces without
 * projection artifacts. Evaluates 27 cells instead of 9 and is therefore
 * considerably more expensive than the 2D version.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} p - The input coordinate.
 * @param {Node<float>} time - The animation time.
 * @return {Node<float>} The squared distance to the closest feature point, roughly in the range `[0, 1]`.
 */
export const voronoi3d = /*@__PURE__*/ Fn( ( [ p, time ] ) => {

	const n = p.floor().toConst();
	const f = p.fract().toConst();
	const minDist = float( 8 ).toVar();

	Loop( { start: int( - 1 ), end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: int( - 1 ), end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: int( - 1 ), end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const g = vec3( float( x ), float( y ), float( z ) ).toConst();
				const o = hash3( n.add( g ) ).toConst();
				const r = g.sub( f ).add( sin( time.add( o.mul( TWO_PI ) ) ).mul( 0.5 ).add( 0.5 ) );

				minDist.assign( min( minDist, dot( r, r ) ) );

			} );

		} );

	} );

	return minDist;

}, { p: 'vec3', time: 'float', return: 'float' } );
