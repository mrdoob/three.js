/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction';
import { AnimationMixer } from '../../../../src/animation/AnimationMixer';
import { AnimationClip } from '../../../../src/animation/AnimationClip';
import { Object3D } from '../../../../src/core/Object3D';

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
		QUnit.test( "play", ( assert ) => {

			var mixer = new AnimationMixer( new Object3D() );
			var clip = new AnimationClip( "nonname", - 1, [] );
			var animationAction = new AnimationAction( mixer, clip );
			var animationAction2 = animationAction.play();
			assert.equal( animationAction, animationAction2, "AnimationAction.play can be chained." );

			var UserException = function () {

				this.message = "AnimationMixer must activate AnimationAction on play.";

			};
			mixer._activateAction = function ( action ) {

				if ( action === animationAction ) {

					throw new UserException();

				}

			};
			assert.throws( () => {

				animationAction.play();

			}, new UserException() );

		} );

		QUnit.test( "stop", ( assert ) => {

			var mixer = new AnimationMixer( new Object3D() );
			var clip = new AnimationClip( "nonname", - 1, [] );
			var animationAction = new AnimationAction( mixer, clip );
			var animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, "AnimationAction.stop can be chained." );

			var UserException = function () {

				this.message = "AnimationMixer must deactivate AnimationAction on stop.";

			};
			mixer._deactivateAction = function ( action ) {

				if ( action === animationAction ) {

					throw new UserException();

				}

			};
			assert.throws( () => {

				animationAction.stop();

			}, new UserException() );

		} );

		QUnit.test( "reset", ( assert ) => {

			var mixer = new AnimationMixer( new Object3D() );
			var clip = new AnimationClip( "nonname", - 1, [] );
			var animationAction = new AnimationAction( mixer, clip );
			var animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, "AnimationAction.reset can be chained." );
			assert.equal( animationAction2.paused, false, "AnimationAction.reset() sets paused false" );
			assert.equal( animationAction2.enabled, true, "AnimationAction.reset() sets enabled true" );
			assert.equal( animationAction2.time, 0, "AnimationAction.reset() resets time." );
			assert.equal( animationAction2._loopCount, - 1, "AnimationAction.reset() resets loopcount." );
			assert.equal( animationAction2._startTime, null, "AnimationAction.reset() removes starttime." );

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
