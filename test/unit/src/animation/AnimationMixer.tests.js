/* global QUnit */

import { AnimationMixer } from '../../../../src/animation/AnimationMixer.js';
import { AnimationClip } from '../../../../src/animation/AnimationClip.js';
import { VectorKeyframeTrack } from '../../../../src/animation/tracks/VectorKeyframeTrack.js';
import { Object3D } from '../../../../src/core/Object3D.js';
import { zero3, one3, two3 } from '../math/Constants.tests.js';

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
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'clipAction', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'existingAction', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'stopAllAction', ( assert ) => {

			const obj = new Object3D();
			const animMixer = new AnimationMixer( obj );
			const clips = getClips( zero3, one3, two3, one3, 1 );
			const actionA = animMixer.clipAction( clips[ 0 ] );
			const actionB = animMixer.clipAction( clips[ 1 ] );

			actionA.play();
			actionB.play();
			animMixer.update( 0.1 );
			animMixer.stopAllAction();

			assert.ok(
				! actionA.isRunning() &&
				! actionB.isRunning(),
				'All actions stopped' );
			assert.ok(
				obj.position.x == 0 &&
				obj.position.y == 0 &&
				obj.position.z == 0,
				'Position reset as expected'
			);
			assert.ok(
				obj.scale.x == 1 &&
				obj.scale.y == 1 &&
				obj.scale.z == 1,
				'Scale reset as expected'
			);

		} );

		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getRoot', ( assert ) => {

			const obj = new Object3D();
			const animMixer = new AnimationMixer( obj );
			assert.strictEqual( obj, animMixer.getRoot(), 'Get original root object' );

		} );

		QUnit.todo( 'uncacheClip', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uncacheRoot', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uncacheAction', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
