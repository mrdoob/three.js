import {
	convertArray,
	isTypedArray,
	hasTangents,
	getKeyframeOrder,
	sortedArray,
	flattenJSON,
	subclip,
	makeClipAdditive,
	AnimationUtils
} from '../../../../src/animation/AnimationUtils.js';
import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { QuaternionKeyframeTrack } from '../../../../src/animation/tracks/QuaternionKeyframeTrack.js';
import { BooleanKeyframeTrack } from '../../../../src/animation/tracks/BooleanKeyframeTrack.js';
import { StringKeyframeTrack } from '../../../../src/animation/tracks/StringKeyframeTrack.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { AdditiveAnimationBlendMode, NormalAnimationBlendMode } from '../../../../src/constants.js';

const EPSILON = 1e-6;

function closeTo( actual, expected ) {

	if ( actual.length !== expected.length ) return false;

	for ( let i = 0; i < expected.length; i ++ ) {

		if ( Math.abs( actual[ i ] - expected[ i ] ) > EPSILON ) return false;

	}

	return true;

}

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationUtils', () => {

		// STATIC
		QUnit.test( 'AnimationUtils class mirrors the module functions', ( assert ) => {

			const array = [ 1, 2, 3 ];

			assert.deepEqual( AnimationUtils.convertArray( array, Float32Array ), convertArray( array, Float32Array ), 'convertArray' );
			assert.strictEqual( AnimationUtils.isTypedArray( new Float32Array( 1 ) ), isTypedArray( new Float32Array( 1 ) ), 'isTypedArray' );
			assert.strictEqual( AnimationUtils.hasTangents( {} ), hasTangents( {} ), 'hasTangents' );
			assert.deepEqual( AnimationUtils.getKeyframeOrder( [ 2, 1 ] ), getKeyframeOrder( [ 2, 1 ] ), 'getKeyframeOrder' );
			assert.deepEqual( AnimationUtils.sortedArray( [ 1, 2 ], 1, [ 1, 0 ] ), sortedArray( [ 1, 2 ], 1, [ 1, 0 ] ), 'sortedArray' );

			const times = [];
			const values = [];
			AnimationUtils.flattenJSON( [ { time: 0, value: 5 } ], times, values, 'value' );
			assert.deepEqual( [ times, values ], [[ 0 ], [ 5 ]], 'flattenJSON' );

		} );

		QUnit.test( 'convertArray', ( assert ) => {

			assert.strictEqual( convertArray( null, Float32Array ), null, 'null is returned unchanged' );
			assert.strictEqual( convertArray( undefined, Float32Array ), undefined, 'undefined is returned unchanged' );

			const typed = new Float32Array( [ 1, 2, 3 ] );
			assert.strictEqual( convertArray( typed, Float32Array ), typed, 'An array that already has the requested type is returned as is' );

			const plain = [ 1, 2, 3 ];
			assert.strictEqual( convertArray( plain, Array ), plain, 'A plain array requested as Array is returned as is' );

			const toTyped = convertArray( plain, Float32Array );
			assert.ok( toTyped instanceof Float32Array, 'A plain array can be converted to a typed array' );
			assert.deepEqual( Array.from( toTyped ), [ 1, 2, 3 ], 'The typed array has the same values' );

			const toPlain = convertArray( typed, Array );
			assert.ok( Array.isArray( toPlain ), 'A typed array can be converted to a plain array' );
			assert.deepEqual( toPlain, [ 1, 2, 3 ], 'The plain array has the same values' );

			const otherTyped = convertArray( typed, Uint8Array );
			assert.ok( otherTyped instanceof Uint8Array, 'A typed array can be converted to another typed array type' );
			assert.deepEqual( Array.from( otherTyped ), [ 1, 2, 3 ], 'The converted typed array has the same values' );

		} );

		QUnit.test( 'isTypedArray', ( assert ) => {

			assert.strictEqual( isTypedArray( new Float32Array( 2 ) ), true, 'Float32Array is a typed array' );
			assert.strictEqual( isTypedArray( new Uint8Array( 2 ) ), true, 'Uint8Array is a typed array' );
			assert.strictEqual( isTypedArray( [ 1, 2 ] ), false, 'A plain array is not a typed array' );
			assert.strictEqual( isTypedArray( new DataView( new ArrayBuffer( 4 ) ) ), false, 'A DataView is not a typed array' );
			assert.strictEqual( isTypedArray( {} ), false, 'An object is not a typed array' );

		} );

		QUnit.test( 'hasTangents', ( assert ) => {

			assert.strictEqual( hasTangents( undefined ), false, 'undefined settings have no tangents' );
			assert.strictEqual( hasTangents( {} ), false, 'Empty settings have no tangents' );
			assert.strictEqual( hasTangents( { inTangents: [ 0 ] } ), false, 'Only in-tangents are not enough' );
			assert.strictEqual( hasTangents( { outTangents: [ 0 ] } ), false, 'Only out-tangents are not enough' );
			assert.strictEqual( hasTangents( { inTangents: [ 0 ], outTangents: [ 0 ] } ), true, 'In- and out-tangents are required' );

		} );

		QUnit.test( 'getKeyframeOrder', ( assert ) => {

			assert.deepEqual( getKeyframeOrder( [ 3, 1, 2 ] ), [ 1, 2, 0 ], 'Returns the indices that sort the times ascending' );
			assert.deepEqual( getKeyframeOrder( [ 0, 1, 2 ] ), [ 0, 1, 2 ], 'Sorted times keep their order' );
			assert.deepEqual( getKeyframeOrder( [ 1, 1, 0 ] ), [ 2, 0, 1 ], 'Equal times keep their relative order' );
			assert.deepEqual( getKeyframeOrder( [] ), [], 'No times result in no order' );

			const times = new Float32Array( [ 2, 0, 1 ] );
			assert.deepEqual( getKeyframeOrder( times ), [ 1, 2, 0 ], 'Typed arrays are supported' );
			assert.deepEqual( Array.from( times ), [ 2, 0, 1 ], 'The times are not modified' );

		} );

		QUnit.test( 'sortedArray', ( assert ) => {

			const order = [ 2, 0, 1 ];

			assert.deepEqual( sortedArray( [ 10, 20, 30 ], 1, order ), [ 30, 10, 20 ], 'Reorders single values' );
			assert.deepEqual(
				sortedArray( [ 10, 11, 20, 21, 30, 31 ], 2, order ),
				[ 30, 31, 10, 11, 20, 21 ],
				'Moves whole value groups according to the stride'
			);

			const typed = new Float32Array( [ 10, 11, 20, 21 ] );
			const result = sortedArray( typed, 2, [ 1, 0 ] );
			assert.ok( result instanceof Float32Array, 'The result has the same type as the input' );
			assert.notStrictEqual( result, typed, 'The result is a new array' );
			assert.deepEqual( Array.from( result ), [ 20, 21, 10, 11 ], 'Typed arrays are reordered' );
			assert.deepEqual( Array.from( typed ), [ 10, 11, 20, 21 ], 'The input is not modified' );

		} );

		QUnit.test( 'flattenJSON', ( assert ) => {

			// array values
			let times = [];
			let values = [];
			flattenJSON( [ { time: 0, pos: [ 1, 2 ] }, { time: 1, pos: [ 3, 4 ] } ], times, values, 'pos' );
			assert.deepEqual( times, [ 0, 1 ], 'Array values: collects the key times' );
			assert.deepEqual( values, [ 1, 2, 3, 4 ], 'Array values: flattens the components' );

			// math-like values
			times = [];
			values = [];
			flattenJSON( [ { time: 0, value: new Vector3( 1, 2, 3 ) }, { time: 2, value: new Vector3( 4, 5, 6 ) } ], times, values, 'value' );
			assert.deepEqual( times, [ 0, 2 ], 'Math-like values: collects the key times' );
			assert.deepEqual( values, [ 1, 2, 3, 4, 5, 6 ], 'Math-like values: appends them via toArray()' );

			// scalar values
			times = [];
			values = [];
			flattenJSON( [ { time: 0, value: 5 }, { time: 1, value: 0 }, { time: 2, value: 7 } ], times, values, 'value' );
			assert.deepEqual( times, [ 0, 1, 2 ], 'Scalar values: collects the key times' );
			assert.deepEqual( values, [ 5, 0, 7 ], 'Scalar values: keeps falsy values' );

			// keys without the requested property
			times = [];
			values = [];
			flattenJSON( [ { time: 0 }, { time: 1, value: 7 } ], times, values, 'value' );
			assert.deepEqual( [ times, values ], [[ 1 ], [ 7 ]], 'Skips leading keys without the property' );

			times = [];
			values = [];
			flattenJSON( [ { time: 0, value: 1 }, { time: 1 }, { time: 2, value: 3 } ], times, values, 'value' );
			assert.deepEqual( [ times, values ], [[ 0, 2 ], [ 1, 3 ]], 'Skips later keys without the property' );

			// property name
			times = [];
			values = [];
			flattenJSON( [ { time: 0, value: 1, scale: 9 } ], times, values, 'scale' );
			assert.deepEqual( [ times, values ], [[ 0 ], [ 9 ]], 'Reads the requested property' );

			// no data
			times = [];
			values = [];
			flattenJSON( [], times, values, 'value' );
			flattenJSON( [ { time: 0 }, { time: 1 } ], times, values, 'value' );
			assert.deepEqual( [ times, values ], [[], []], 'Leaves the output untouched if no key has the property' );

		} );

		QUnit.test( 'subclip', ( assert ) => {

			const xTrack = new NumberKeyframeTrack( '.x', [ 0, 1, 2, 3 ], [ 0, 10, 20, 30 ] );
			const clip = new AnimationClip( 'source', - 1, [ xTrack ] );

			const sub = subclip( clip, 'sub', 1, 3, 1 );

			assert.notStrictEqual( sub, clip, 'Returns a new clip' );
			assert.strictEqual( sub.name, 'sub', 'The new clip has the requested name' );
			assert.strictEqual( sub.tracks.length, 1, 'The track is kept' );
			assert.deepEqual( Array.from( sub.tracks[ 0 ].times ), [ 0, 1 ], 'Keeps the start frame, excludes the end frame, and starts at t=0' );
			assert.deepEqual( Array.from( sub.tracks[ 0 ].values ), [ 10, 20 ], 'Keeps the matching values' );
			assert.strictEqual( sub.duration, 1, 'The duration is recomputed' );

			assert.strictEqual( clip.name, 'source', 'The source clip keeps its name' );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].times ), [ 0, 1, 2, 3 ], 'The source clip times are not modified' );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ 0, 10, 20, 30 ], 'The source clip values are not modified' );

		} );

		QUnit.test( 'subclip - fps', ( assert ) => {

			const track = new NumberKeyframeTrack( '.x', [ 0, 0.5, 1, 1.5 ], [ 0, 1, 2, 3 ] );
			const clip = new AnimationClip( 'source', - 1, [ track ] );

			// 2 fps: the keys sit on frames 0, 1, 2, 3
			const sub = subclip( clip, 'sub', 1, 3, 2 );

			assert.deepEqual( Array.from( sub.tracks[ 0 ].times ), [ 0, 0.5 ], 'Frames are converted to seconds with the given fps' );
			assert.deepEqual( Array.from( sub.tracks[ 0 ].values ), [ 1, 2 ], 'The matching values are kept' );

		} );

		QUnit.test( 'subclip - value size and multiple tracks', ( assert ) => {

			const position = new VectorKeyframeTrack( '.position', [ 0, 1, 2 ], [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
			const late = new NumberKeyframeTrack( '.y', [ 2, 3, 4 ], [ 20, 30, 40 ] );
			const outside = new NumberKeyframeTrack( '.z', [ 0, 0.5 ], [ 1, 2 ] );
			const clip = new AnimationClip( 'source', - 1, [ position, late, outside ] );

			const sub = subclip( clip, 'sub', 1, 4, 1 );

			assert.strictEqual( sub.tracks.length, 2, 'Tracks without keys in the range are dropped' );

			assert.strictEqual( sub.tracks[ 0 ].name, '.position', 'Track order is preserved' );
			assert.deepEqual( Array.from( sub.tracks[ 0 ].times ), [ 0, 1 ], 'The first track is shifted by the earliest remaining time' );
			assert.deepEqual( Array.from( sub.tracks[ 0 ].values ), [ 4, 5, 6, 7, 8, 9 ], 'All components of every key are copied' );

			assert.strictEqual( sub.tracks[ 1 ].name, '.y', 'The second track is kept' );
			assert.deepEqual( Array.from( sub.tracks[ 1 ].times ), [ 1, 2 ], 'All tracks are shifted by the same amount' );
			assert.deepEqual( Array.from( sub.tracks[ 1 ].values ), [ 20, 30 ], 'The second track keeps its values' );

			assert.strictEqual( sub.duration, 2, 'The duration covers the longest track' );

		} );

		QUnit.test( 'makeClipAdditive - numeric tracks', ( assert ) => {

			const clip = new AnimationClip( 'clip', - 1, [
				new NumberKeyframeTrack( '.x', [ 0, 1, 2 ], [ 1, 3, 6 ] )
			] );

			const result = makeClipAdditive( clip, 0, clip, 1 );

			assert.strictEqual( result, clip, 'Modifies and returns the target clip' );
			assert.strictEqual( clip.blendMode, AdditiveAnimationBlendMode, 'The blend mode is set to additive' );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ 0, 2, 5 ], 'Values are relative to the first frame' );

		} );

		QUnit.test( 'makeClipAdditive - reference frame', ( assert ) => {

			const create = () => new AnimationClip( 'clip', - 1, [
				new NumberKeyframeTrack( '.x', [ 0, 1, 2 ], [ 1, 3, 6 ] )
			] );

			let clip = makeClipAdditive( create(), 1, undefined, 1 );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ - 2, 0, 3 ], 'Uses the value at a keyframe' );

			clip = makeClipAdditive( create(), 0.5, undefined, 1 );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ - 1, 1, 4 ], 'Interpolates between keyframes' );

			clip = makeClipAdditive( create(), 10, undefined, 1 );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ - 5, - 3, 0 ], 'Uses the last keyframe for frames after the end' );

			clip = makeClipAdditive( create(), - 5, undefined, 1 );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ 0, 2, 5 ], 'Uses the first keyframe for frames before the start' );

			clip = makeClipAdditive( create(), 30, undefined, 0 );
			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ - 2, 0, 3 ], 'Falls back to 30 fps if the fps is not positive' );

		} );

		QUnit.test( 'makeClipAdditive - vector tracks', ( assert ) => {

			const clip = new AnimationClip( 'clip', - 1, [
				new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 1, 2, 3, 4, 6, 8 ] )
			] );

			makeClipAdditive( clip, 0, clip, 1 );

			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ 0, 0, 0, 3, 4, 5 ], 'Subtracts every component' );

		} );

		QUnit.test( 'makeClipAdditive - quaternion tracks', ( assert ) => {

			const yAxis = new Vector3( 0, 1, 0 );
			const q90 = new Quaternion().setFromAxisAngle( yAxis, Math.PI / 2 );
			const q180 = new Quaternion().setFromAxisAngle( yAxis, Math.PI );

			const clip = new AnimationClip( 'clip', - 1, [
				new QuaternionKeyframeTrack( '.quaternion', [ 0, 1 ], [ ...q90.toArray(), ...q180.toArray() ] )
			] );

			makeClipAdditive( clip, 0, clip, 1 );

			const values = Array.from( clip.tracks[ 0 ].values );
			const expected = new Quaternion().setFromAxisAngle( yAxis, Math.PI / 2 ).toArray();

			assert.ok( closeTo( values.slice( 0, 4 ), [ 0, 0, 0, 1 ] ), 'The reference frame becomes the identity rotation' );
			assert.ok( closeTo( values.slice( 4, 8 ), expected ), 'Later frames are rotations relative to the reference' );

		} );

		QUnit.test( 'makeClipAdditive - reference clip', ( assert ) => {

			const target = new AnimationClip( 'target', - 1, [
				new NumberKeyframeTrack( '.x', [ 0, 1 ], [ 12, 14 ] )
			] );
			const reference = new AnimationClip( 'reference', - 1, [
				new NumberKeyframeTrack( '.x', [ 0, 1 ], [ 10, 11 ] ),
				new NumberKeyframeTrack( '.unrelated', [ 0, 1 ], [ 5, 6 ] )
			] );

			makeClipAdditive( target, 0, reference, 1 );

			assert.deepEqual( Array.from( target.tracks[ 0 ].values ), [ 2, 4 ], 'Subtracts the values of the matching reference track' );
			assert.deepEqual( Array.from( reference.tracks[ 0 ].values ), [ 10, 11 ], 'The reference clip is not modified' );
			assert.strictEqual( reference.blendMode, NormalAnimationBlendMode, 'Only the target clip becomes additive' );

		} );

		QUnit.test( 'makeClipAdditive - skipped tracks', ( assert ) => {

			const clip = new AnimationClip( 'clip', - 1, [
				new BooleanKeyframeTrack( '.visible', [ 0, 1 ], [ true, false ] ),
				new StringKeyframeTrack( '.name', [ 0, 1 ], [ 'a', 'b' ] ),
				new NumberKeyframeTrack( '.x', [ 0, 1 ], [ 4, 5 ] )
			] );

			makeClipAdditive( clip, 0, clip, 1 );

			assert.deepEqual( Array.from( clip.tracks[ 0 ].values ), [ true, false ], 'Boolean tracks are left alone' );
			assert.deepEqual( Array.from( clip.tracks[ 1 ].values ), [ 'a', 'b' ], 'String tracks are left alone' );
			assert.deepEqual( Array.from( clip.tracks[ 2 ].values ), [ 0, 1 ], 'Numeric tracks are still processed' );

			const target = new AnimationClip( 'target', - 1, [ new NumberKeyframeTrack( '.x', [ 0, 1 ], [ 4, 5 ] ) ] );
			const mismatch = new AnimationClip( 'reference', - 1, [ new VectorKeyframeTrack( '.x', [ 0, 1 ], [ 1, 1, 1, 2, 2, 2 ] ) ] );

			makeClipAdditive( target, 0, mismatch, 1 );

			assert.deepEqual( Array.from( target.tracks[ 0 ].values ), [ 4, 5 ], 'Tracks are only matched if name and type are equal' );

		} );

	} );

} );
