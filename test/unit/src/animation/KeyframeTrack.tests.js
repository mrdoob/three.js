/* global QUnit */

import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';

import { KeyframeTrack } from '../../../../src/animation/KeyframeTrack.js';
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
		QUnit.todo( 'name', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'times', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'values', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PROPERTIES - PROTOTYPE
		QUnit.todo( 'TimeBufferType', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'ValueBufferType', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'DefaultInterpolation', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'toJSON', ( assert ) => {

			// static method toJSON
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'InterpolantFactoryMethodDiscrete', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'InterpolantFactoryMethodLinear', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'InterpolantFactoryMethodSmooth', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setInterpolation', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getInterpolation', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getValueSize', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'shift', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'scale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'trim', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

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

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
