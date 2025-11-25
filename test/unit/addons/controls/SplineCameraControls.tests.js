/* global QUnit */

import { SplineCameraControls } from '../../../../examples/jsm/controls/SplineCameraControls.js';

import { Controls } from '../../../../src/extras/Controls.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { CatmullRomCurve3 } from '../../../../src/extras/curves/CatmullRomCurve3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Controls', () => {

	QUnit.module( 'SplineCameraControls', () => {

		const points = [
			new Vector3( 0, 0, 0 ),
			new Vector3( 10, 5, 0 ),
			new Vector3( 20, 0, 0 )
		];

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual(
				controls instanceof Controls, true,
				'SplineCameraControls extends from Controls'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.ok( controls, 'Can instantiate SplineCameraControls' );

		} );

		// PROPERTIES
		QUnit.test( 'curve', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.curve, curve, 'curve property is set correctly' );

		} );

		QUnit.test( 'autoPlay', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.autoPlay, false, 'autoPlay defaults to false' );

			controls.autoPlay = true;
			assert.strictEqual( controls.autoPlay, true, 'autoPlay can be set to true' );

		} );

		QUnit.test( 'playbackSpeed', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.playbackSpeed, 1.0, 'playbackSpeed defaults to 1.0' );

			controls.playbackSpeed = 2.0;
			assert.strictEqual( controls.playbackSpeed, 2.0, 'playbackSpeed can be changed' );

		} );

		QUnit.test( 'currentTime', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.currentTime, 0, 'currentTime defaults to 0' );

		} );

		QUnit.test( 'loopTime', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.loopTime, 10.0, 'loopTime defaults to 10.0' );

		} );

		QUnit.test( 'loop', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.loop, false, 'loop defaults to false' );

		} );

		QUnit.test( 'lookAhead', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.lookAhead, 0.01, 'lookAhead defaults to 0.01' );

		} );

		QUnit.test( 'upVector', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.ok( controls.upVector instanceof Vector3, 'upVector is a Vector3' );
			assert.strictEqual( controls.upVector.x, 0, 'upVector.x defaults to 0' );
			assert.strictEqual( controls.upVector.y, 1, 'upVector.y defaults to 1' );
			assert.strictEqual( controls.upVector.z, 0, 'upVector.z defaults to 0' );

		} );

		QUnit.test( 'offset', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.ok( controls.offset instanceof Vector3, 'offset is a Vector3' );
			assert.strictEqual( controls.offset.x, 0, 'offset.x defaults to 0' );
			assert.strictEqual( controls.offset.y, 0, 'offset.y defaults to 0' );
			assert.strictEqual( controls.offset.z, 0, 'offset.z defaults to 0' );

		} );

		// METHODS
		QUnit.test( 'play', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			assert.strictEqual( controls.autoPlay, false, 'autoPlay starts as false' );

			controls.play();

			assert.strictEqual( controls.autoPlay, true, 'play() sets autoPlay to true' );

		} );

		QUnit.test( 'pause', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			controls.play();
			assert.strictEqual( controls.autoPlay, true, 'autoPlay is true after play()' );

			controls.pause();
			assert.strictEqual( controls.autoPlay, false, 'pause() sets autoPlay to false' );

		} );

		QUnit.test( 'reset', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			controls.currentTime = 5.0;
			assert.strictEqual( controls.currentTime, 5.0, 'currentTime is set to 5.0' );

			controls.reset();
			assert.strictEqual( controls.currentTime, 0, 'reset() sets currentTime to 0' );

		} );

		QUnit.test( 'setPosition / getPosition', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );
			controls.loopTime = 10.0;

			controls.setPosition( 0.5 );
			assert.ok( Math.abs( controls.getPosition() - 0.5 ) < 0.001, 'setPosition(0.5) sets position to 50%' );

			controls.setPosition( 0.0 );
			assert.ok( Math.abs( controls.getPosition() - 0.0 ) < 0.001, 'setPosition(0.0) sets position to 0%' );

			controls.setPosition( 1.0 );
			assert.ok( Math.abs( controls.getPosition() - 1.0 ) < 0.001, 'setPosition(1.0) sets position to 100%' );

		} );

		QUnit.test( 'update - respects enabled flag', ( assert ) => {

			const camera = new PerspectiveCamera();
			camera.position.set( 0, 0, 0 );
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			controls.enabled = false;
			controls.autoPlay = true;

			const result = controls.update( 1.0 );

			assert.strictEqual( result, false, 'update() returns false when disabled' );
			assert.strictEqual( controls.currentTime, 0, 'currentTime does not advance when disabled' );

		} );

		QUnit.test( 'update - advances currentTime with autoPlay', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );
			controls.loopTime = 10.0;
			controls.autoPlay = true;

			controls.update( 1.0 );
			assert.strictEqual( controls.currentTime, 1.0, 'currentTime advances by delta when autoPlay is true' );

			controls.update( 2.0 );
			assert.strictEqual( controls.currentTime, 3.0, 'currentTime accumulates delta' );

		} );

		QUnit.test( 'update - respects playbackSpeed', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );
			controls.loopTime = 10.0;
			controls.autoPlay = true;
			controls.playbackSpeed = 2.0;

			controls.update( 1.0 );
			assert.strictEqual( controls.currentTime, 2.0, 'currentTime advances by delta * playbackSpeed' );

		} );

		QUnit.test( 'update - loops when loop is true', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );
			controls.loopTime = 10.0;
			controls.autoPlay = true;
			controls.loop = true;

			controls.currentTime = 9.0;
			controls.update( 2.0 );

			assert.ok( controls.currentTime < 10.0, 'currentTime wraps around when loop is true' );
			assert.strictEqual( controls.currentTime, 1.0, 'currentTime is correct after wrapping' );

		} );

		QUnit.test( 'update - clamps when loop is false', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );
			controls.loopTime = 10.0;
			controls.autoPlay = true;
			controls.loop = false;

			controls.currentTime = 9.0;
			controls.update( 2.0 );

			assert.strictEqual( controls.currentTime, 10.0, 'currentTime is clamped to loopTime when loop is false' );

		} );

		QUnit.test( 'update - positions camera on curve', ( assert ) => {

			const camera = new PerspectiveCamera();
			camera.position.set( 0, 0, 0 );
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			controls.setPosition( 0.5 );
			controls.update( 0 );

			// Camera should be positioned somewhere along the curve
			// We can't test exact position due to curve interpolation,
			// but we can verify it's not at origin anymore
			const distance = camera.position.distanceTo( new Vector3( 0, 0, 0 ) );
			assert.ok( distance > 0, 'Camera position is updated from origin' );

		} );

		QUnit.test( 'update - dispatches change event', ( assert ) => {

			const camera = new PerspectiveCamera();
			camera.position.set( 0, 0, 0 );
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			let changeEventFired = false;
			controls.addEventListener( 'change', () => {
				changeEventFired = true;
			} );

			controls.setPosition( 0.5 );
			controls.update( 0 );

			assert.strictEqual( changeEventFired, true, 'change event is dispatched when camera moves' );

		} );

		QUnit.test( 'update - applies offset correctly', ( assert ) => {

			const camera = new PerspectiveCamera();
			camera.position.set( 0, 0, 0 );
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			// Get position without offset
			controls.setPosition( 0.5 );
			controls.update( 0 );
			const positionWithoutOffset = camera.position.clone();

			// Apply Y offset (up)
			controls.offset.set( 0, 5, 0 );
			controls.update( 0 );

			const distance = camera.position.distanceTo( positionWithoutOffset );
			assert.ok( distance > 4.9, 'Offset is applied to camera position' );

		} );

		QUnit.test( 'update - lookAhead affects orientation', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			controls.setPosition( 0.0 );
			controls.lookAhead = 0.0;
			controls.update( 0 );
			const quaternion1 = camera.quaternion.clone();

			controls.setPosition( 0.0 );
			controls.lookAhead = 0.1;
			controls.update( 0 );
			const quaternion2 = camera.quaternion.clone();

			// Quaternions should be different with different lookAhead values
			const angleDiff = quaternion1.angleTo( quaternion2 );
			assert.ok( angleDiff > 0.01, 'lookAhead affects camera orientation' );

		} );

		QUnit.test( 'update - respects custom upVector', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			// Set custom up vector
			controls.upVector.set( 0, 0, 1 );

			controls.setPosition( 0.5 );
			controls.update( 0 );

			// Camera's up should match the custom upVector (approximately)
			const dot = camera.up.dot( controls.upVector );
			assert.ok( dot > 0.9, 'Camera up direction respects custom upVector' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			const camera = new PerspectiveCamera();
			const curve = new CatmullRomCurve3( points );
			const controls = new SplineCameraControls( camera, curve );

			// Should not throw
			controls.dispose();

			assert.ok( true, 'dispose() does not throw' );

		} );

	} );

} );
