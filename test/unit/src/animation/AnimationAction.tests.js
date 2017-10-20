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
		QUnit.test( "_update", ( assert ) => {} );

		QUnit.test( "_updateWeight", ( assert ) => {} );

		QUnit.test( "_updateTimeScale", ( assert ) => {} );

		QUnit.test( "_updateTime", ( assert ) => {} );

		QUnit.test( "_setEndings", ( assert ) => {} );

		QUnit.test( "_scheduleFading", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "play", ( assert ) => {} );

		QUnit.test( "stop", ( assert ) => {} );

		QUnit.test( "reset", ( assert ) => {} );

		QUnit.test( "isRunning", ( assert ) => {} );

		QUnit.test( "isScheduled", ( assert ) => {} );

		QUnit.test( "startAt", ( assert ) => {} );

		QUnit.test( "setLoop", ( assert ) => {} );

		QUnit.test( "setEffectiveWeight", ( assert ) => {} );

		QUnit.test( "getEffectiveWeight", ( assert ) => {} );

		QUnit.test( "fadeIn", ( assert ) => {} );

		QUnit.test( "fadeOut", ( assert ) => {} );

		QUnit.test( "crossFadeFrom", ( assert ) => {} );

		QUnit.test( "crossFadeTo", ( assert ) => {} );

		QUnit.test( "stopFading", ( assert ) => {} );

		QUnit.test( "setEffectiveTimeScale", ( assert ) => {} );

		QUnit.test( "getEffectiveTimeScale", ( assert ) => {} );

		QUnit.test( "setDuration", ( assert ) => {} );

		QUnit.test( "syncWith", ( assert ) => {} );

		QUnit.test( "halt", ( assert ) => {} );

		QUnit.test( "warp", ( assert ) => {} );

		QUnit.test( "stopWarping", ( assert ) => {} );

		QUnit.test( "getMixer", ( assert ) => {} );

		QUnit.test( "getClip", ( assert ) => {} );

		QUnit.test( "getRoot", ( assert ) => {} );

	} );

} );
