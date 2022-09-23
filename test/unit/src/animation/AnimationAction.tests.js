/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction.js';
import { AnimationMixer } from '../../../../src/animation/AnimationMixer.js';
import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { LoopOnce, LoopRepeat, LoopPingPong } from '../../../../src/constants.js';


function createAnimation() {

	var root = new Object3D();
	var mixer = new AnimationMixer( root );
	var track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 1000 ], [ 0, 360 ] );
	var clip = new AnimationClip( 'clip1', 1000, [ track ] );

	var animationAction = mixer.clipAction( clip );
	return {
		root: root,
		mixer: mixer,
		track: track,
		clip: clip,
		animationAction: animationAction
	};

}

function createTwoAnimations() {

	var root = new Object3D();
	var mixer = new AnimationMixer( root );
	var track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 1000 ], [ 0, 360 ] );
	var clip = new AnimationClip( 'clip1', 1000, [ track ] );
	var animationAction = mixer.clipAction( clip );

	var track2 = new NumberKeyframeTrack( '.rotation[y]', [ 0, 1000 ], [ 0, 360 ] );
	var clip2 = new AnimationClip( 'clip2', 1000, [ track ] );
	var animationAction2 = mixer.clipAction( clip2 );

	return {
		root: root,
		mixer: mixer,
		track: track,
		clip: clip,
		animationAction: animationAction,
		track2: track2,
		clip2: clip2,
		animationAction2: animationAction2
	};

}


