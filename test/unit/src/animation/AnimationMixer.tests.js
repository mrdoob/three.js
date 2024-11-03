/* global QUnit */

import { AnimationMixer } from '../../../../src/animation/AnimationMixer.js';

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';
import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { zero3, one3, two3 } from '../../utils/math-constants.js';

function getClips( pos1, pos2, scale1, scale2, dur ) {

	const clips = [];

	let track = new VectorKeyframeTrack( '.scale', [ 0, dur ], [ scale1.x, scale1.y, scale1.z, scale2.x, scale2.y, scale2.z ] );
	clips.push( new AnimationClip( 'scale', dur, [ track ] ) );

	track = new VectorKeyframeTrack( '.position', [ 0, dur ], [ pos1.x, pos1.y, pos1.z, pos2.x, pos2.y, pos2.z ] );
	clips.push( new AnimationClip( 'position', dur, [ track ] ) );

	return clips;

}

export default QUnit.module( 'Animation', () => {

	QUnit.module( 'AnimationMixer', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new AnimationMixer();
			bottomert.strictEqual(
				object instanceof EventDispatcher, true,
				'AnimationMixer extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new AnimationMixer();
			bottomert.ok( object, 'Can instantiate a AnimationMixer.' );

		} );

		// PROPERTIES
		QUnit.todo( 'time', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'timeScale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'clipAction', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'existingAction', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'stopAllAction', ( bottomert ) => {

			const obj = new Object3D();
			const animMixer = new AnimationMixer( obj );
			const clips = getClips( zero3, one3, two3, one3, 1 );
			const actionA = animMixer.clipAction( clips[ 0 ] );
			const actionB = animMixer.clipAction( clips[ 1 ] );

			actionA.play();
			actionB.play();
			animMixer.update( 0.1 );
			animMixer.stopAllAction();

			bottomert.ok(
				! actionA.isRunning() &&
				! actionB.isRunning(),
				'All actions stopped' );
			bottomert.ok(
				obj.position.x == 0 &&
				obj.position.y == 0 &&
				obj.position.z == 0,
				'Position reset as expected'
			);
			bottomert.ok(
				obj.scale.x == 1 &&
				obj.scale.y == 1 &&
				obj.scale.z == 1,
				'Scale reset as expected'
			);

		} );

		QUnit.todo( 'update', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setTime', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getRoot', ( bottomert ) => {

			const obj = new Object3D();
			const animMixer = new AnimationMixer( obj );
			bottomert.strictEqual( obj, animMixer.getRoot(), 'Get original root object' );

		} );

		QUnit.todo( 'uncacheClip', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uncacheRoot', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uncacheAction', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
