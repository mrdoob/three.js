/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { KeyframeTrack } from '../../../../src/animation/KeyframeTrack';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'KeyframeTrack', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// STATIC STUFF
		QUnit.todo( "toJSON", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "TimeBufferType", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "ValueBufferType", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "DefaultInterpolation", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "InterpolantFactoryMethodDiscrete", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "InterpolantFactoryMethodLinear", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "InterpolantFactoryMethodSmooth", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setInterpolation", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getInterpolation", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getValueSize", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "shift", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "scale", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "trim", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( 'validate', ( assert ) => {

			var validTrack = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, 0.5 ] );
			var invalidTrack = new NumberKeyframeTrack( '.material.opacity', [ 0, 1 ], [ 0, NaN ] );

			assert.ok( validTrack.validate() );
			assert.notOk( invalidTrack.validate() );

		} );

		QUnit.test( 'optimize', ( assert ) => {

			var track = new NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2, 3, 4 ], [ 0, 0, 0, 0, 1 ] );

			assert.equal( track.values.length, 5 );

			track.optimize();

			assert.smartEqual( Array.from( track.times ), [ 0, 3, 4 ] );
			assert.smartEqual( Array.from( track.values ), [ 0, 0, 1 ] );

		} );

	} );

} );