export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationAction', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			var mixer = new AnimationMixer();
			var clip = new AnimationClip( 'nonname', - 1, [] );

			var animationAction = new AnimationAction( mixer, clip );
			assert.ok( animationAction, 'animationAction instanciated' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'play', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			var animationAction2 = animationAction.play();
			assert.equal( animationAction, animationAction2, 'AnimationAction.play can be chained.' );

			var UserException = function () {

				this.message = 'AnimationMixer must activate AnimationAction on play.';

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

		QUnit.test( 'stop', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			var animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, 'AnimationAction.stop can be chained.' );

			var UserException = function () {

				this.message = 'AnimationMixer must deactivate AnimationAction on stop.';

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

		QUnit.test( 'reset', ( assert ) => {

			var { animationAction } = createAnimation();
			var animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, 'AnimationAction.reset can be chained.' );
			assert.equal( animationAction2.paused, false, 'AnimationAction.reset() sets paused false' );
			assert.equal( animationAction2.enabled, true, 'AnimationAction.reset() sets enabled true' );
			assert.equal( animationAction2.time, 0, 'AnimationAction.reset() resets time.' );
			assert.equal( animationAction2._loopCount, - 1, 'AnimationAction.reset() resets loopcount.' );
			assert.equal( animationAction2._startTime, null, 'AnimationAction.reset() removes starttime.' );

		} );

		QUnit.test( 'isRunning', ( assert ) => {

			var { animationAction } = createAnimation();
			assert.notOk( animationAction.isRunning(), 'When an animation is just made, it is not running.' );
			animationAction.play();
			assert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			animationAction.stop();
			assert.notOk( animationAction.isRunning(), 'When an animation is stopped, it is not running.' );
			animationAction.play();
			animationAction.paused = true;
			assert.notOk( animationAction.isRunning(), 'When an animation is paused, it is not running.' );
			animationAction.paused = false;
			animationAction.enabled = false;
			assert.notOk( animationAction.isRunning(), 'When an animation is not enabled, it is not running.' );
			animationAction.enabled = true;
			assert.ok( animationAction.isRunning(), 'When an animation is enabled, it is running.' );

		} );

		QUnit.test( 'isScheduled', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			assert.notOk( animationAction.isScheduled(), 'When an animation is just made, it is not scheduled.' );
			animationAction.play();
			assert.ok( animationAction.isScheduled(), 'When an animation is started, it is scheduled.' );
			mixer.update( 1 );
			assert.ok( animationAction.isScheduled(), 'When an animation is updated, it is scheduled.' );
			animationAction.stop();
			assert.notOk( animationAction.isScheduled(), 'When an animation is stopped, it isn\'t scheduled anymore.' );


		} );

		QUnit.test( 'startAt', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			animationAction.startAt( 2 );
			animationAction.play();
			assert.notOk( animationAction.isRunning(), 'When an animation is started at a specific time, it is not running.' );
			assert.ok( animationAction.isScheduled(), 'When an animation is started at a specific time, it is scheduled.' );
			mixer.update( 1 );
			assert.notOk( animationAction.isRunning(), 'When an animation is started at a specific time and the interval is not passed, it is not running.' );
			assert.ok( animationAction.isScheduled(), 'When an animation is started at a specific time and the interval is not passed, it is scheduled.' );
			mixer.update( 1 );
			assert.ok( animationAction.isRunning(), 'When an animation is started at a specific time and the interval is passed, it is running.' );
			assert.ok( animationAction.isScheduled(), 'When an animation is started at a specific time and the interval is passed, it is scheduled.' );
			animationAction.stop();
			assert.notOk( animationAction.isRunning(), 'When an animation is stopped, it is not running.' );
			assert.notOk( animationAction.isScheduled(), 'When an animation is stopped, it is not scheduled.' );


		} );

		QUnit.test( 'setLoop LoopOnce', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			animationAction.setLoop( LoopOnce );
			animationAction.play();
			assert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			mixer.update( 500 );
			assert.ok( animationAction.isRunning(), 'When an animation is in the first loop, it is running.' );
			mixer.update( 500 );
			assert.notOk( animationAction.isRunning(), 'When an animation is ended, it is not running.' );
			mixer.update( 500 );
			assert.notOk( animationAction.isRunning(), 'When an animation is ended, it is not running.' );

		} );

		QUnit.test( 'setLoop LoopRepeat', ( assert ) => {

			var { root, mixer, animationAction } = createAnimation();
			animationAction.setLoop( LoopRepeat, 3 );
			animationAction.play();
			assert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			mixer.update( 750 );
			assert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the first loop, it has changed to 3/4 when LoopRepeat.' );
			assert.ok( animationAction.isRunning(), 'When an animation is in the first loop, it is running.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the second loop, it has changed to 3/4 when LoopRepeat.' );
			assert.ok( animationAction.isRunning(), 'When an animation is in second loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the third loop, it has changed to 3/4 when LoopRepeat.' );
			assert.ok( animationAction.isRunning(), 'When an animation is in third loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 0, 'When an animation ended his third loop when in looprepeat 3 times, it stays on the end result.' );
			assert.notOk( animationAction.isRunning(), 'When an animation ended his third loop when in looprepeat 3 times, it stays not running anymore.' );

		} );

		QUnit.test( 'setLoop LoopPingPong', ( assert ) => {

			var { root, mixer, animationAction } = createAnimation();
			animationAction.setLoop( LoopPingPong, 3 );
			animationAction.play();
			assert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			mixer.update( 750 );
			assert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the first loop, it has changed to 3/4 when LoopPingPong.' );
			assert.ok( animationAction.isRunning(), 'When an animation is in the first loop, it is running.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 90, 'When an animation is 3/4 in the second loop, it has changed to 1/4 when LoopPingPong.' );
			assert.ok( animationAction.isRunning(), 'When an animation is in second loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the third loop, it has changed to 3/4 when LoopPingPong.' );
			assert.ok( animationAction.isRunning(), 'When an animation is in third loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 0, 'When an animation ended his fourth loop when in looprepeat 3 times, it stays on the end result.' );
			assert.notOk( animationAction.isRunning(), 'When an animation ended his fourth loop when in looprepeat 3 times, it stays not running anymore.' );

		} );

		QUnit.test( 'setEffectiveWeight', ( assert ) => {

			var { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0.3, 'When EffectiveWeight is set to 0.3 , EffectiveWeight is 0.3.' );


			var { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.enabled = false;
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0, 'When EffectiveWeight is set to 0.3 when disabled , EffectiveWeight is 0.' );


			var { root, mixer, animationAction } = createAnimation();
			animationAction.setEffectiveWeight( 0.5 );
			animationAction.play();
			mixer.update( 500 );
			assert.equal( root.rotation.x, 90, 'When an animation has weight 0.5 and runs half through the animation, it has changed to 1/4.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 90, 'When an animation has weight 0.5 and runs one and half through the animation, it has changed to 1/4.' );

		} );

		QUnit.test( 'getEffectiveWeight', ( assert ) => {

			var { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0.3, 'When EffectiveWeight is set to 0.3 , EffectiveWeight is 0.3.' );


			var { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.enabled = false;
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0, 'When EffectiveWeight is set to 0.3 when disabled , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'fadeIn', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			animationAction.fadeIn( 1000 );
			animationAction.play();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeIn is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeIn happened 1/4, EffectiveWeight is 0.25.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeIn is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeIn is halfway , EffectiveWeight is 0.75.' );
			mixer.update( 500 );
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeIn is ended , EffectiveWeight is 1.' );

		} );

		QUnit.test( 'fadeOut', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			animationAction.fadeOut( 1000 );
			animationAction.play();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeOut is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeOut is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeOut is happened 3/4 , EffectiveWeight is 0.25.' );
			mixer.update( 500 );
			assert.equal( animationAction.getEffectiveWeight(), 0, 'When an animation fadeOut is ended , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'crossFadeFrom', ( assert ) => {

			var { mixer, animationAction, animationAction2 } = createTwoAnimations();
			animationAction.crossFadeFrom( animationAction2, 1000, false );
			animationAction.play();
			animationAction2.play();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			assert.equal( animationAction2.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0.5, 'When an animation fadeOut is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0.25, 'When an animation fadeOut is happened 3/4 , EffectiveWeight is 0.25.' );
			mixer.update( 500 );
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0, 'When an animation fadeOut is ended , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'crossFadeTo', ( assert ) => {

			var { mixer, animationAction, animationAction2 } = createTwoAnimations();
			animationAction2.crossFadeTo( animationAction, 1000, false );
			animationAction.play();
			animationAction2.play();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			assert.equal( animationAction2.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0.5, 'When an animation fadeOut is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			assert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0.25, 'When an animation fadeOut is happened 3/4 , EffectiveWeight is 0.25.' );
			mixer.update( 500 );
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			assert.equal( animationAction2.getEffectiveWeight(), 0, 'When an animation fadeOut is ended , EffectiveWeight is 0.' );

		} );

		QUnit.todo( 'stopFading', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setEffectiveTimeScale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getEffectiveTimeScale', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDuration', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'syncWith', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'halt', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'warp', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stopWarping', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getMixer', ( assert ) => {

			var { mixer, animationAction } = createAnimation();
			var mixer2 = animationAction.getMixer();
			assert.equal( mixer, mixer2, 'mixer should be returned by getMixer.' );

		} );

		QUnit.test( 'getClip', ( assert ) => {

			var { clip, animationAction } = createAnimation();
			var clip2 = animationAction.getClip();
			assert.equal( clip, clip2, 'clip should be returned by getClip.' );

		} );

		QUnit.test( 'getRoot', ( assert ) => {

			var { root, animationAction } = createAnimation();
			var root2 = animationAction.getRoot();
			assert.equal( root, root2, 'root should be returned by getRoot.' );

		} );

		QUnit.test( 'StartAt when already executed once', ( assert ) => {
			var root = new Object3D();
			var mixer = new AnimationMixer( root );
			var track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 750 ], [ 0, 270 ] );
			var clip = new AnimationClip( 'clip1', 750, [ track ] );
		
			var animationAction = mixer.clipAction( clip );
			animationAction.setLoop( LoopOnce );
			animationAction.clampWhenFinished = true;
			animationAction.play();
			mixer.addEventListener('finished', () => {
				animationAction.timeScale*=-1;
				animationAction.paused=false;
				animationAction.startAt(mixer.time+2000).play();

			});

			mixer.update( 250 );
			assert.equal( root.rotation.x, 90, 'first' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 180, 'first' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 270, 'first' );
			//first loop done
			mixer.update( 2000 );
			// startAt Done
			assert.equal( root.rotation.x, 270, 'third' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 180, 'fourth' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 90, 'fourth' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 0, 'sixth' );
			mixer.update( 1 );
			assert.equal( root.rotation.x, 0, 'seventh' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 0, 'seventh' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 0, 'seventh' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 90, 'seventh' );
			mixer.update( 250 );
			assert.equal( root.rotation.x, 180, 'seventh' );
			//console.log(mixer.time);
		});

	} );

} );
