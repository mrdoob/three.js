import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { subclip } from '../../../../src/animation/AnimationUtils.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { InterpolateBezier } from '../../../../src/constants.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationUtils', () => {

		QUnit.test( 'subclip preserves Bezier interpolation', ( assert ) => {

			const source = new VectorKeyframeTrack( '.position', [ 0, 1, 2, 3 ], [
				0, 0, 0, 1, 2, 3, 4, 8, 12, 9, 18, 27
			], InterpolateBezier );
			source.settings = {
				inTangents: new Float32Array( [
					- 0.25, 0, - 0.25, 0, - 0.25, 0,
					0.75, 1, 0.75, 2, 0.75, 3,
					1.75, 4, 1.75, 8, 1.75, 12,
					2.75, 9, 2.75, 18, 2.75, 27
				] ),
				outTangents: new Float32Array( [
					0.25, 0, 0.25, 0, 0.25, 0,
					1.25, 1, 1.25, 2, 1.25, 3,
					2.25, 4, 2.25, 8, 2.25, 12,
					3.25, 9, 3.25, 18, 3.25, 27
				] )
			};
			const originalSettings = {
				inTangents: source.settings.inTangents.slice(),
				outTangents: source.settings.outTangents.slice()
			};
			const clip = new AnimationClip( 'source', - 1, [ source ] );
			const result = subclip( clip, 'trimmed', 30, 90, 30 );
			const track = result.tracks[ 0 ];
			const expected = source.createInterpolant();
			const actual = track.createInterpolant();

			assert.deepEqual( Array.from( track.times ), [ 0, 1 ], 'Shifts the selected keys to zero and excludes the end frame.' );
			assert.strictEqual( result.duration, 1, 'Updates the duration.' );
			assert.strictEqual( track.settings.inTangents.length, 12, 'Keeps the selected incoming control points.' );
			assert.strictEqual( track.settings.outTangents.length, 12, 'Keeps the selected outgoing control points.' );

			for ( const time of [ 0, 0.25, 0.5, 0.75, 1 ] ) {

				assert.deepEqual( actual.evaluate( time ), expected.evaluate( time + 1 ), `Preserves the curve at t=${time}.` );

			}

			assert.deepEqual( source.settings, originalSettings, 'Does not modify the source control points.' );
			assert.strictEqual( subclip( clip, 'empty', 120, 150, 30 ).tracks.length, 0, 'Still discards tracks with no selected keys.' );

		} );

	} );

} );
