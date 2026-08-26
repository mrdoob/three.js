import {
	convertArray,
	isTypedArray,
	getKeyframeOrder,
	sortedArray,
	flattenJSON,
	subclip,
	makeClipAdditive,
	AnimationUtils
} from '../../../../src/animation/AnimationUtils.js';

import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { QuaternionKeyframeTrack } from '../../../../src/animation/tracks/QuaternionKeyframeTrack.js';
import { BooleanKeyframeTrack } from '../../../../src/animation/tracks/BooleanKeyframeTrack.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { AdditiveAnimationBlendMode, NormalAnimationBlendMode } from '../../../../src/constants.js';

// `assert.numEqual` compares with a fixed absolute tolerance of 0.1, which is
// far wider than float32 rounding error. Quantities below use this instead so a
// small numerical regression cannot slip through -- for unit quaternions in
// particular, a 0.1 component tolerance would admit roughly 50 degrees of
// rotation error.
function closeTo( assert, actual, expected, message, eps = 1e-5 ) {

	assert.ok(
		Math.abs( actual - expected ) < eps,
		`${ message } (expected ${ expected }, got ${ actual }, tolerance ${ eps })`
	);

}

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationUtils', () => {

		// convertArray
		QUnit.test( 'convertArray - converts a plain array to a typed array', ( assert ) => {

			const result = convertArray( [ 1, 2, 3 ], Float32Array );

			assert.ok( result instanceof Float32Array, 'the result has the requested type' );
			assert.deepEqual( Array.from( result ), [ 1, 2, 3 ], 'the values are preserved' );

		} );

		QUnit.test( 'convertArray - converts a typed array back to a plain array', ( assert ) => {

			// `Array` has no BYTES_PER_ELEMENT, which selects the slice path.
			const result = convertArray( new Float32Array( [ 1, 2, 3 ] ), Array );

			assert.ok( Array.isArray( result ), 'the result is a plain Array' );
			assert.deepEqual( result, [ 1, 2, 3 ], 'the values are preserved' );

		} );

		QUnit.test( 'convertArray - returns the input untouched when it already has the target type', ( assert ) => {

			const typed = new Float32Array( [ 1, 2 ] );
			const plain = [ 1, 2 ];

			assert.strictEqual( convertArray( typed, Float32Array ), typed, 'a matching typed array is passed through by reference' );
			assert.strictEqual( convertArray( plain, Array ), plain, 'a matching plain array is passed through by reference' );

		} );

		QUnit.test( 'convertArray - passes falsy input through', ( assert ) => {

			assert.strictEqual( convertArray( undefined, Float32Array ), undefined, 'undefined is returned as-is' );
			assert.strictEqual( convertArray( null, Float32Array ), null, 'null is returned as-is' );

		} );

		QUnit.test( 'convertArray - narrows values when converting to a smaller type', ( assert ) => {

			const result = convertArray( [ 1.9, - 2.7 ], Int16Array );

			assert.ok( result instanceof Int16Array, 'the result has the requested type' );
			assert.deepEqual( Array.from( result ), [ 1, - 2 ], 'values are truncated toward zero by the typed array' );

		} );

		// isTypedArray
		QUnit.test( 'isTypedArray - distinguishes typed arrays from plain arrays', ( assert ) => {

			assert.strictEqual( isTypedArray( new Float32Array( 1 ) ), true, 'Float32Array is a typed array' );
			assert.strictEqual( isTypedArray( new Uint8Array( 1 ) ), true, 'Uint8Array is a typed array' );
			assert.strictEqual( isTypedArray( [ 1, 2, 3 ] ), false, 'a plain Array is not a typed array' );
			assert.strictEqual( isTypedArray( 'abc' ), false, 'a string is not a typed array' );
			assert.strictEqual( isTypedArray( undefined ), false, 'undefined is not a typed array' );

		} );

		// getKeyframeOrder
		QUnit.test( 'getKeyframeOrder - returns indices that sort the times ascending', ( assert ) => {

			const times = [ 3, 1, 2, 0 ];
			const order = getKeyframeOrder( times );

			assert.deepEqual( order, [ 3, 1, 2, 0 ], 'the order indexes the times from smallest to largest' );
			assert.deepEqual( order.map( i => times[ i ] ), [ 0, 1, 2, 3 ], 'applying the order sorts the times' );

		} );

		QUnit.test( 'getKeyframeOrder - returns the identity for already-sorted times', ( assert ) => {

			assert.deepEqual( getKeyframeOrder( [ 0, 1, 2, 3 ] ), [ 0, 1, 2, 3 ], 'sorted input needs no reordering' );

		} );

		QUnit.test( 'getKeyframeOrder - handles empty and single-element input', ( assert ) => {

			assert.deepEqual( getKeyframeOrder( [] ), [], 'no times produce no order' );
			assert.deepEqual( getKeyframeOrder( [ 7 ] ), [ 0 ], 'a single time produces a single index' );

		} );

		QUnit.test( 'getKeyframeOrder - does not modify the input array', ( assert ) => {

			const times = [ 3, 1, 2 ];
			getKeyframeOrder( times );

			assert.deepEqual( times, [ 3, 1, 2 ], 'the caller\'s times array is left untouched' );

		} );

		// sortedArray
		QUnit.test( 'sortedArray - reorders values in blocks of `stride`', ( assert ) => {

			// Three 2-component values, reordered as 2, 0, 1.
			const values = [ 10, 11, 20, 21, 30, 31 ];
			const result = sortedArray( values, 2, [ 2, 0, 1 ] );

			assert.deepEqual( Array.from( result ), [ 30, 31, 10, 11, 20, 21 ], 'each stride-sized block moves as a unit' );

		} );

		QUnit.test( 'sortedArray - preserves the input array type', ( assert ) => {

			const values = new Float32Array( [ 1, 2, 3 ] );
			const result = sortedArray( values, 1, [ 2, 1, 0 ] );

			assert.ok( result instanceof Float32Array, 'a typed array in yields the same typed array out' );
			assert.deepEqual( Array.from( result ), [ 3, 2, 1 ], 'the values are reversed' );

		} );

		QUnit.test( 'sortedArray - composes with getKeyframeOrder to sort keyframes', ( assert ) => {

			// The pair is always used together: derive the order from the times,
			// then apply it to the strided values.
			const times = [ 2, 0, 1 ];
			const values = [ 20, 21, 22, 0, 1, 2, 10, 11, 12 ];

			const order = getKeyframeOrder( times );

			assert.deepEqual( Array.from( sortedArray( times, 1, order ) ), [ 0, 1, 2 ], 'times end up ascending' );
			assert.deepEqual(
				Array.from( sortedArray( values, 3, order ) ),
				[ 0, 1, 2, 10, 11, 12, 20, 21, 22 ],
				'values follow their times'
			);

		} );

		QUnit.test( 'sortedArray - does not modify the input array', ( assert ) => {

			const values = [ 1, 2, 3 ];
			sortedArray( values, 1, [ 2, 1, 0 ] );

			assert.deepEqual( values, [ 1, 2, 3 ], 'the caller\'s values array is left untouched' );

		} );

		// flattenJSON
		QUnit.test( 'flattenJSON - flattens scalar keys', ( assert ) => {

			const times = [], values = [];

			flattenJSON( [ { time: 0, x: 1 }, { time: 1, x: 2 } ], times, values, 'x' );

			assert.deepEqual( times, [ 0, 1 ], 'times are collected' );
			assert.deepEqual( values, [ 1, 2 ], 'scalar values are pushed as-is' );

		} );

		QUnit.test( 'flattenJSON - spreads array-valued keys', ( assert ) => {

			const times = [], values = [];

			flattenJSON( [ { time: 0, pos: [ 1, 2, 3 ] }, { time: 1, pos: [ 4, 5, 6 ] } ], times, values, 'pos' );

			assert.deepEqual( times, [ 0, 1 ], 'times are collected' );
			assert.deepEqual( values, [ 1, 2, 3, 4, 5, 6 ], 'array values are flattened in order' );

		} );

		QUnit.test( 'flattenJSON - uses toArray() for math-object keys', ( assert ) => {

			const times = [], values = [];

			flattenJSON(
				[ { time: 0, pos: new Vector3( 1, 2, 3 ) }, { time: 2, pos: new Vector3( 4, 5, 6 ) } ],
				times, values, 'pos'
			);

			assert.deepEqual( times, [ 0, 2 ], 'times are collected' );
			assert.deepEqual( values, [ 1, 2, 3, 4, 5, 6 ], 'each object is written through toArray()' );

		} );

		QUnit.test( 'flattenJSON - skips leading keys that lack the property', ( assert ) => {

			// The format of the value is decided by the first key that has one,
			// so leading keys without it must not break the type detection.
			const times = [], values = [];

			flattenJSON( [ { time: 0 }, { time: 1, x: 5 }, { time: 2, x: 6 } ], times, values, 'x' );

			assert.deepEqual( times, [ 1, 2 ], 'the key without the property is not recorded' );
			assert.deepEqual( values, [ 5, 6 ], 'only keys carrying the property contribute values' );

		} );

		QUnit.test( 'flattenJSON - skips interior keys that lack the property', ( assert ) => {

			const times = [], values = [];

			flattenJSON( [ { time: 0, x: 1 }, { time: 1 }, { time: 2, x: 3 } ], times, values, 'x' );

			assert.deepEqual( times, [ 0, 2 ], 'the gap is skipped rather than filled' );
			assert.deepEqual( values, [ 1, 3 ], 'times and values stay in step' );

		} );

		QUnit.test( 'flattenJSON - writes nothing when no key carries the property', ( assert ) => {

			const times = [], values = [];

			flattenJSON( [ { time: 0 }, { time: 1 } ], times, values, 'x' );

			assert.deepEqual( times, [], 'no times are collected' );
			assert.deepEqual( values, [], 'no values are collected' );

		} );

		QUnit.test( 'flattenJSON - writes nothing for an empty key list', ( assert ) => {

			const times = [], values = [];

			flattenJSON( [], times, values, 'x' );

			assert.deepEqual( times, [], 'no times are collected' );
			assert.deepEqual( values, [], 'no values are collected' );

		} );

		QUnit.test( 'flattenJSON - appends to arrays that already hold data', ( assert ) => {

			const times = [ - 1 ], values = [ 99 ];

			flattenJSON( [ { time: 0, x: 1 } ], times, values, 'x' );

			assert.deepEqual( times, [ - 1, 0 ], 'existing times are kept' );
			assert.deepEqual( values, [ 99, 1 ], 'existing values are kept' );

		} );

		// subclip
		QUnit.test( 'subclip - keeps only keyframes inside [startFrame, endFrame)', ( assert ) => {

			// One keyframe per frame at 30 fps, values 0..4 on x.
			const track = new VectorKeyframeTrack(
				'.position',
				[ 0 / 30, 1 / 30, 2 / 30, 3 / 30, 4 / 30 ],
				[ 0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0 ]
			);

			const clip = subclip( new AnimationClip( 'source', - 1, [ track ] ), 'sub', 1, 4 );

			assert.strictEqual( clip.name, 'sub', 'the new clip takes the given name' );
			assert.strictEqual( clip.tracks.length, 1, 'the track survives' );
			assert.strictEqual( clip.tracks[ 0 ].times.length, 3, 'frames 1, 2 and 3 are kept -- endFrame is exclusive' );
			assert.deepEqual(
				Array.from( clip.tracks[ 0 ].values ),
				[ 1, 0, 0, 2, 0, 0, 3, 0, 0 ],
				'the values of the kept frames come along'
			);

		} );

		QUnit.test( 'subclip - shifts the result so it starts at t = 0', ( assert ) => {

			// Deliberately built at 1 fps rather than 30. At 30 fps every value
			// this test asserts (0, 1/30, 1/30) is smaller than the 0.1 tolerance
			// `assert.numEqual` uses, so the assertions would hold even if the
			// shift were removed entirely. Whole-second keyframes put the
			// expected values well clear of any tolerance, and the tight epsilon
			// below means dropping `track.shift()` from subclip fails this test.
			const track = new VectorKeyframeTrack(
				'.position',
				[ 0, 1, 2, 3 ],
				[ 0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0 ]
			);

			const clip = subclip( new AnimationClip( 'source', - 1, [ track ] ), 'sub', 2, 4, 1 );

			assert.strictEqual( clip.tracks[ 0 ].times.length, 2, 'frames 2 and 3 are kept' );

			closeTo( assert, clip.tracks[ 0 ].times[ 0 ], 0, 'the first kept keyframe lands on t = 0' );
			closeTo( assert, clip.tracks[ 0 ].times[ 1 ], 1, 'relative spacing is preserved' );
			closeTo( assert, clip.duration, 1, 'the duration is recomputed from the trimmed tracks' );

			// Negative control: the unshifted keyframe times would be 2 and 3, so
			// the assertions above genuinely distinguish shifted from unshifted.
			assert.notStrictEqual( clip.tracks[ 0 ].times[ 0 ], 2, 'the result is not simply the untouched source times' );

		} );

		QUnit.test( 'subclip - honours a custom fps', ( assert ) => {

			// At 60 fps the same times map to twice the frame numbers, so a
			// [1, 3) frame window selects the keyframes at t = 1/60 and 2/60.
			const track = new VectorKeyframeTrack(
				'.position',
				[ 0 / 60, 1 / 60, 2 / 60, 3 / 60 ],
				[ 0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0 ]
			);

			const clip = subclip( new AnimationClip( 'source', - 1, [ track ] ), 'sub', 1, 3, 60 );

			assert.strictEqual( clip.tracks[ 0 ].times.length, 2, 'two keyframes fall inside the window at 60 fps' );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ 1, 0, 0, 2, 0, 0 ], 'the expected frames are kept' );

		} );

		QUnit.test( 'subclip - drops tracks with no keyframes in range', ( assert ) => {

			const inRange = new VectorKeyframeTrack( '.position', [ 1 / 30 ], [ 1, 0, 0 ] );
			const outOfRange = new VectorKeyframeTrack( '.scale', [ 9 / 30 ], [ 9, 0, 0 ] );

			const clip = subclip( new AnimationClip( 'source', - 1, [ inRange, outOfRange ] ), 'sub', 0, 3 );

			assert.strictEqual( clip.tracks.length, 1, 'the empty track is removed entirely' );
			assert.strictEqual( clip.tracks[ 0 ].name, '.position', 'the track that had data in range is the one kept' );

		} );

		QUnit.test( 'subclip - does not modify the source clip', ( assert ) => {

			const track = new VectorKeyframeTrack(
				'.position',
				[ 0 / 30, 1 / 30, 2 / 30 ],
				[ 0, 0, 0, 1, 0, 0, 2, 0, 0 ]
			);
			const source = new AnimationClip( 'source', - 1, [ track ] );

			subclip( source, 'sub', 1, 2 );

			assert.strictEqual( source.name, 'source', 'the source keeps its name' );
			assert.strictEqual( source.tracks.length, 1, 'the source keeps its tracks' );
			assert.strictEqual( source.tracks[ 0 ].times.length, 3, 'the source track keeps all of its keyframes' );

		} );

		// makeClipAdditive
		QUnit.test( 'makeClipAdditive - sets the additive blend mode', ( assert ) => {

			const track = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 1, 1, 1, 2, 2, 2 ] );
			const clip = new AnimationClip( 'clip', - 1, [ track ] );

			assert.strictEqual( clip.blendMode, NormalAnimationBlendMode, 'clips start out in normal blend mode' );

			const result = makeClipAdditive( clip );

			assert.strictEqual( result, clip, 'the clip is converted in place and returned' );
			assert.strictEqual( clip.blendMode, AdditiveAnimationBlendMode, 'the blend mode switches to additive' );

		} );

		QUnit.test( 'makeClipAdditive - subtracts the reference frame from every numeric keyframe', ( assert ) => {

			const track = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 1, 1, 1, 2, 2, 2 ] );

			makeClipAdditive( new AnimationClip( 'clip', - 1, [ track ] ) );

			// referenceFrame 0 -> the values at t = 0 (1, 1, 1) are the baseline.
			assert.deepEqual( Array.from( track.values ), [ 0, 0, 0, 1, 1, 1 ], 'values become relative to frame 0' );

		} );

		QUnit.test( 'makeClipAdditive - clamps a reference frame past the last keyframe', ( assert ) => {

			const track = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 1, 1, 1, 5, 5, 5 ] );

			// Frame 300 at 30 fps is t = 10, well beyond the 1s clip -- the last
			// keyframe is used rather than extrapolating.
			makeClipAdditive( new AnimationClip( 'clip', - 1, [ track ] ), 300 );

			assert.deepEqual( Array.from( track.values ), [ - 4, - 4, - 4, 0, 0, 0 ], 'values become relative to the last frame' );

		} );

		QUnit.test( 'makeClipAdditive - interpolates a reference frame between keyframes', ( assert ) => {

			const track = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 0, 0, 0, 10, 10, 10 ] );

			// Frame 15 at 30 fps is t = 0.5, halfway along -- the baseline is 5.
			makeClipAdditive( new AnimationClip( 'clip', - 1, [ track ] ), 15 );

			assert.deepEqual( Array.from( track.values ), [ - 5, - 5, - 5, 5, 5, 5 ], 'the baseline is the interpolated value' );

		} );

		QUnit.test( 'makeClipAdditive - falls back to 30 fps for a non-positive fps', ( assert ) => {

			const atZero = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 0, 0, 0, 10, 10, 10 ] );
			const atThirty = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 0, 0, 0, 10, 10, 10 ] );

			makeClipAdditive( new AnimationClip( 'a', - 1, [ atZero ] ), 15, undefined, 0 );
			makeClipAdditive( new AnimationClip( 'b', - 1, [ atThirty ] ), 15, undefined, 30 );

			assert.deepEqual( Array.from( atZero.values ), Array.from( atThirty.values ), 'fps = 0 behaves like fps = 30' );

		} );

		QUnit.test( 'makeClipAdditive - multiplies by the conjugate for quaternion tracks', ( assert ) => {

			const reference = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), Math.PI / 4 );
			const second = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), Math.PI / 2 );

			const track = new QuaternionKeyframeTrack( '.quaternion', [ 0, 1 ], [ ...reference.toArray(), ...second.toArray() ] );

			makeClipAdditive( new AnimationClip( 'clip', - 1, [ track ] ) );

			// Track values are stored as Float32Array, so compare component-wise
			// rather than using the exact Quaternion.equals(). The epsilon is
			// tight on purpose: at the 0.1 tolerance `assert.numEqual` uses, a w
			// component within 0.1 of 1 still admits a rotation error of roughly
			// 50 degrees, so a visibly wrong result would pass.
			const identity = new Quaternion().toArray();
			for ( let i = 0; i < 4; i ++ ) {

				closeTo( assert, track.values[ i ], identity[ i ], `the reference keyframe becomes the identity rotation (component ${ i })` );

			}

			// Both rotations are about Y, so 45 degrees of the original 90 remain.
			const expected = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), Math.PI / 4 ).toArray();
			for ( let i = 0; i < 4; i ++ ) {

				closeTo( assert, track.values[ 4 + i ], expected[ i ], `the later keyframe holds the rotation relative to the reference (component ${ i })` );

			}

		} );

		QUnit.test( 'makeClipAdditive - applies the conjugate on the left for quaternion tracks', ( assert ) => {

			// Quaternion multiplication does not commute, so with rotations about
			// different axes the result pins down the operand order: the track
			// value becomes conjugate(reference) * value, not the other way round.
			const reference = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), Math.PI / 3 );
			const second = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), Math.PI / 2 );

			const track = new QuaternionKeyframeTrack( '.quaternion', [ 0, 1 ], [ ...reference.toArray(), ...second.toArray() ] );

			makeClipAdditive( new AnimationClip( 'clip', - 1, [ track ] ) );

			const conjugateOnTheLeft = reference.clone().conjugate().multiply( second ).toArray();
			const theOtherOrder = second.clone().multiply( reference.clone().conjugate() ).toArray();

			for ( let i = 0; i < 4; i ++ ) {

				closeTo( assert, track.values[ 4 + i ], conjugateOnTheLeft[ i ], `component ${ i } matches conjugate(reference) * value` );

			}

			// The two orders genuinely differ for these axes, so the assertions
			// above are actually discriminating between them rather than passing
			// on a case where multiplication happens to commute.
			assert.ok(
				conjugateOnTheLeft.some( ( v, i ) => Math.abs( v - theOtherOrder[ i ] ) > 0.1 ),
				'the two operand orders produce measurably different quaternions for these axes'
			);

		} );

		QUnit.test( 'makeClipAdditive - leaves non-numeric tracks alone', ( assert ) => {

			const track = new BooleanKeyframeTrack( '.visible', [ 0, 1 ], [ true, false ] );

			makeClipAdditive( new AnimationClip( 'clip', - 1, [ track ] ) );

			assert.deepEqual( Array.from( track.values ), [ true, false ], 'boolean track values are untouched' );

		} );

		QUnit.test( 'makeClipAdditive - only touches target tracks matching a reference track', ( assert ) => {

			const referenceTrack = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 1, 1, 1, 2, 2, 2 ] );
			const referenceClip = new AnimationClip( 'reference', - 1, [ referenceTrack ] );

			const matching = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 5, 5, 5, 6, 6, 6 ] );
			const unmatched = new VectorKeyframeTrack( '.scale', [ 0, 1 ], [ 7, 7, 7, 8, 8, 8 ] );
			const targetClip = new AnimationClip( 'target', - 1, [ matching, unmatched ] );

			makeClipAdditive( targetClip, 0, referenceClip );

			assert.deepEqual( Array.from( matching.values ), [ 4, 4, 4, 5, 5, 5 ], 'the matching track is made relative to the reference clip' );
			assert.deepEqual( Array.from( unmatched.values ), [ 7, 7, 7, 8, 8, 8 ], 'a track with no counterpart is left unchanged' );

		} );

		// AnimationUtils facade
		QUnit.test( 'AnimationUtils - static methods delegate to the module functions', ( assert ) => {

			// The class is a thin facade kept for backwards compatibility; these
			// checks guard against a method being wired to the wrong function.
			assert.deepEqual(
				Array.from( AnimationUtils.convertArray( [ 1, 2 ], Float32Array ) ),
				[ 1, 2 ],
				'convertArray'
			);
			assert.strictEqual( AnimationUtils.isTypedArray( new Float32Array( 1 ) ), true, 'isTypedArray' );
			assert.deepEqual( AnimationUtils.getKeyframeOrder( [ 2, 1 ] ), [ 1, 0 ], 'getKeyframeOrder' );
			assert.deepEqual( Array.from( AnimationUtils.sortedArray( [ 2, 1 ], 1, [ 1, 0 ] ) ), [ 1, 2 ], 'sortedArray' );

			const times = [], values = [];
			AnimationUtils.flattenJSON( [ { time: 0, x: 1 } ], times, values, 'x' );
			assert.deepEqual( [ times, values ], [[ 0 ], [ 1 ]], 'flattenJSON' );

			const subTrack = new VectorKeyframeTrack( '.position', [ 0 / 30, 1 / 30 ], [ 0, 0, 0, 1, 0, 0 ] );
			assert.strictEqual(
				AnimationUtils.subclip( new AnimationClip( 'source', - 1, [ subTrack ] ), 'sub', 0, 1 ).name,
				'sub',
				'subclip'
			);

			const additiveTrack = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 1, 1, 1, 2, 2, 2 ] );
			assert.strictEqual(
				AnimationUtils.makeClipAdditive( new AnimationClip( 'clip', - 1, [ additiveTrack ] ) ).blendMode,
				AdditiveAnimationBlendMode,
				'makeClipAdditive'
			);

		} );

	} );

} );
