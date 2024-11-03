/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D.js';

import { Vector3 } from '../../../../src/math/Vector3.js';
import { Euler } from '../../../../src/math/Euler.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import {
	x,
	y,
	z,
	w,
	eps
} from '../../utils/math-constants.js';
import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

const matrixEquals4 = ( a, b ) => {

	for ( let i = 0; i < 16; i ++ ) {

		if ( Math.abs( a.elements[ i ] - b.elements[ i ] ) >= eps ) {

			return false;

		}

	}

	return true;

};

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Object3D', () => {

		const RadToDeg = 180 / Math.PI;

		const eulerEquals = function ( a, b, tolerance ) {

			tolerance = tolerance || 0.0001;

			if ( a.order != b.order ) {

				return false;

			}

			return (
				Math.abs( a.x - b.x ) <= tolerance &&
				Math.abs( a.y - b.y ) <= tolerance &&
				Math.abs( a.z - b.z ) <= tolerance
			);

		};

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new Object3D();
			bottomert.strictEqual(
				object instanceof EventDispatcher, true,
				'Object3D extends from EventDispatcher'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new Object3D();
			bottomert.ok( object, 'Can instantiate an Object3D.' );

		} );

		// PROPERTIES
		QUnit.todo( 'id', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uuid', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'name', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'type', ( bottomert ) => {

			const object = new Object3D();
			bottomert.ok(
				object.type === 'Object3D',
				'Object3D.type should be Object3D'
			);

		} );

		QUnit.todo( 'parent', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'children', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'up', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'position', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'rotation', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'quaternion', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'scale', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'modelViewMatrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'normalMatrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixWorld', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixWorldNeedsUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixWorldAutoUpdate', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'layers', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'visible', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'castShadow', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'receiveShadow', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'frustumCulled', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'renderOrder', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'animations', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'userData', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.test( 'DEFAULT_UP', ( bottomert ) => {

			const currentDefaultUp = new Vector3().copy( Object3D.DEFAULT_UP );
			const v = new Vector3();

			try {

				bottomert.deepEqual( Object3D.DEFAULT_UP, v.set( 0, 1, 0 ), 'default DEFAULT_UP is Y-up' );

				const object = new Object3D();

				bottomert.deepEqual( object.up, v.set( 0, 1, 0 ), '.up of a new object inherits Object3D.DEFAULT_UP = Y-up' );

				Object3D.DEFAULT_UP.set( 0, 0, 1 );

				const object2 = new Object3D();

				bottomert.deepEqual( object2.up, v.set( 0, 0, 1 ), '.up of a new object inherits Object3D.DEFAULT_UP = Z-up' );

			} finally {

				Object3D.DEFAULT_UP.copy( currentDefaultUp );

			}

		} );

		QUnit.test( 'DEFAULT_MATRIX_AUTO_UPDATE', ( bottomert ) => {

			const currentDefaultMatrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;

			try {

				bottomert.equal( currentDefaultMatrixAutoUpdate, true, 'default DEFAULT_MATRIX_AUTO_UPDATE is true' );

				const object = new Object3D();

				bottomert.equal(
					object.matrixAutoUpdate, true,
					'.matrixAutoUpdate of a new object inherits Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true'
				);

				Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;

				const object2 = new Object3D();

				bottomert.equal(
					object2.matrixAutoUpdate, false,
					'.matrixAutoUpdate of a new object inherits Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false'
				);

			} finally {

				Object3D.DEFAULT_MATRIX_AUTO_UPDATE = currentDefaultMatrixAutoUpdate;

			}

		} );

		// PUBLIC
		QUnit.test( 'isObject3D', ( bottomert ) => {

			const object = new Object3D();
			bottomert.ok(
				object.isObject3D,
				'Object3D.isObject3D should be true'
			);

			const object2 = {};
			bottomert.ok(
				object2.isObject3D === undefined,
				'other object isObject3D should be undefined'
			);

		} );

		QUnit.todo( 'onBeforeRender', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onAfterRender', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'applyMatrix4', ( bottomert ) => {

			const a = new Object3D();
			const m = new Matrix4();
			const expectedPos = new Vector3( x, y, z );
			const expectedQuat = new Quaternion( 0.5 * Math.sqrt( 2 ), 0, 0, 0.5 * Math.sqrt( 2 ) );

			m.makeRotationX( Math.PI / 2 );
			m.setPosition( new Vector3( x, y, z ) );

			a.applyMatrix4( m );

			bottomert.deepEqual( a.position, expectedPos, 'Position has the expected values' );
			bottomert.ok(
				Math.abs( a.quaternion.x - expectedQuat.x ) <= eps &&
				Math.abs( a.quaternion.y - expectedQuat.y ) <= eps &&
				Math.abs( a.quaternion.z - expectedQuat.z ) <= eps,
				'Quaternion has the expected values'
			);

		} );

		QUnit.test( 'applyQuaternion', ( bottomert ) => {

			const a = new Object3D();
			const sqrt = 0.5 * Math.sqrt( 2 );
			const quat = new Quaternion( 0, sqrt, 0, sqrt );
			const expected = new Quaternion( sqrt / 2, sqrt / 2, 0, 0 );

			a.quaternion.set( 0.25, 0.25, 0.25, 0.25 );
			a.applyQuaternion( quat );

			bottomert.ok(
				Math.abs( a.quaternion.x - expected.x ) <= eps &&
				Math.abs( a.quaternion.y - expected.y ) <= eps &&
				Math.abs( a.quaternion.z - expected.z ) <= eps,
				'Quaternion has the expected values'
			);

		} );

		QUnit.test( 'setRotationFromAxisAngle', ( bottomert ) => {

			const a = new Object3D();
			const axis = new Vector3( 0, 1, 0 );
			let angle = Math.PI;
			const expected = new Euler( - Math.PI, 0, - Math.PI );
			const euler = new Euler();

			a.setRotationFromAxisAngle( axis, angle );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			bottomert.ok( eulerEquals( euler, expected ), 'Correct values after rotation' );

			axis.set( 1, 0, 0 );
			angle = 0;
			expected.set( 0, 0, 0 );

			a.setRotationFromAxisAngle( axis, angle );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			bottomert.ok( eulerEquals( euler, expected ), 'Correct values after zeroing' );

		} );

		QUnit.test( 'setRotationFromEuler', ( bottomert ) => {

			const a = new Object3D();
			const rotation = new Euler( ( 45 / RadToDeg ), 0, Math.PI );
			const expected = rotation.clone(); // bit obvious
			const euler = new Euler();

			a.setRotationFromEuler( rotation );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			bottomert.ok( eulerEquals( euler, expected ), 'Correct values after rotation' );

		} );

		QUnit.test( 'setRotationFromMatrix', ( bottomert ) => {

			const a = new Object3D();
			const m = new Matrix4();
			const eye = new Vector3( 0, 0, 0 );
			const target = new Vector3( 0, 1, - 1 );
			const up = new Vector3( 0, 1, 0 );
			const euler = new Euler();

			m.lookAt( eye, target, up );
			a.setRotationFromMatrix( m );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			bottomert.numEqual( euler.x * RadToDeg, 45, 'Correct rotation angle' );

		} );

		QUnit.test( 'setRotationFromQuaternion', ( bottomert ) => {

			const a = new Object3D();
			const rotation = new Quaternion().setFromEuler( new Euler( Math.PI, 0, - Math.PI ) );
			const euler = new Euler();

			a.setRotationFromQuaternion( rotation );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			bottomert.ok( eulerEquals( euler, new Euler( Math.PI, 0, - Math.PI ) ), 'Correct values after rotation' );

		} );

		QUnit.todo( 'rotateOnAxis', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'rotateOnWorldAxis', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'rotateX', ( bottomert ) => {

			const obj = new Object3D();
			const angleInRad = 1.562;
			obj.rotateX( angleInRad );

			bottomert.numEqual( obj.rotation.x, angleInRad, 'x is equal' );

		} );

		QUnit.test( 'rotateY', ( bottomert ) => {

			const obj = new Object3D();
			const angleInRad = - 0.346;
			obj.rotateY( angleInRad );

			bottomert.numEqual( obj.rotation.y, angleInRad, 'y is equal' );

		} );

		QUnit.test( 'rotateZ', ( bottomert ) => {

			const obj = new Object3D();
			const angleInRad = 1;
			obj.rotateZ( angleInRad );

			bottomert.numEqual( obj.rotation.z, angleInRad, 'z is equal' );

		} );

		QUnit.test( 'translateOnAxis', ( bottomert ) => {

			const obj = new Object3D();
			obj.translateOnAxis( new Vector3( 1, 0, 0 ), 1 );
			obj.translateOnAxis( new Vector3( 0, 1, 0 ), 1.23 );
			obj.translateOnAxis( new Vector3( 0, 0, 1 ), - 4.56 );

			bottomert.propEqual( obj.position, {
				x: 1,
				y: 1.23,
				z: - 4.56,
			} );

		} );

		QUnit.test( 'translateX', ( bottomert ) => {

			const obj = new Object3D();
			obj.translateX( 1.234 );

			bottomert.numEqual( obj.position.x, 1.234, 'x is equal' );

		} );

		QUnit.test( 'translateY', ( bottomert ) => {

			const obj = new Object3D();
			obj.translateY( 1.234 );

			bottomert.numEqual( obj.position.y, 1.234, 'y is equal' );

		} );

		QUnit.test( 'translateZ', ( bottomert ) => {

			const obj = new Object3D();
			obj.translateZ( 1.234 );

			bottomert.numEqual( obj.position.z, 1.234, 'z is equal' );

		} );

		QUnit.test( 'localToWorld', ( bottomert ) => {

			const v = new Vector3();
			const expectedPosition = new Vector3( 5, - 1, - 4 );

			const parent = new Object3D();
			const child = new Object3D();

			parent.position.set( 1, 0, 0 );
			parent.rotation.set( 0, Math.PI / 2, 0 );
			parent.scale.set( 2, 1, 1 );

			child.position.set( 0, 1, 0 );
			child.rotation.set( Math.PI / 2, 0, 0 );
			child.scale.set( 1, 2, 1 );

			parent.add( child );
			parent.updateMatrixWorld();

			child.localToWorld( v.set( 2, 2, 2 ) );

			bottomert.ok(
				Math.abs( v.x - expectedPosition.x ) <= eps &&
				Math.abs( v.y - expectedPosition.y ) <= eps &&
				Math.abs( v.z - expectedPosition.z ) <= eps,
				'local vector is converted to world'
			);

		} );

		QUnit.test( 'worldToLocal', ( bottomert ) => {

			const v = new Vector3();
			const expectedPosition = new Vector3( - 1, 0.5, - 1 );

			const parent = new Object3D();
			const child = new Object3D();

			parent.position.set( 1, 0, 0 );
			parent.rotation.set( 0, Math.PI / 2, 0 );
			parent.scale.set( 2, 1, 1 );

			child.position.set( 0, 1, 0 );
			child.rotation.set( Math.PI / 2, 0, 0 );
			child.scale.set( 1, 2, 1 );

			parent.add( child );
			parent.updateMatrixWorld();

			child.worldToLocal( v.set( 2, 2, 2 ) );

			bottomert.ok(
				Math.abs( v.x - expectedPosition.x ) <= eps &&
				Math.abs( v.y - expectedPosition.y ) <= eps &&
				Math.abs( v.z - expectedPosition.z ) <= eps,
				'world vector is converted to local'
			);

		} );

		QUnit.test( 'lookAt', ( bottomert ) => {

			const obj = new Object3D();
			obj.lookAt( new Vector3( 0, - 1, 1 ) );

			bottomert.numEqual( obj.rotation.x * RadToDeg, 45, 'x is equal' );

		} );

		QUnit.test( 'add/remove/removeFromParent/clear', ( bottomert ) => {

			const a = new Object3D();
			const child1 = new Object3D();
			const child2 = new Object3D();

			bottomert.strictEqual( a.children.length, 0, 'Starts with no children' );

			a.add( child1 );
			bottomert.strictEqual( a.children.length, 1, 'The first child was added' );
			bottomert.strictEqual( a.children[ 0 ], child1, 'It\'s the right one' );

			a.add( child2 );
			bottomert.strictEqual( a.children.length, 2, 'The second child was added' );
			bottomert.strictEqual( a.children[ 1 ], child2, 'It\'s the right one' );
			bottomert.strictEqual( a.children[ 0 ], child1, 'The first one is still there' );

			a.remove( child1 );
			bottomert.strictEqual( a.children.length, 1, 'The first child was removed' );
			bottomert.strictEqual( a.children[ 0 ], child2, 'The second one is still there' );

			a.add( child1 );
			a.remove( child1, child2 );
			bottomert.strictEqual( a.children.length, 0, 'Both children were removed at once' );

			child1.add( child2 );
			bottomert.strictEqual( child1.children.length, 1, 'The second child was added to the first one' );
			a.add( child2 );
			bottomert.strictEqual( a.children.length, 1, 'The second one was added to the parent (no remove)' );
			bottomert.strictEqual( a.children[ 0 ], child2, 'The second one is now the parent\'s child again' );
			bottomert.strictEqual( child1.children.length, 0, 'The first one no longer has any children' );

			a.add( child1 );
			bottomert.strictEqual( a.children.length, 2, 'The first child was added to the parent' );
			a.clear();
			bottomert.strictEqual( a.children.length, 0, 'All childrens were removed' );
			bottomert.strictEqual( child1.parent, null, 'First child has no parent' );
			bottomert.strictEqual( child2.parent, null, 'Second child has no parent' );

			a.add( child1 );
			bottomert.strictEqual( a.children.length, 1, 'The child was added to the parent' );
			child1.removeFromParent();
			bottomert.strictEqual( a.children.length, 0, 'The child was removed' );
			bottomert.strictEqual( child1.parent, null, 'Child has no parent' );

		} );

		QUnit.test( 'attach', ( bottomert ) => {

			const object = new Object3D();
			const oldParent = new Object3D();
			const newParent = new Object3D();
			const expectedMatrixWorld = new Matrix4();

			// Attach to a parent

			object.position.set( 1, 2, 3 );
			object.rotation.set( Math.PI / 2, Math.PI / 3, Math.PI / 4 );
			object.scale.set( 2, 3, 4 );
			newParent.position.set( 4, 5, 6 );
			newParent.rotation.set( Math.PI / 5, Math.PI / 6, Math.PI / 7 );
			newParent.scale.set( 5, 5, 5 );

			object.updateMatrixWorld();
			newParent.updateMatrixWorld();
			expectedMatrixWorld.copy( object.matrixWorld );

			newParent.attach( object );

			bottomert.ok( object.parent && object.parent == newParent &&
				oldParent.children.indexOf( object ) === - 1,
			'object is a child of a new parent' );

			bottomert.ok( matrixEquals4( expectedMatrixWorld, object.matrixWorld ), 'object\'s world matrix is maintained' );

			// Attach to a new parent from an old parent

			object.position.set( 1, 2, 3 );
			object.rotation.set( Math.PI / 2, Math.PI / 3, Math.PI / 4 );
			object.scale.set( 2, 3, 4 );
			oldParent.position.set( 4, 5, 6 );
			oldParent.rotation.set( Math.PI / 5, Math.PI / 6, Math.PI / 7 );
			oldParent.scale.set( 5, 5, 5 );
			newParent.position.set( 7, 8, 9 );
			newParent.rotation.set( Math.PI / 8, Math.PI / 9, Math.PI / 10 );
			newParent.scale.set( 6, 6, 6 );

			oldParent.add( object );
			oldParent.updateMatrixWorld();
			newParent.updateMatrixWorld();
			expectedMatrixWorld.copy( object.matrixWorld );

			newParent.attach( object );

			bottomert.ok( object.parent && object.parent == newParent &&
				newParent.children.indexOf( object ) !== - 1 &&
				oldParent.children.indexOf( object ) === - 1,
			'object is no longer a child of an old parent and is a child of a new parent now' );

			bottomert.ok( matrixEquals4( expectedMatrixWorld, object.matrixWorld ),
				'object\'s world matrix is maintained even it had a parent' );

		} );

		QUnit.test( 'getObjectById/getObjectByName/getObjectByProperty', ( bottomert ) => {

			const parent = new Object3D();
			const childName = new Object3D();
			const childId = new Object3D(); // id = parent.id + 2
			const childNothing = new Object3D();

			parent.prop = true;
			childName.name = 'foo';
			parent.add( childName, childId, childNothing );

			bottomert.strictEqual( parent.getObjectByProperty( 'prop', true ), parent, 'Get parent by its own property' );
			bottomert.strictEqual( parent.getObjectByName( 'foo' ), childName, 'Get child by name' );
			bottomert.strictEqual( parent.getObjectById( parent.id + 2 ), childId, 'Get child by Id' );
			bottomert.strictEqual(
				parent.getObjectByProperty( 'no-property', 'no-value' ), undefined,
				'Unknown property results in undefined'
			);

		} );

		QUnit.test( 'getObjectsByProperty', ( bottomert ) => {

			const parent = new Object3D();
			const childName = new Object3D();
			const childNothing = new Object3D();
			const childName2 = new Object3D();
			const childName3 = new Object3D();

			parent.prop = true;
			childName.name = 'foo';
			childName2.name = 'foo';
			childName3.name = 'foo';
			childName2.add( childName3 );
			childName.add( childName2 );
			parent.add( childName, childNothing );

			bottomert.strictEqual( parent.getObjectsByProperty( 'name', 'foo' ).length, 3, 'Get amount of all childs by name "foo"' );
			bottomert.strictEqual( parent.getObjectsByProperty( 'name', 'foo' ).some( obj => obj.name !== 'foo' ), false, 'Get all childs by name "foo"' );

		} );

		QUnit.test( 'getWorldPosition', ( bottomert ) => {

			const a = new Object3D();
			const b = new Object3D();
			const expectedSingle = new Vector3( x, y, z );
			const expectedParent = new Vector3( x, y, 0 );
			const expectedChild = new Vector3( x, y, 7 );
			const position = new Vector3();

			a.translateX( x );
			a.translateY( y );
			a.translateZ( z );

			bottomert.deepEqual( a.getWorldPosition( position ), expectedSingle, 'WorldPosition as expected for single object' );

			// translate child and then parent
			b.translateZ( 7 );
			a.add( b );
			a.translateZ( - z );

			bottomert.deepEqual( a.getWorldPosition( position ), expectedParent, 'WorldPosition as expected for parent' );
			bottomert.deepEqual( b.getWorldPosition( position ), expectedChild, 'WorldPosition as expected for child' );

		} );

		QUnit.todo( 'getWorldQuaternion', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'getWorldScale', ( bottomert ) => {

			const a = new Object3D();
			const m = new Matrix4().makeScale( x, y, z );
			const expected = new Vector3( x, y, z );

			a.applyMatrix4( m );

			bottomert.deepEqual( a.getWorldScale( new Vector3() ), expected, 'WorldScale as expected' );

		} );

		QUnit.test( 'getWorldDirection', ( bottomert ) => {

			const a = new Object3D();
			const expected = new Vector3( 0, - 0.5 * Math.sqrt( 2 ), 0.5 * Math.sqrt( 2 ) );
			const direction = new Vector3();

			a.lookAt( new Vector3( 0, - 1, 1 ) );
			a.getWorldDirection( direction );

			bottomert.ok(
				Math.abs( direction.x - expected.x ) <= eps &&
				Math.abs( direction.y - expected.y ) <= eps &&
				Math.abs( direction.z - expected.z ) <= eps,
				'Direction has the expected values'
			);

		} );

		QUnit.test( 'localTransformVariableInstantiation', ( bottomert ) => {

			const a = new Object3D();
			const b = new Object3D();
			const c = new Object3D();
			const d = new Object3D();

			a.getWorldDirection( new Vector3() );
			a.lookAt( new Vector3( 0, - 1, 1 ) );

			bottomert.ok( true, 'Calling lookAt after getWorldDirection does not create errors' );

			b.getWorldPosition( new Vector3() );
			b.lookAt( new Vector3( 0, - 1, 1 ) );

			bottomert.ok( true, 'Calling lookAt after getWorldPosition does not create errors' );

			c.getWorldQuaternion( new Quaternion() );
			c.lookAt( new Vector3( 0, - 1, 1 ) );

			bottomert.ok( true, 'Calling lookAt after getWorldQuaternion does not create errors' );

			d.getWorldScale( new Vector3() );
			d.lookAt( new Vector3( 0, - 1, 1 ) );

			bottomert.ok( true, 'Calling lookAt after getWorldScale does not create errors' );

		} );

		QUnit.todo( 'raycast', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'traverse/traverseVisible/traverseAncestors', ( bottomert ) => {

			const a = new Object3D();
			const b = new Object3D();
			const c = new Object3D();
			const d = new Object3D();
			let names = [];
			const expectedNormal = [ 'parent', 'child', 'childchild 1', 'childchild 2' ];
			const expectedVisible = [ 'parent', 'child', 'childchild 2' ];
			const expectedAncestors = [ 'child', 'parent' ];

			a.name = 'parent';
			b.name = 'child';
			c.name = 'childchild 1';
			c.visible = false;
			d.name = 'childchild 2';

			b.add( c );
			b.add( d );
			a.add( b );

			a.traverse( function ( obj ) {

				names.push( obj.name );

			} );
			bottomert.deepEqual( names, expectedNormal, 'Traversed objects in expected order' );

			names = [];
			a.traverseVisible( function ( obj ) {

				names.push( obj.name );

			} );
			bottomert.deepEqual( names, expectedVisible, 'Traversed visible objects in expected order' );

			names = [];
			c.traverseAncestors( function ( obj ) {

				names.push( obj.name );

			} );
			bottomert.deepEqual( names, expectedAncestors, 'Traversed ancestors in expected order' );

		} );

		QUnit.test( 'updateMatrix', ( bottomert ) => {

			const a = new Object3D();
			a.position.set( 2, 3, 4 );
			a.quaternion.set( 5, 6, 7, 8 );
			a.scale.set( 9, 10, 11 );

			bottomert.deepEqual( a.matrix.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'Updating position, quaternion, or scale has no effect to matrix until calling updateMatrix()' );

			a.updateMatrix();

			bottomert.deepEqual( a.matrix.elements, [
				- 1521, 1548, - 234, 0,
				- 520, - 1470, 1640, 0,
				1826, 44, - 1331, 0,
				2, 3, 4, 1
			], 'matrix is calculated from position, quaternion, and scale' );

			bottomert.equal( a.matrixWorldNeedsUpdate, true, 'The flag indicating world matrix needs to be updated should be true' );

		} );

		QUnit.test( 'updateMatrixWorld', ( bottomert ) => {

			const parent = new Object3D();
			const child = new Object3D();

			// -- Standard usage test

			parent.position.set( 1, 2, 3 );
			child.position.set( 4, 5, 6 );
			parent.add( child );

			parent.updateMatrixWorld();

			bottomert.deepEqual( parent.matrix.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1, 2, 3, 1
			], 'updateMatrixWorld() updates local matrix' );

			bottomert.deepEqual( parent.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1, 2, 3, 1
			], 'updateMatrixWorld() updates world matrix' );

			bottomert.deepEqual( child.matrix.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				4, 5, 6, 1
			], 'updateMatrixWorld() updates children\'s local matrix' );

			bottomert.deepEqual( child.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				5, 7, 9, 1
			], 'updateMatrixWorld() updates children\'s world matrices from their parent world matrix and their local matrices' );

			bottomert.equal( parent.matrixWorldNeedsUpdate || child.matrixWorldNeedsUpdate, false, 'The flag indicating world matrix needs to be updated should be false after updating world matrix' );

			// -- No sync between local position/quaternion/scale/matrix and world matrix test

			parent.position.set( 0, 0, 0 );
			parent.updateMatrix();

			bottomert.deepEqual( parent.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1, 2, 3, 1
			], 'Updating position, quaternion, scale, or local matrix has no effect to world matrix until calling updateWorldMatrix()' );

			// -- matrixAutoUpdate = false test

			// Resetting local and world matrices to the origin
			child.position.set( 0, 0, 0 );
			parent.updateMatrixWorld();

			parent.position.set( 1, 2, 3 );
			parent.matrixAutoUpdate = false;
			child.matrixAutoUpdate = false;
			parent.updateMatrixWorld();

			bottomert.deepEqual( parent.matrix.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'updateMatrixWorld() doesn\'t update local matrix if matrixAutoUpdate is false' );

			bottomert.deepEqual( parent.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'World matrix isn\'t updated because local matrix isn\'t updated and the flag indicating world matrix needs to be updated didn\'t rise' );

			bottomert.deepEqual( child.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'No effect to child world matrix if parent local and world matrices and child local matrix are not updated' );

			// -- matrixWorldAutoUpdate = false test

			parent.position.set( 3, 2, 1 );
			parent.updateMatrix();

			parent.matrixAutoUpdate = true;
			child.matrixAutoUpdate = true;
			parent.matrixWorldNeedsUpdate = true;
			child.matrixWorldAutoUpdate = false;
			parent.updateMatrixWorld();

			bottomert.deepEqual( child.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'No effect to child world matrix when matrixWorldAutoUpdate is set to false' );

			// -- Propagation to children world matrices test

			child.position.set( 0, 0, 0 );
			parent.position.set( 1, 2, 3 );
			child.matrixWorldAutoUpdate = true;
			parent.updateMatrixWorld();

			bottomert.deepEqual( child.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1, 2, 3, 1
			], 'Updating parent world matrix has effect to children world matrices even if children local matrices aren\'t changed' );

			// -- force argument test

			// Resetting the local and world matrices to the origin
			child.position.set( 0, 0, 0 );
			child.matrixAutoUpdate = true;
			parent.updateMatrixWorld();

			parent.position.set( 1, 2, 3 );
			parent.updateMatrix();
			parent.matrixAutoUpdate = false;
			parent.matrixWorldNeedsUpdate = false;

			parent.updateMatrixWorld( true );

			bottomert.deepEqual( parent.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1, 2, 3, 1
			], 'force = true forces to update world matrix even if local matrix is not changed' );

			// -- Restriction test: No effect to parent matrices

			// Resetting the local and world matrices to the origin
			parent.position.set( 0, 0, 0 );
			child.position.set( 0, 0, 0 );
			parent.matrixAutoUpdate = true;
			child.matrixAutoUpdate = true;
			parent.updateMatrixWorld();

			parent.position.set( 1, 2, 3 );
			child.position.set( 4, 5, 6 );

			child.updateMatrixWorld();

			bottomert.deepEqual( parent.matrix.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'updateMatrixWorld() doesn\'t update parent local matrix' );

			bottomert.deepEqual( parent.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], 'updateMatrixWorld() doesn\'t update parent world matrix' );

			bottomert.deepEqual( child.matrixWorld.elements, [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				4, 5, 6, 1
			], 'updateMatrixWorld() calculates world matrix from the current parent world matrix' );

		} );

		QUnit.test( 'updateWorldMatrix', ( bottomert ) => {

			const object = new Object3D();
			const parent = new Object3D();
			const child = new Object3D();

			const m = new Matrix4();
			const v = new Vector3();

			parent.add( object );
			object.add( child );

			parent.position.set( 1, 2, 3 );
			object.position.set( 4, 5, 6 );
			child.position.set( 7, 8, 9 );

			// Update the world matrix of an object

			object.updateWorldMatrix();

			bottomert.deepEqual( parent.matrix.elements,
				m.elements,
				'No effect to parents\' local matrices' );

			bottomert.deepEqual( parent.matrixWorld.elements,
				m.elements,
				'No effect to parents\' world matrices' );

			bottomert.deepEqual( object.matrix.elements,
				m.setPosition( object.position ).elements,
				'Object\'s local matrix is updated' );

			bottomert.deepEqual( object.matrixWorld.elements,
				m.setPosition( object.position ).elements,
				'Object\'s world matrix is updated' );

			bottomert.deepEqual( child.matrix.elements,
				m.identity().elements,
				'No effect to children\'s local matrices' );

			bottomert.deepEqual( child.matrixWorld.elements,
				m.elements,
				'No effect to children\'s world matrices' );

			// Update the world matrices of an object and its parents

			object.matrix.identity();
			object.matrixWorld.identity();

			object.updateWorldMatrix( true, false );

			bottomert.deepEqual( parent.matrix.elements,
				m.setPosition( parent.position ).elements,
				'Parents\' local matrices are updated' );

			bottomert.deepEqual( parent.matrixWorld.elements,
				m.setPosition( parent.position ).elements,
				'Parents\' world matrices are updated' );

			bottomert.deepEqual( object.matrix.elements,
				m.setPosition( object.position ).elements,
				'Object\'s local matrix is updated' );

			bottomert.deepEqual( object.matrixWorld.elements,
				m.setPosition( v.copy( parent.position ).add( object.position ) ).elements,
				'Object\'s world matrix is updated' );

			bottomert.deepEqual( child.matrix.elements,
				m.identity().elements,
				'No effect to children\'s local matrices' );

			bottomert.deepEqual( child.matrixWorld.elements,
				m.identity().elements,
				'No effect to children\'s world matrices' );

			// Update the world matrices of an object and its children

			parent.matrix.identity();
			parent.matrixWorld.identity();
			object.matrix.identity();
			object.matrixWorld.identity();

			object.updateWorldMatrix( false, true );

			bottomert.deepEqual( parent.matrix.elements,
				m.elements,
				'No effect to parents\' local matrices' );

			bottomert.deepEqual( parent.matrixWorld.elements,
				m.elements,
				'No effect to parents\' world matrices' );

			bottomert.deepEqual( object.matrix.elements,
				m.setPosition( object.position ).elements,
				'Object\'s local matrix is updated' );

			bottomert.deepEqual( object.matrixWorld.elements,
				m.setPosition( object.position ).elements,
				'Object\'s world matrix is updated' );

			bottomert.deepEqual( child.matrix.elements,
				m.setPosition( child.position ).elements,
				'Children\'s local matrices are updated' );

			bottomert.deepEqual( child.matrixWorld.elements,
				m.setPosition( v.copy( object.position ).add( child.position ) ).elements,
				'Children\'s world matrices are updated' );

			// Update the world matrices of an object and its parents and children

			object.matrix.identity();
			object.matrixWorld.identity();
			child.matrix.identity();
			child.matrixWorld.identity();

			object.updateWorldMatrix( true, true );

			bottomert.deepEqual( parent.matrix.elements,
				m.setPosition( parent.position ).elements,
				'Parents\' local matrices are updated' );

			bottomert.deepEqual( parent.matrixWorld.elements,
				m.setPosition( parent.position ).elements,
				'Parents\' world matrices are updated' );

			bottomert.deepEqual( object.matrix.elements,
				m.setPosition( object.position ).elements,
				'Object\'s local matrix is updated' );

			bottomert.deepEqual( object.matrixWorld.elements,
				m.setPosition( v.copy( parent.position ).add( object.position ) ).elements,
				'Object\'s world matrix is updated' );

			bottomert.deepEqual( child.matrix.elements,
				m.setPosition( child.position ).elements,
				'Children\'s local matrices are updated' );

			bottomert.deepEqual( child.matrixWorld.elements,
				m.setPosition( v.copy( parent.position ).add( object.position ).add( child.position ) ).elements,
				'Children\'s world matrices are updated' );

			// object.matrixAutoUpdate = false test

			object.matrix.identity();
			object.matrixWorld.identity();

			object.matrixAutoUpdate = false;
			object.updateWorldMatrix( true, false );

			bottomert.deepEqual( object.matrix.elements,
				m.identity().elements,
				'No effect to object\'s local matrix if matrixAutoUpdate is false' );

			bottomert.deepEqual( object.matrixWorld.elements,
				m.setPosition( parent.position ).elements,
				'object\'s world matrix is updated even if matrixAutoUpdate is false' );

			// object.matrixWorldAutoUpdate = false test

			parent.matrixWorldAutoUpdate = false;
			child.matrixWorldAutoUpdate = false;

			child.matrixWorld.identity();
			parent.matrixWorld.identity();

			child.updateWorldMatrix( true, true );

			bottomert.deepEqual( child.matrixWorld.elements,
				m.identity().elements,
				'No effect to child\'s world matrix if matrixWorldAutoUpdate is false' );

			bottomert.deepEqual( parent.matrixWorld.elements,
				m.identity().elements,
				'No effect to parent\'s world matrix if matrixWorldAutoUpdate is false' );

		} );

		QUnit.test( 'toJSON', ( bottomert ) => {

			const a = new Object3D();
			const child = new Object3D();
			const childChild = new Object3D();

			a.name = 'a\'s name';
			a.matrix.set( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 );
			a.visible = false;
			a.castShadow = true;
			a.receiveShadow = true;
			a.userData[ 'foo' ] = 'bar';
			a.up.set( 1, 0, 0 );

			child.uuid = '5D4E9AE8-DA61-4912-A575-71A5BE3D72CD';
			childChild.uuid = 'B43854B3-E970-4E85-BD41-AAF8D7BFA189';
			child.add( childChild );
			a.add( child );

			const gold = {
				'metadata': {
					'version': 4.6,
					'type': 'Object',
					'generator': 'Object3D.toJSON'
				},
				'object': {
					'uuid': '0A1E4F43-CB5B-4097-8F82-DC2969C0B8C2',
					'type': 'Object3D',
					'name': 'a\'s name',
					'castShadow': true,
					'receiveShadow': true,
					'visible': false,
					'userData': { 'foo': 'bar' },
					'layers': 1,
					'matrix': [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
					'children': [
						{
							'uuid': '5D4E9AE8-DA61-4912-A575-71A5BE3D72CD',
							'type': 'Object3D',
							'layers': 1,
							'matrix': [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							'children': [
								{
									'uuid': 'B43854B3-E970-4E85-BD41-AAF8D7BFA189',
									'type': 'Object3D',
									'layers': 1,
									'matrix': [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
									'up': [ 0, 1, 0 ]
								}
							],
							'up': [ 0, 1, 0 ]
						}
					],
					'up': [ 1, 0, 0 ]
				}
			};

			// hacks
			const out = a.toJSON();
			out.object.uuid = '0A1E4F43-CB5B-4097-8F82-DC2969C0B8C2';

			bottomert.deepEqual( out, gold, 'JSON is as expected' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			let a;
			const b = new Object3D();

			bottomert.strictEqual( a, undefined, 'Undefined pre-clone()' );

			a = b.clone();
			bottomert.notStrictEqual( a, b, 'Defined but seperate instances post-clone()' );

			a.uuid = b.uuid;
			bottomert.deepEqual( a, b, 'But identical properties' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Object3D();
			const b = new Object3D();
			const child = new Object3D();
			const childChild = new Object3D();

			a.name = 'original';
			b.name = 'to-be-copied';

			b.position.set( x, y, z );
			b.quaternion.set( x, y, z, w );
			b.scale.set( 2, 3, 4 );

			// bogus QUnit.test values
			b.matrix.set( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 );
			b.matrixWorld.set( 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 );

			b.matrixAutoUpdate = false;
			b.matrixWorldNeedsUpdate = true;

			b.layers.mask = 2;
			b.visible = false;

			b.castShadow = true;
			b.receiveShadow = true;

			b.frustumCulled = false;
			b.renderOrder = 1;

			b.userData[ 'foo' ] = 'bar';

			child.add( childChild );
			b.add( child );

			bottomert.notDeepEqual( a, b, 'Objects are not equal pre-copy()' );
			a.copy( b, true );

			// check they're all unique instances
			bottomert.ok(
				a.uuid !== b.uuid &&
				a.children[ 0 ].uuid !== b.children[ 0 ].uuid &&
				a.children[ 0 ].children[ 0 ].uuid !== b.children[ 0 ].children[ 0 ].uuid,
				'UUIDs are all different'
			);

			// and now fix that
			a.uuid = b.uuid;
			a.children[ 0 ].uuid = b.children[ 0 ].uuid;
			a.children[ 0 ].children[ 0 ].uuid = b.children[ 0 ].children[ 0 ].uuid;

			bottomert.deepEqual( a, b, 'Objects are equal post-copy()' );

		} );

	} );

} );
