import { assert, describe, test } from 'vitest';

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

describe( 'Animation', () => {

	describe( 'AnimationAction', () => {

		// INSTANCING
		test( 'Instancing', () => {

			const mixer = new AnimationMixer();
			const clip = new AnimationClip( 'nonname', - 1, [] );

			const animationAction = new AnimationAction( mixer, clip );
			assert.ok( animationAction, 'animationAction instantiated' );

		} );

		// PUBLIC STUFF
		test( 'play', () => {

			const { mixer, animationAction } = createAnimation();
			const animationAction2 = animationAction.play();
			assert.equal( animationAction, animationAction2, 'AnimationAction.play can be chained.' );

			const UserException = function () {

				this.message = 'AnimationMixer must activate AnimationAction on play.';

			};

			mixer._activateAction = function ( action ) {

				if ( action === animationAction ) {

					throw new UserException();

				}

			};

			assert.throws( () => {

				animationAction.play();

			}, UserException );

		} );

		test( 'stop', () => {

			const { mixer, animationAction } = createAnimation();
			const animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, 'AnimationAction.stop can be chained.' );

			const UserException = function () {

				this.message = 'AnimationMixer must deactivate AnimationAction on stop.';

			};

			mixer._deactivateAction = function ( action ) {

				if ( action === animationAction ) {

					throw new UserException();

				}

			};

			assert.throws( () => {

				animationAction.stop();

			}, UserException );

		} );

		test( 'reset', () => {

			const { animationAction } = createAnimation();
			const animationAction2 = animationAction.stop();
			assert.equal( animationAction, animationAction2, 'AnimationAction.reset can be chained.' );
			assert.equal( animationAction2.paused, false, 'AnimationAction.reset() sets paused false' );
			assert.equal( animationAction2.enabled, true, 'AnimationAction.reset() sets enabled true' );
			assert.equal( animationAction2.time, 0, 'AnimationAction.reset() resets time.' );
			assert.equal( animationAction2._loopCount, - 1, 'AnimationAction.reset() resets loopcount.' );
			assert.equal( animationAction2._startTime, null, 'AnimationAction.reset() removes starttime.' );

		} );

		test( 'isRunning', () => {

			const { animationAction } = createAnimation();
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

		test( 'isScheduled', () => {

			const { mixer, animationAction } = createAnimation();
			assert.notOk( animationAction.isScheduled(), 'When an animation is just made, it is not scheduled.' );
			animationAction.play();
			assert.ok( animationAction.isScheduled(), 'When an animation is started, it is scheduled.' );
			mixer.update( 1 );
			assert.ok( animationAction.isScheduled(), 'When an animation is updated, it is scheduled.' );
			animationAction.stop();
			assert.notOk( animationAction.isScheduled(), 'When an animation is stopped, it isn\'t scheduled anymore.' );

		} );

		test( 'startAt', () => {

			const { mixer, animationAction } = createAnimation();
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

		test( 'setLoop LoopOnce', () => {

			const { mixer, animationAction } = createAnimation();
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

		test( 'setLoop LoopRepeat', () => {

			const { root, mixer, animationAction } = createAnimation();
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

		test( 'setLoop LoopPingPong', () => {

			const { root, mixer, animationAction } = createAnimation();
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

		test( 'setEffectiveWeight', () => {

			const { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0.3, 'When EffectiveWeight is set to 0.3 , EffectiveWeight is 0.3.' );

		} );

		test( 'setEffectiveWeight - disabled', () => {

			const { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.enabled = false;
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0, 'When EffectiveWeight is set to 0.3 when disabled , EffectiveWeight is 0.' );

		} );

		test( 'setEffectiveWeight - over duration', () => {

			const { root, mixer, animationAction } = createAnimation();
			animationAction.setEffectiveWeight( 0.5 );
			animationAction.play();
			mixer.update( 500 );
			assert.equal( root.rotation.x, 90, 'When an animation has weight 0.5 and runs half through the animation, it has changed to 1/4.' );
			mixer.update( 1000 );
			assert.equal( root.rotation.x, 90, 'When an animation has weight 0.5 and runs one and half through the animation, it has changed to 1/4.' );

		} );

		test( 'getEffectiveWeight', () => {

			let { animationAction } = createAnimation();
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0.3, 'When EffectiveWeight is set to 0.3 , EffectiveWeight is 0.3.' );

			( { animationAction } = createAnimation() );
			assert.equal( animationAction.getEffectiveWeight(), 1, 'When an animation is created, EffectiveWeight is 1.' );
			animationAction.enabled = false;
			animationAction.setEffectiveWeight( 0.3 );
			assert.equal( animationAction.getEffectiveWeight(), 0, 'When EffectiveWeight is set to 0.3 when disabled , EffectiveWeight is 0.' );

		} );

		test( 'fadeIn', () => {

			const { mixer, animationAction } = createAnimation();
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

		test( 'fadeOut', () => {

			const { mixer, animationAction } = createAnimation();
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

		test( 'crossFadeFrom', () => {

			const { mixer, animationAction, animationAction2 } = createTwoAnimations();
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

		test( 'crossFadeTo', () => {

			const { mixer, animationAction, animationAction2 } = createTwoAnimations();
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

		test( 'getMixer', () => {

			const { mixer, animationAction } = createAnimation();
			const mixer2 = animationAction.getMixer();
			assert.equal( mixer, mixer2, 'mixer should be returned by getMixer.' );

		} );

		test( 'getClip', () => {

			const { clip, animationAction } = createAnimation();
			const clip2 = animationAction.getClip();
			assert.equal( clip, clip2, 'clip should be returned by getClip.' );

		} );

		test( 'getRoot', () => {

			const { root, animationAction } = createAnimation();
			const root2 = animationAction.getRoot();
			assert.equal( root, root2, 'root should be returned by getRoot.' );

		} );

		// OTHERS
		test( 'StartAt when already executed once', () => {

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

		} );

		test( 'LoopRepeat with timeScale reversal during first loop', () => {

			// Regression test for #19151
			const root = new Object3D();
			const mixer = new AnimationMixer( root );
			const track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 1000 ], [ 0, 360 ] );
			const clip = new AnimationClip( 'clip1', 1000, [ track ] );

			const animationAction = mixer.clipAction( clip );
			animationAction.setLoop( LoopRepeat, Infinity );
			animationAction.play();

			// Advance partway into the first loop
			mixer.update( 500 );
			assert.equal( root.rotation.x, 180, 'At 500ms, rotation is 180 (halfway).' );

			// Reverse timeScale
			mixer.timeScale = - 1;

			// Step backward — should smoothly reverse, not jump
			mixer.update( 250 );
			assert.equal( root.rotation.x, 90, 'After reversing and stepping 250ms back, rotation is 90.' );

			mixer.update( 250 );
			assert.equal( root.rotation.x, 0, 'After reversing and stepping another 250ms back, rotation is 0 (start).' );

		} );

		test( 'LoopPingPong with timeScale reversal during first loop', () => {

			// Regression test for #19151
			const root = new Object3D();
			const mixer = new AnimationMixer( root );
			const track = new NumberKeyframeTrack( '.rotation[x]', [ 0, 1000 ], [ 0, 360 ] );
			const clip = new AnimationClip( 'clip1', 1000, [ track ] );

			const animationAction = mixer.clipAction( clip );
			animationAction.setLoop( LoopPingPong, Infinity );
			animationAction.play();

			// Advance partway into the first loop
			mixer.update( 500 );
			assert.equal( root.rotation.x, 180, 'At 500ms, rotation is 180 (halfway).' );

			// Reverse timeScale
			mixer.timeScale = - 1;

			// Step backward — should smoothly reverse, not jump
			mixer.update( 250 );
			assert.equal( root.rotation.x, 90, 'After reversing and stepping 250ms back, rotation is 90.' );

			mixer.update( 250 );
			assert.equal( root.rotation.x, 0, 'After reversing and stepping another 250ms back, rotation is 0 (start).' );

		} );

	} );

} );
