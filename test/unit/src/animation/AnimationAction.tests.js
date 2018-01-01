/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction';
import { AnimationMixer } from '../../../../src/animation/AnimationMixer';
import { AnimationClip } from '../../../../src/animation/AnimationClip';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack';
import { Object3D } from '../../../../src/core/Object3D';
import { LoopOnce, LoopRepeat, LoopPingPong } from '../../../../src/constants';


function createAnimation(){


	var mixer = new AnimationMixer(new Object3D());
	var track = new NumberKeyframeTrack( ".rotation[x]", [ 0, 1000 ], [ 0, 360 ] );
	var clip = new AnimationClip( "clip1", 1000, [track] );

	var animationAction = new AnimationAction( mixer, clip );
	return { mixer :mixer,track:track,clip:clip,animationAction:animationAction};

}

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

            var {mixer,animationAction} = createAnimation();
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

            var {mixer,animationAction} = createAnimation();
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

            var {mixer,animationAction} = createAnimation();
			var animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, "AnimationAction.reset can be chained." );
			assert.equal( animationAction2.paused, false, "AnimationAction.reset() sets paused false" );
			assert.equal( animationAction2.enabled, true, "AnimationAction.reset() sets enabled true" );
			assert.equal( animationAction2.time, 0, "AnimationAction.reset() resets time." );
			assert.equal( animationAction2._loopCount, - 1, "AnimationAction.reset() resets loopcount." );
			assert.equal( animationAction2._startTime, null, "AnimationAction.reset() removes starttime." );

		} );

		QUnit.test( "isRunning", ( assert ) => {

            var {mixer,animationAction} = createAnimation();
			assert.notOk( animationAction.isRunning(), "When an animation is just made, it is not running." );
            animationAction.play();
			assert.ok( animationAction.isRunning(), "When an animation is started, it is running." );
            animationAction.stop();
			assert.notOk( animationAction.isRunning(), "When an animation is stopped, it is not running." );
            animationAction.play();
            animationAction.paused = true;
			assert.notOk( animationAction.isRunning(), "When an animation is paused, it is not running." );
            animationAction.paused = false;
            animationAction.enabled = false;
			assert.notOk( animationAction.isRunning(), "When an animation is not enabled, it is not running." );
            animationAction.enabled = true;
			assert.ok( animationAction.isRunning(), "When an animation is enabled, it is running." );

		} );

		QUnit.test( "isScheduled", ( assert ) => {

			var {mixer,animationAction} = createAnimation();
			assert.notOk( animationAction.isScheduled(), "When an animation is just made, it is not scheduled." );
            animationAction.play();
            assert.ok( animationAction.isScheduled(), "When an animation is started, it is scheduled." );
            mixer.update(1);
            assert.ok( animationAction.isScheduled(), "When an animation is updated, it is scheduled." );
            animationAction.stop();
            assert.notOk( animationAction.isScheduled(), "When an animation is stopped, it isn't scheduled anymore." );

           
		} );

		QUnit.test( "startAt", ( assert ) => {

			var {mixer,animationAction} = createAnimation();
            animationAction.startAt(2);
            animationAction.play();
            assert.notOk( animationAction.isRunning(), "When an animation is started at a specific time, it is not running." );
			assert.ok( animationAction.isScheduled(), "When an animation is started at a specific time, it is scheduled." );
            mixer.update(1);
            assert.notOk( animationAction.isRunning(), "When an animation is started at a specific time and the interval is not passed, it is not running." );
			assert.ok( animationAction.isScheduled(), "When an animation is started at a specific time and the interval is not passed, it is scheduled." );
            mixer.update(1);
            assert.ok( animationAction.isRunning(), "When an animation is started at a specific time and the interval is passed, it is running." );
			assert.ok( animationAction.isScheduled(), "When an animation is started at a specific time and the interval is passed, it is scheduled." );
            animationAction.stop();
            assert.notOk( animationAction.isRunning(), "When an animation is stopped, it is not running." );
			assert.notOk( animationAction.isScheduled(), "When an animation is stopped, it is not scheduled." );
            

		} );

		QUnit.test( "setLoop LoopOnce", ( assert ) => {

			var {mixer,animationAction} = createAnimation();
            animationAction.setLoop(LoopOnce);
            animationAction.play();
            assert.ok( animationAction.isRunning(), "When an animation is started, it is running." );
			mixer.update(500);
            assert.ok( animationAction.isRunning(), "When an animation is in the first loop, it is running." );
			mixer.update(500);
            assert.notOk( animationAction.isRunning(), "When an animation is ended, it is not running." );
			mixer.update(500);
            assert.notOk( animationAction.isRunning(), "When an animation is ended, it is not running." );
	
		} );
	
		QUnit.test( "setLoop LoopRepeat", ( assert ) => {
	
			var {mixer,animationAction} = createAnimation();
            animationAction.setLoop(LoopRepeat,3);
            animationAction.play();
            assert.ok( animationAction.isRunning(), "When an animation is started, it is running." );
			mixer.update(500);
            assert.ok( animationAction.isRunning(), "When an animation is in the first loop, it is running." );
			mixer.update(1000);
            assert.ok( animationAction.isRunning(), "When an animation is in second loop when in looprepeat 3 times, it is running." );
			mixer.update(1000);
            assert.ok( animationAction.isRunning(), "When an animation is in third loop when in looprepeat 3 times, it is running." );
			mixer.update(1000);
            assert.notOk( animationAction.isRunning(), "When an animation ended his third loop when in looprepeat 3 times, it is not running anymore." );
			mixer.update(1000);
            assert.notOk( animationAction.isRunning(), "When an animation ended his third loop when in looprepeat 3 times, it stays not running anymore." );
			
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
