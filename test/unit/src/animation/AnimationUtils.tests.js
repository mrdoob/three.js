import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { makeClipAdditive } from '../../../../src/animation/AnimationUtils.js';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { AdditiveAnimationBlendMode, InterpolateBezier } from '../../../../src/constants.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationUtils', () => {

		QUnit.test( 'makeClipAdditive translates scalar Bezier control points', ( assert ) => {

			const track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 2, 4 ], InterpolateBezier );
			track.settings = {
				inTangents: new Float32Array( [ 0, 2, 0.75, 4 ] ),
				outTangents: new Float32Array( [ 0.25, 2, 1, 4 ] )
			};

			const original = track.clone();
			const before = original.createInterpolant();
			const reference = before.evaluate( 0.5 )[ 0 ];
			const clip = new AnimationClip( 'opacity', 1, [ track ] );

			assert.strictEqual( makeClipAdditive( clip, 15 ), clip );
			assert.strictEqual( clip.blendMode, AdditiveAnimationBlendMode );
			assert.smartEqual( track.times, original.times, 'Keyframe times are unchanged.' );
			assert.smartEqual( Array.from( track.settings.inTangents ), [ 0, - 1, 0.75, 1 ] );
			assert.smartEqual( Array.from( track.settings.outTangents ), [ 0.25, - 1, 1, 1 ] );

			const after = track.createInterpolant();

			for ( const time of [ 0, 0.25, 0.5, 0.75, 1 ] ) {

				assert.ok( Math.abs( after.evaluate( time )[ 0 ] - ( before.evaluate( time )[ 0 ] - reference ) ) < 1e-6, `Curve is relative to the reference at ${time}.` );

			}

		} );

		QUnit.test( 'makeClipAdditive translates each component using a separate reference clip', ( assert ) => {

			const track = new VectorKeyframeTrack( '.position', [ 0, 1 ], [ 2, 4, 6, 8, 10, 12 ], InterpolateBezier );
			track.settings = {
				inTangents: [ 0, 2, 0, 4, 0, 6, 0.75, 8, 0.75, 10, 0.75, 12 ],
				outTangents: [ 0.25, 2, 0.25, 4, 0.25, 6, 1, 8, 1, 10, 1, 12 ]
			};

			const original = track.clone();
			const referenceTrack = new VectorKeyframeTrack( '.position', [ 0 ], [ 1, 2, 3 ] );
			const referenceClip = new AnimationClip( 'reference', 1, [ referenceTrack ] );
			makeClipAdditive( new AnimationClip( 'position', 1, [ track ] ), 0, referenceClip );

			assert.smartEqual( Array.from( referenceTrack.values ), [ 1, 2, 3 ], 'The separate reference track is unchanged.' );

			const before = original.createInterpolant();
			const after = track.createInterpolant();

			for ( const time of [ 0, 0.25, 0.5, 0.75, 1 ] ) {

				const expected = Array.from( before.evaluate( time ), ( value, i ) => value - referenceTrack.values[ i ] );
				const actual = after.evaluate( time );

				for ( let i = 0; i < 3; i ++ ) {

					assert.ok( Math.abs( actual[ i ] - expected[ i ] ) < 1e-6, `Component ${i} is relative to the reference at ${time}.` );

				}

			}

			for ( const key of [ 'inTangents', 'outTangents' ] ) {

				for ( let i = 0; i < track.settings[ key ].length; i += 2 ) {

					assert.strictEqual( track.settings[ key ][ i ], original.settings[ key ][ i ], 'Control point times are unchanged.' );

				}

			}

		} );

	} );

} );
