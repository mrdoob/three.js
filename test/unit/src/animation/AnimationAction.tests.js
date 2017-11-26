/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction';
import { AnimationMixer } from '../../../../src/animation/AnimationMixer';
import { AnimationClip } from '../../../../src/animation/AnimationClip';

export default QUnit.module( 'Animation', () => {

	QUnit.module.todo( 'AnimationAction', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var mixer = new AnimationMixer();
			var clip = new AnimationClip();

			assert.throws(
				function () {

					new AnimationAction();

				},
				new Error( "Mixer can't be null or undefined !" ),
				"raised error instance about undefined or null mixer"
			);

			assert.throws(
				function () {

					new AnimationAction( mixer );

				},
				new Error( "Clip can't be null or undefined !" ),
				"raised error instance about undefined or null clip"
			);

			var animationAction = new AnimationAction( mixer, clip );
			assert.ok( animationAction, "animationAction instanciated" );

		} );

		// PRIVATE STUFF
		QUnit.test( "_update", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "_updateWeight", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "_updateTimeScale", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "_updateTime", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "_setEndings", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "_scheduleFading", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.test( "play", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "stop", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "reset", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "isRunning", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "isScheduled", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "startAt", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setLoop", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setEffectiveWeight", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getEffectiveWeight", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "fadeIn", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "fadeOut", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "crossFadeFrom", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "crossFadeTo", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "stopFading", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setEffectiveTimeScale", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getEffectiveTimeScale", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setDuration", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "syncWith", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "halt", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "warp", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "stopWarping", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getMixer", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getClip", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getRoot", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
