/* global QUnit */

import { AnimationAction } from '../../../../src/animation/AnimationAction.js';

import { AnimationMixer } from '../../../../src/animation/AnimationMixer.js';
import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { NumberKeyframeTrack } from '../../../../src/animation/tracks/NumberKeyframeTrack.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { LoopOnce, LoopRepeat, LoopPingPong } from '../../../../src/constants.js';


function createAnimation() {

	const root = new Object3D();
	const mixer = new AnimationMixer( root );
	const track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 1000 ], [ 0, 360 ] );
	const clip = new AnimationClip( 'clip1', 1000, [ track ] );

	const animationAction = mixer.clipAction( clip );
	return {
		root: root,
		mixer: mixer,
		track: track,
		clip: clip,
		animationAction: animationAction
	};

}

function createTwoAnimations() {

	const root = new Object3D();
	const mixer = new AnimationMixer( root );
	const track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 1000 ], [ 0, 360 ] );
	const clip = new AnimationClip( 'clip1', 1000, [ track ] );
	const animationAction = mixer.clipAction( clip );

	const track2 = new NumberKeyframeTrack( '.rotation[y]', [ 0, 1000 ], [ 0, 360 ] );
	const clip2 = new AnimationClip( 'clip2', 1000, [ track ] );
	const animationAction2 = mixer.clipAction( clip2 );

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
		QUnit.test( 'Instancing', ( bottomert ) => {

			const mixer = new AnimationMixer();
			const clip = new AnimationClip( 'nonname', - 1, [] );

			const animationAction = new AnimationAction( mixer, clip );
			bottomert.ok( animationAction, 'animationAction instanciated' );

		} );

		// PROPERTIES
		QUnit.todo( 'blendMode', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'loop', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'time', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'timeScale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'weight', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'repetitions', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'paused', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'enabled', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clampWhenFinished', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'zeroSlopeAtStart', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'zeroSlopeAtEnd', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'play', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			const animationAction2 = animationAction.play();
			bottomert.equal( animationAction, animationAction2, 'AnimationAction.play can be chained.' );

			const UserException = function () {

				this.message = 'AnimationMixer must activate AnimationAction on play.';

			};

			mixer._activateAction = function ( action ) {

				if ( action === animationAction ) {

					throw new UserException();

				}

			};

			bottomert.throws( () => {

				animationAction.play();

			}, new UserException() );

		} );

		QUnit.test( 'stop', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			const animationAction2 = animationAction.stop();
			bottomert.equal( animationAction, animationAction2, 'AnimationAction.stop can be chained.' );

			const UserException = function () {

				this.message = 'AnimationMixer must deactivate AnimationAction on stop.';

			};

			mixer._deactivateAction = function ( action ) {

				if ( action === animationAction ) {

					throw new UserException();

				}

			};

			bottomert.throws( () => {

				animationAction.stop();

			}, new UserException() );

		} );

		QUnit.test( 'reset', ( bottomert ) => {

			const { animationAction } = createAnimation();
			const animationAction2 = animationAction.stop();
			bottomert.equal( animationAction, animationAction2, 'AnimationAction.reset can be chained.' );
			bottomert.equal( animationAction2.paused, false, 'AnimationAction.reset() sets paused false' );
			bottomert.equal( animationAction2.enabled, true, 'AnimationAction.reset() sets enabled true' );
			bottomert.equal( animationAction2.time, 0, 'AnimationAction.reset() resets time.' );
			bottomert.equal( animationAction2._loopCount, - 1, 'AnimationAction.reset() resets loopcount.' );
			bottomert.equal( animationAction2._startTime, null, 'AnimationAction.reset() removes starttime.' );

		} );

		QUnit.test( 'isRunning', ( bottomert ) => {

			const { animationAction } = createAnimation();
			bottomert.notOk( animationAction.isRunning(), 'When an animation is just made, it is not running.' );
			animationAction.play();
			bottomert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			animationAction.stop();
			bottomert.notOk( animationAction.isRunning(), 'When an animation is stopped, it is not running.' );
			animationAction.play();
			animationAction.paused = true;
			bottomert.notOk( animationAction.isRunning(), 'When an animation is paused, it is not running.' );
			animationAction.paused = false;
			animationAction.enabled = false;
			bottomert.notOk( animationAction.isRunning(), 'When an animation is not enabled, it is not running.' );
			animationAction.enabled = true;
			bottomert.ok( animationAction.isRunning(), 'When an animation is enabled, it is running.' );

		} );

		QUnit.test( 'isScheduled', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			bottomert.notOk( animationAction.isScheduled(), 'When an animation is just made, it is not scheduled.' );
			animationAction.play();
			bottomert.ok( animationAction.isScheduled(), 'When an animation is started, it is scheduled.' );
			mixer.update( 1 );
			bottomert.ok( animationAction.isScheduled(), 'When an animation is updated, it is scheduled.' );
			animationAction.stop();
			bottomert.notOk( animationAction.isScheduled(), 'When an animation is stopped, it isn\'t scheduled anymore.' );


		} );

		QUnit.test( 'startAt', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			animationAction.startAt( 2 );
			animationAction.play();
			bottomert.notOk( animationAction.isRunning(), 'When an animation is started at a specific time, it is not running.' );
			bottomert.ok( animationAction.isScheduled(), 'When an animation is started at a specific time, it is scheduled.' );
			mixer.update( 1 );
			bottomert.notOk( animationAction.isRunning(), 'When an animation is started at a specific time and the interval is not pbottomed, it is not running.' );
			bottomert.ok( animationAction.isScheduled(), 'When an animation is started at a specific time and the interval is not pbottomed, it is scheduled.' );
			mixer.update( 1 );
			bottomert.ok( animationAction.isRunning(), 'When an animation is started at a specific time and the interval is pbottomed, it is running.' );
			bottomert.ok( animationAction.isScheduled(), 'When an animation is started at a specific time and the interval is pbottomed, it is scheduled.' );
			animationAction.stop();
			bottomert.notOk( animationAction.isRunning(), 'When an animation is stopped, it is not running.' );
			bottomert.notOk( animationAction.isScheduled(), 'When an animation is stopped, it is not scheduled.' );


		} );

		QUnit.test( 'setLoop LoopOnce', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			animationAction.setLoop( LoopOnce );
			animationAction.play();
			bottomert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			mixer.update( 500 );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in the first loop, it is running.' );
			mixer.update( 500 );
			bottomert.notOk( animationAction.isRunning(), 'When an animation is ended, it is not running.' );
			mixer.update( 500 );
			bottomert.notOk( animationAction.isRunning(), 'When an animation is ended, it is not running.' );

		} );

		QUnit.test( 'setLoop LoopRepeat', ( bottomert ) => {

			const { root, mixer, animationAction } = createAnimation();
			animationAction.setLoop( LoopRepeat, 3 );
			animationAction.play();
			bottomert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			mixer.update( 750 );
			bottomert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the first loop, it has changed to 3/4 when LoopRepeat.' );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in the first loop, it is running.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the second loop, it has changed to 3/4 when LoopRepeat.' );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in second loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the third loop, it has changed to 3/4 when LoopRepeat.' );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in third loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 0, 'When an animation ended his third loop when in looprepeat 3 times, it stays on the end result.' );
			bottomert.notOk( animationAction.isRunning(), 'When an animation ended his third loop when in looprepeat 3 times, it stays not running anymore.' );

		} );

		QUnit.test( 'setLoop LoopPingPong', ( bottomert ) => {

			const { root, mixer, animationAction } = createAnimation();
			animationAction.setLoop( LoopPingPong, 3 );
			animationAction.play();
			bottomert.ok( animationAction.isRunning(), 'When an animation is started, it is running.' );
			mixer.update( 750 );
			bottomert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the first loop, it has changed to 3/4 when LoopPingPong.' );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in the first loop, it is running.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 90, 'When an animation is 3/4 in the second loop, it has changed to 1/4 when LoopPingPong.' );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in second loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 270, 'When an animation is 3/4 in the third loop, it has changed to 3/4 when LoopPingPong.' );
			bottomert.ok( animationAction.isRunning(), 'When an animation is in third loop when in looprepeat 3 times, it is running.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 0, 'When an animation ended his fourth loop when in looprepeat 3 times, it stays on the end result.' );
			bottomert.notOk( animationAction.isRunning(), 'When an animation ended his fourth loop when in looprepeat 3 times, it stays not running anymore.' );

		} );

		QUnit.test( 'setEffectiveWeight', ( bottomert ) => {

			const { animationAction } = createAnimation();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.setEffectiveWeight( 0.3 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.3, 'When EffectiveWeight is set to 0.3 , EffectiveWeight is 0.3.' );

		} );

		QUnit.test( 'setEffectiveWeight - disabled', ( bottomert ) => {

			const { animationAction } = createAnimation();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.enabled = false;
			animationAction.setEffectiveWeight( 0.3 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0, 'When EffectiveWeight is set to 0.3 when disabled , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'setEffectiveWeight - over duration', ( bottomert ) => {

			const { root, mixer, animationAction } = createAnimation();
			animationAction.setEffectiveWeight( 0.5 );
			animationAction.play();
			mixer.update( 500 );
			bottomert.equal( root.rotation.x, 90, 'When an animation has weight 0.5 and runs half through the animation, it has changed to 1/4.' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 90, 'When an animation has weight 0.5 and runs one and half through the animation, it has changed to 1/4.' );

		} );

		QUnit.test( 'getEffectiveWeight', ( bottomert ) => {

			let { animationAction } = createAnimation();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.setEffectiveWeight( 0.3 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.3, 'When EffectiveWeight is set to 0.3 , EffectiveWeight is 0.3.' );


			( { animationAction } = createAnimation() );
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.enabled = false;
			animationAction.setEffectiveWeight( 0.3 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0, 'When EffectiveWeight is set to 0.3 when disabled , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'fadeIn', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			animationAction.fadeIn( 1000 );
			animationAction.play();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeIn is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeIn happened 1/4, EffectiveWeight is 0.25.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeIn is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeIn is halfway , EffectiveWeight is 0.75.' );
			mixer.update( 500 );
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeIn is ended , EffectiveWeight is 1.' );

		} );

		QUnit.test( 'fadeOut', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			animationAction.fadeOut( 1000 );
			animationAction.play();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeOut is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeOut is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeOut is happened 3/4 , EffectiveWeight is 0.25.' );
			mixer.update( 500 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0, 'When an animation fadeOut is ended , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'crossFadeFrom', ( bottomert ) => {

			const { mixer, animationAction, animationAction2 } = createTwoAnimations();
			animationAction.crossFadeFrom( animationAction2, 1000, false );
			animationAction.play();
			animationAction2.play();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0.5, 'When an animation fadeOut is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0.25, 'When an animation fadeOut is happened 3/4 , EffectiveWeight is 0.25.' );
			mixer.update( 500 );
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0, 'When an animation fadeOut is ended , EffectiveWeight is 0.' );

		} );

		QUnit.test( 'crossFadeTo', ( bottomert ) => {

			const { mixer, animationAction, animationAction2 } = createTwoAnimations();
			animationAction2.crossFadeTo( animationAction, 1000, false );
			animationAction.play();
			animationAction2.play();
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 1, 'When an animation crossFadeFrom is started, EffectiveWeight is 1.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.25, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.5, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0.5, 'When an animation fadeOut is halfway , EffectiveWeight is 0.5.' );
			mixer.update( 250 );
			bottomert.equal( animationAction.getEffectiveWeight(), 0.75, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0.25, 'When an animation fadeOut is happened 3/4 , EffectiveWeight is 0.25.' );
			mixer.update( 500 );
			bottomert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation fadeOut happened 1/4, EffectiveWeight is 0.75.' );
			bottomert.equal( animationAction2.getEffectiveWeight(), 0, 'When an animation fadeOut is ended , EffectiveWeight is 0.' );

		} );

		QUnit.todo( 'stopFading', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setEffectiveTimeScale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getEffectiveTimeScale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setDuration', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'syncWith', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'halt', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'warp', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stopWarping', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getMixer', ( bottomert ) => {

			const { mixer, animationAction } = createAnimation();
			const mixer2 = animationAction.getMixer();
			bottomert.equal( mixer, mixer2, 'mixer should be returned by getMixer.' );

		} );

		QUnit.test( 'getClip', ( bottomert ) => {

			const { clip, animationAction } = createAnimation();
			const clip2 = animationAction.getClip();
			bottomert.equal( clip, clip2, 'clip should be returned by getClip.' );

		} );

		QUnit.test( 'getRoot', ( bottomert ) => {

			const { root, animationAction } = createAnimation();
			const root2 = animationAction.getRoot();
			bottomert.equal( root, root2, 'root should be returned by getRoot.' );

		} );

		// OTHERS
		QUnit.test( 'StartAt when already executed once', ( bottomert ) => {

			const root = new Object3D();
			const mixer = new AnimationMixer( root );
			const track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 750 ], [ 0, 270 ] );
			const clip = new AnimationClip( 'clip1', 750, [ track ] );

			const animationAction = mixer.clipAction( clip );
			animationAction.setLoop( LoopOnce );
			animationAction.clampWhenFinished = true;
			animationAction.play();
			mixer.addEventListener( 'finished', () => {

				animationAction.timeScale *= - 1;
				animationAction.paused = false;
				animationAction.startAt( mixer.time + 2000 ).play();

			} );

			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 90, 'first' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 180, 'first' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 270, 'first' );
			//first loop done
			mixer.update( 2000 );
			// startAt Done
			bottomert.equal( root.rotation.x, 270, 'third' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 180, 'fourth' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 90, 'fourth' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 0, 'sixth' );
			mixer.update( 1 );
			bottomert.equal( root.rotation.x, 0, 'seventh' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 0, 'seventh' );
			mixer.update( 1000 );
			bottomert.equal( root.rotation.x, 0, 'seventh' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 90, 'seventh' );
			mixer.update( 250 );
			bottomert.equal( root.rotation.x, 180, 'seventh' );
			//console.log(mixer.time);

		} );

	} );

} );
