import { AnimationClip } from '../../../../src/animation/AnimationClip.js';

import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { InterpolateBezier } from '../../../../src/constants.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationClip', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const clip = new AnimationClip( 'clip1', 1000, [ {} ] );
			assert.ok( clip, 'AnimationClip can be instantiated' );

		} );

		// PROPERTIES
		QUnit.test( 'name', ( assert ) => {

			const clip = new AnimationClip( 'clip1', 1000, [ {} ] );
			assert.strictEqual(
				clip.name === 'clip1', true,
				'AnimationClip can be named'
			);

		} );

		// STATIC
		QUnit.test( 'parse', ( assert ) => {

			const track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, 10 ] );
			track.settings = {
				inTangents: new Float32Array( [ 0, 0, - 0.25, - 8 ] ),
				outTangents: new Float32Array( [ 0.25, 8, 0, 0 ] )
			};
			track.setInterpolation( InterpolateBezier );

			const clip = new AnimationClip( 'clip1', 1, [ track ] );
			const parsedClip = AnimationClip.parse( JSON.parse( JSON.stringify( AnimationClip.toJSON( clip ) ) ) );
			const parsedTrack = parsedClip.tracks[ 0 ];

			assert.smartEqual( Array.from( parsedTrack.settings.inTangents ), Array.from( track.settings.inTangents ) );
			assert.smartEqual( Array.from( parsedTrack.settings.outTangents ), Array.from( track.settings.outTangents ) );

			assert.equal(
				parsedTrack.createInterpolant().evaluate( 0.5 )[ 0 ],
				track.createInterpolant().evaluate( 0.5 )[ 0 ],
				'Bezier tangents survive a round trip'
			);

		} );

	} );

} );
