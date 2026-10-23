import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { AnimationClip } from '../../../../src/animation/AnimationClip.js';

import { KeyframeTrack } from '../../../../src/animation/KeyframeTrack.js';
import { InterpolateBezier } from '../../../../src/constants.js';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'KeyframeTrack', () => {

		const parameters = {
			name: '.material.opacity',
			times: [ 0, 1 ],
			values: [ 0, 0.5 ],
			interpolation: NumberKeyframeTrack.DefaultInterpolation
		};

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values );
			assert.strictEqual(
				object instanceof KeyframeTrack, true,
				'NumberKeyframeTrack extends from KeyframeTrack'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// name, times, values
			const object = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values );
			assert.ok( object, 'Can instantiate a NumberKeyframeTrack.' );

			// name, times, values, interpolation
			const object_all = new NumberKeyframeTrack( parameters.name, parameters.times, parameters.values, parameters.interpolation );
			assert.ok( object_all, 'Can instantiate a NumberKeyframeTrack with name, times, values, interpolation.' );

		} );

		// PROPERTIES

		// PROPERTIES - PROTOTYPE

		// PUBLIC

		QUnit.test( 'shift', ( assert ) => {

			const track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, 1 ], InterpolateBezier );
			track.settings = {
				inTangents: new Float32Array( [ - 0.5, 0, 0.5, 1 ] ),
				outTangents: new Float32Array( [ 0.5, 0, 1.5, 1 ] )
			};

			track.shift( 2 );

			assert.smartEqual( Array.from( track.settings.inTangents ), [ 1.5, 0, 2.5, 1 ] );
			assert.smartEqual( Array.from( track.settings.outTangents ), [ 2.5, 0, 3.5, 1 ] );
			assert.strictEqual( track.createInterpolant().evaluate( 2.5 )[ 0 ], 0.5, 'Shifted curve keeps its shape.' );

		} );

		QUnit.test( 'validate', ( assert ) => {

			const validTrack = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, 0.5 ] );
			const invalidTrack = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, NaN ] );

			assert.ok( validTrack.validate() );

			console.level = CONSOLE_LEVEL.OFF;
			assert.notOk( invalidTrack.validate() );
			console.level = CONSOLE_LEVEL.DEFAULT;

		} );

		QUnit.test( 'optimize', ( assert ) => {

			const track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2, 3, 4 ], [ 0, 0, 0, 0, 1 ] );

			assert.equal( track.values.length, 5 );

			track.optimize();

			assert.smartEqual( Array.from( track.times ), [ 0, 3, 4 ] );
			assert.smartEqual( Array.from( track.values ), [ 0, 0, 1 ] );

		} );

		QUnit.test( 'optimize preserves Bezier curves with equal keyframe values', ( assert ) => {

			const track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2 ], [ 0, 0, 0 ], InterpolateBezier );
			track.settings = {
				inTangents: new Float32Array( [ 0, 0, 0.75, 1, 1.75, - 1 ] ),
				outTangents: new Float32Array( [ 0.25, 1, 1.25, - 1, 2, 0 ] )
			};

			const original = track.clone();
			const clip = new AnimationClip( 'opacity', 2, [ track ] );
			clip.optimize();

			assert.smartEqual( track.times, original.times, 'Equal values do not imply redundant Bezier keys.' );
			assert.smartEqual( track.values, original.values );
			assert.smartEqual( track.settings.inTangents, original.settings.inTangents );
			assert.smartEqual( track.settings.outTangents, original.settings.outTangents );

			const before = original.createInterpolant();
			const after = track.createInterpolant();

			for ( const time of [ 0.25, 0.5, 0.75, 1.25, 1.5, 1.75 ] ) {

				assert.smartEqual( after.evaluate( time ), before.evaluate( time ), `Curve is unchanged at ${time}.` );

			}

		} );

		QUnit.test( 'optimize preserves Bezier tangent alignment at duplicate times', ( assert ) => {

			const track = new VectorKeyframeTrack( '.position', [ 0, 1, 1, 2 ], [ 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ], InterpolateBezier );
			track.settings = { inTangents: [], outTangents: [] };

			for ( let i = 0; i < track.times.length; i ++ ) {

				for ( let j = 0; j < 3; j ++ ) {

					track.settings.inTangents.push( track.times[ i ] - 0.25, track.values[ i * 3 + j ] - 1 );
					track.settings.outTangents.push( track.times[ i ] + 0.25, track.values[ i * 3 + j ] + 1 );

				}

			}

			const original = track.clone();
			assert.strictEqual( track.optimize(), track, 'Returns the original track.' );
			assert.smartEqual( track.times, original.times );
			assert.smartEqual( track.settings.inTangents, original.settings.inTangents );
			assert.smartEqual( track.settings.outTangents, original.settings.outTangents );

			const before = original.createInterpolant();
			const after = track.createInterpolant();

			for ( const time of [ 0.5, 1, 1.5 ] ) {

				assert.smartEqual( after.evaluate( time ), before.evaluate( time ), `All components are unchanged at ${time}.` );

			}

		} );

	} );

} );
