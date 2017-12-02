/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction';
import { AnimationMixer } from '../../../../src/animation/AnimationMixer';
import { AnimationClip } from '../../../../src/animation/AnimationClip';

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationAction', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var mixer = new AnimationMixer();
			var clip = new AnimationClip( "nonname", - 1, [] );

			var animationAction = new AnimationAction( mixer, clip );
			assert.ok( animationAction, "animationAction instanciated" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "play", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "stop", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "reset", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "isRunning", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "isScheduled", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "startAt", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setLoop", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setEffectiveWeight", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getEffectiveWeight", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "fadeIn", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "fadeOut", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "crossFadeFrom", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "crossFadeTo", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "stopFading", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setEffectiveTimeScale", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getEffectiveTimeScale", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setDuration", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "syncWith", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "halt", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "warp", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "stopWarping", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getMixer", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getClip", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getRoot", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
