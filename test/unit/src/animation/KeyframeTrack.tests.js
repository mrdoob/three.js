import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';

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

		QUnit.test( 'trim preserves Bezier interpolation', ( assert ) => {

			for ( const TrackType of [ NumberKeyframeTrack, VectorKeyframeTrack ] ) {

				const stride = TrackType === NumberKeyframeTrack ? 1 : 3;
				const values = [], inTangents = [], outTangents = [];

				for ( const time of [ 0, 1, 2, 3 ] ) {

					for ( let component = 0; component < stride; component ++ ) {

						const value = time * time * ( component + 1 );
						values.push( value );
						inTangents.push( time - 0.25, value );
						outTangents.push( time + 0.25, value );

					}

				}

				const source = new TrackType( '.value', [ 0, 1, 2, 3 ], values, InterpolateBezier );
				source.settings = {
					inTangents: new Float32Array( inTangents ),
					outTangents: new Float32Array( outTangents )
				};
				const trimmed = source.clone().trim( 1, 2 );
				const expected = source.createInterpolant();
				const actual = trimmed.createInterpolant();

				assert.deepEqual( Array.from( trimmed.times ), [ 1, 2 ], 'Keeps the selected keyframes.' );
				assert.strictEqual( trimmed.settings.inTangents.length, 4 * stride, 'Keeps matching incoming control points.' );
				assert.strictEqual( trimmed.settings.outTangents.length, 4 * stride, 'Keeps matching outgoing control points.' );

				for ( const time of [ 1, 1.25, 1.5, 1.75, 2 ] ) {

					assert.deepEqual( actual.evaluate( time ), expected.evaluate( time ), `Preserves the curve at t=${time} for stride=${stride}.` );

				}

				const single = source.clone().trim( 5, 6 );
				assert.strictEqual( single.settings.inTangents.length, 2 * stride, 'An empty range retains one keyframe and its tangents.' );
				assert.deepEqual( single.createInterpolant().evaluate( 5 ), expected.evaluate( 3 ), 'The retained keyframe has its original value.' );
				assert.deepEqual( Array.from( source.settings.inTangents ), inTangents, 'Does not change the source tangents.' );

			}

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

	} );

} );
