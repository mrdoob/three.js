/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Object3D } from '../../../../src/core/Object3D';
import { Vector3 } from '../../../../src/math/Vector3';
import { Euler } from '../../../../src/math/Euler';
import { Quaternion } from '../../../../src/math/Quaternion';
import { Matrix4 } from '../../../../src/math/Matrix4';
import {
	x,
	y,
	z,
	w,
	eps
} from '../math/Constants.tests';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Object3D', () => {

		var RadToDeg = 180 / Math.PI;

		var eulerEquals = function ( a, b, tolerance ) {

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
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// STATIC STUFF
		QUnit.todo( "DefaultUp", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "DefaultMatrixAutoUpdate", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isObject3D", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "onBeforeRender", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "onAfterRender", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "applyMatrix", ( assert ) => {

			var a = new Object3D();
			var m = new Matrix4();
			var expectedPos = new Vector3( x, y, z );
			var expectedQuat = new Quaternion( 0.5 * Math.sqrt( 2 ), 0, 0, 0.5 * Math.sqrt( 2 ) );

			m.makeRotationX( Math.PI / 2 );
			m.setPosition( new Vector3( x, y, z ) );

			a.applyMatrix( m );

			assert.deepEqual( a.position, expectedPos, "Position has the expected values" );
			assert.ok(
				Math.abs( a.quaternion.x - expectedQuat.x ) <= eps &&
				Math.abs( a.quaternion.y - expectedQuat.y ) <= eps &&
				Math.abs( a.quaternion.z - expectedQuat.z ) <= eps,
				"Quaternion has the expected values"
			);

		} );

		QUnit.test( "applyQuaternion", ( assert ) => {

			var a = new Object3D();
			var sqrt = 0.5 * Math.sqrt( 2 );
			var quat = new Quaternion( 0, sqrt, 0, sqrt );
			var expected = new Quaternion( sqrt / 2, sqrt / 2, 0, 0 );

			a.quaternion.set( 0.25, 0.25, 0.25, 0.25 );
			a.applyQuaternion( quat );

			assert.ok(
				Math.abs( a.quaternion.x - expected.x ) <= eps &&
				Math.abs( a.quaternion.y - expected.y ) <= eps &&
				Math.abs( a.quaternion.z - expected.z ) <= eps,
				"Quaternion has the expected values"
			);

		} );

		QUnit.test( "setRotationFromAxisAngle", ( assert ) => {

			var a = new Object3D();
			var axis = new Vector3( 0, 1, 0 );
			var angle = Math.PI;
			var expected = new Euler( - Math.PI, 0, - Math.PI );
			var euler = new Euler();

			a.setRotationFromAxisAngle( axis, angle );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			assert.ok( eulerEquals( euler, expected ), "Correct values after rotation" );

			axis.set( 1, 0, 0 );
			var angle = 0;
			expected.set( 0, 0, 0 );

			a.setRotationFromAxisAngle( axis, angle );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			assert.ok( eulerEquals( euler, expected ), "Correct values after zeroing" );

		} );

		QUnit.test( "setRotationFromEuler", ( assert ) => {

			var a = new Object3D();
			var rotation = new Euler( ( 45 / RadToDeg ), 0, Math.PI );
			var expected = rotation.clone(); // bit obvious
			var euler = new Euler();

			a.setRotationFromEuler( rotation );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			assert.ok( eulerEquals( euler, expected ), "Correct values after rotation" );

		} );

		QUnit.test( "setRotationFromMatrix", ( assert ) => {

			var a = new Object3D();
			var m = new Matrix4();
			var eye = new Vector3( 0, 0, 0 );
			var target = new Vector3( 0, 1, - 1 );
			var up = new Vector3( 0, 1, 0 );
			var euler = new Euler();

			m.lookAt( eye, target, up );
			a.setRotationFromMatrix( m );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			assert.numEqual( euler.x * RadToDeg, 45, "Correct rotation angle" );

		} );

		QUnit.test( "setRotationFromQuaternion", ( assert ) => {

			var a = new Object3D();
			var rotation = new Quaternion().setFromEuler( new Euler( Math.PI, 0, - Math.PI ) );
			var euler = new Euler();

			a.setRotationFromQuaternion( rotation );
			euler.setFromQuaternion( a.getWorldQuaternion( new Quaternion() ) );
			assert.ok( eulerEquals( euler, new Euler( Math.PI, 0, - Math.PI ) ), "Correct values after rotation" );

		} );

		QUnit.todo( "rotateOnAxis", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "rotateOnWorldAxis", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "rotateX", ( assert ) => {

			var obj = new Object3D();

			var angleInRad = 1.562;
			obj.rotateX( angleInRad );

			assert.numEqual( obj.rotation.x, angleInRad, "x is equal" );

		} );

		QUnit.test( "rotateY", ( assert ) => {

			var obj = new Object3D();

			var angleInRad = - 0.346;
			obj.rotateY( angleInRad );

			assert.numEqual( obj.rotation.y, angleInRad, "y is equal" );

		} );

		QUnit.test( "rotateZ", ( assert ) => {

			var obj = new Object3D();

			var angleInRad = 1;
			obj.rotateZ( angleInRad );

			assert.numEqual( obj.rotation.z, angleInRad, "z is equal" );

		} );

		QUnit.test( "translateOnAxis", ( assert ) => {

			var obj = new Object3D();

			obj.translateOnAxis( new Vector3( 1, 0, 0 ), 1 );
			obj.translateOnAxis( new Vector3( 0, 1, 0 ), 1.23 );
			obj.translateOnAxis( new Vector3( 0, 0, 1 ), - 4.56 );

			assert.propEqual( obj.position, {
				x: 1,
				y: 1.23,
				z: - 4.56
			} );

		} );

		QUnit.test( "translateX", ( assert ) => {

			var obj = new Object3D();
			obj.translateX( 1.234 );

			assert.numEqual( obj.position.x, 1.234, "x is equal" );

		} );

		QUnit.test( "translateY", ( assert ) => {

			var obj = new Object3D();
			obj.translateY( 1.234 );

			assert.numEqual( obj.position.y, 1.234, "y is equal" );

		} );

		QUnit.test( "translateZ", ( assert ) => {

			var obj = new Object3D();
			obj.translateZ( 1.234 );

			assert.numEqual( obj.position.z, 1.234, "z is equal" );

		} );

		QUnit.todo( "localToWorld", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "worldToLocal", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "lookAt", ( assert ) => {

			var obj = new Object3D();
			obj.lookAt( new Vector3( 0, - 1, 1 ) );

			assert.numEqual( obj.rotation.x * RadToDeg, 45, "x is equal" );

		} );

		QUnit.test( "add/remove", ( assert ) => {

			var a = new Object3D();
			var child1 = new Object3D();
			var child2 = new Object3D();

			assert.strictEqual( a.children.length, 0, "Starts with no children" );

			a.add( child1 );
			assert.strictEqual( a.children.length, 1, "The first child was added" );
			assert.strictEqual( a.children[ 0 ], child1, "It's the right one" );

			a.add( child2 );
			assert.strictEqual( a.children.length, 2, "The second child was added" );
			assert.strictEqual( a.children[ 1 ], child2, "It's the right one" );
			assert.strictEqual( a.children[ 0 ], child1, "The first one is still there" );

			a.remove( child1 );
			assert.strictEqual( a.children.length, 1, "The first child was removed" );
			assert.strictEqual( a.children[ 0 ], child2, "The second one is still there" );

			a.add( child1 );
			a.remove( child1, child2 );
			assert.strictEqual( a.children.length, 0, "Both children were removed at once" );

			child1.add( child2 );
			assert.strictEqual( child1.children.length, 1, "The second child was added to the first one" );
			a.add( child2 );
			assert.strictEqual( a.children.length, 1, "The second one was added to the parent (no remove)" );
			assert.strictEqual( a.children[ 0 ], child2, "The second one is now the parent's child again" );
			assert.strictEqual( child1.children.length, 0, "The first one no longer has any children" );

		} );

		QUnit.test( "getObjectById/getObjectByName/getObjectByProperty", ( assert ) => {

			var parent = new Object3D();
			var childName = new Object3D();
			var childId = new Object3D(); // id = parent.id + 2
			var childNothing = new Object3D();

			parent.prop = true;
			childName.name = "foo";
			parent.add( childName, childId, childNothing );

			assert.strictEqual( parent.getObjectByProperty( 'prop', true ), parent, "Get parent by its own property" );
			assert.strictEqual( parent.getObjectByName( "foo" ), childName, "Get child by name" );
			assert.strictEqual( parent.getObjectById( parent.id + 2 ), childId, "Get child by Id" );
			assert.strictEqual(
				parent.getObjectByProperty( 'no-property', 'no-value' ), undefined,
				"Unknown property results in undefined"
			);

		} );

		QUnit.test( "getWorldPosition", ( assert ) => {

			var a = new Object3D();
			var b = new Object3D();
			var expectedSingle = new Vector3( x, y, z );
			var expectedParent = new Vector3( x, y, 0 );
			var expectedChild = new Vector3( x, y, 7 + ( z - z ) );
			var position = new Vector3();

			a.translateX( x );
			a.translateY( y );
			a.translateZ( z );

			assert.deepEqual( a.getWorldPosition( position ), expectedSingle, "WorldPosition as expected for single object" );

			// translate child and then parent
			b.translateZ( 7 );
			a.add( b );
			a.translateZ( - z );

			assert.deepEqual( a.getWorldPosition( position ), expectedParent, "WorldPosition as expected for parent" );
			assert.deepEqual( b.getWorldPosition( position ), expectedChild, "WorldPosition as expected for child" );

		} );

		QUnit.todo( "getWorldQuaternion", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getWorldScale", ( assert ) => {

			var a = new Object3D();
			var m = new Matrix4().makeScale( x, y, z );
			var expected = new Vector3( x, y, z );

			a.applyMatrix( m );

			assert.deepEqual( a.getWorldScale( new Vector3() ), expected, "WorldScale as expected" );

		} );

		QUnit.test( "getWorldDirection", ( assert ) => {

			var a = new Object3D();
			var expected = new Vector3( 0, - 0.5 * Math.sqrt( 2 ), 0.5 * Math.sqrt( 2 ) );
			var direction = new Vector3();

			a.lookAt( new Vector3( 0, - 1, 1 ) );
			a.getWorldDirection( direction );

			assert.ok(
				Math.abs( direction.x - expected.x ) <= eps &&
				Math.abs( direction.y - expected.y ) <= eps &&
				Math.abs( direction.z - expected.z ) <= eps,
				"Direction has the expected values"
			);

		} );

		QUnit.todo( "raycast", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "traverse/traverseVisible/traverseAncestors", ( assert ) => {

			var a = new Object3D();
			var b = new Object3D();
			var c = new Object3D();
			var d = new Object3D();
			var names = [];
			var expectedNormal = [ "parent", "child", "childchild 1", "childchild 2" ];
			var expectedVisible = [ "parent", "child", "childchild 2" ];
			var expectedAncestors = [ "child", "parent" ];

			a.name = "parent";
			b.name = "child";
			c.name = "childchild 1";
			c.visible = false;
			d.name = "childchild 2";

			b.add( c );
			b.add( d );
			a.add( b );

			a.traverse( function ( obj ) {

				names.push( obj.name );

			} );
			assert.deepEqual( names, expectedNormal, "Traversed objects in expected order" );

			var names = [];
			a.traverseVisible( function ( obj ) {

				names.push( obj.name );

			} );
			assert.deepEqual( names, expectedVisible, "Traversed visible objects in expected order" );

			var names = [];
			c.traverseAncestors( function ( obj ) {

				names.push( obj.name );

			} );
			assert.deepEqual( names, expectedAncestors, "Traversed ancestors in expected order" );

		} );

		QUnit.todo( "updateMatrix", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "updateMatrixWorld", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "toJSON", ( assert ) => {

			var a = new Object3D();
			var child = new Object3D();
			var childChild = new Object3D();

			a.name = "a's name";
			a.matrix.set( 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 );
			a.visible = false;
			a.castShadow = true;
			a.receiveShadow = true;
			a.userData[ "foo" ] = "bar";

			child.uuid = "5D4E9AE8-DA61-4912-A575-71A5BE3D72CD";
			childChild.uuid = "B43854B3-E970-4E85-BD41-AAF8D7BFA189";
			child.add( childChild );
			a.add( child );

			var gold = {
				"metadata": {
					"version": 4.5,
					"type": "Object",
					"generator": "Object3D.toJSON"
				},
				"object": {
					"uuid": "0A1E4F43-CB5B-4097-8F82-DC2969C0B8C2",
					"type": "Object3D",
					"name": "a's name",
					"castShadow": true,
					"receiveShadow": true,
					"visible": false,
					"userData": { "foo": "bar" },
					"layers": 1,
					"matrix": [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
					"children": [
						{
							"uuid": "5D4E9AE8-DA61-4912-A575-71A5BE3D72CD",
							"type": "Object3D",
							"layers": 1,
							"matrix": [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ],
							"children": [
								{
									"uuid": "B43854B3-E970-4E85-BD41-AAF8D7BFA189",
									"type": "Object3D",
									"layers": 1,
									"matrix": [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
								}
							]
						}
					]
				}
			};

			// hacks
			var out = a.toJSON();
			out.object.uuid = "0A1E4F43-CB5B-4097-8F82-DC2969C0B8C2";

			assert.deepEqual( out, gold, "JSON is as expected" );

		} );

		QUnit.test( "clone", ( assert ) => {

			var a;
			var b = new Object3D();

			assert.strictEqual( a, undefined, "Undefined pre-clone()" );

			a = b.clone();
			assert.notStrictEqual( a, b, "Defined but seperate instances post-clone()" );

			a.uuid = b.uuid;
			assert.deepEqual( a, b, "But identical properties" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var a = new Object3D();
			var b = new Object3D();
			var child = new Object3D();
			var childChild = new Object3D();

			a.name = "original";
			b.name = "to-be-copied";

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

			b.userData[ "foo" ] = "bar";

			child.add( childChild );
			b.add( child );

			assert.notDeepEqual( a, b, "Objects are not equal pre-copy()" );
			a.copy( b, true );

			// check they're all unique instances
			assert.ok(
				a.uuid !== b.uuid &&
				a.children[ 0 ].uuid !== b.children[ 0 ].uuid &&
				a.children[ 0 ].children[ 0 ].uuid !== b.children[ 0 ].children[ 0 ].uuid,
				"UUIDs are all different"
			);

			// and now fix that
			a.uuid = b.uuid;
			a.children[ 0 ].uuid = b.children[ 0 ].uuid;
			a.children[ 0 ].children[ 0 ].uuid = b.children[ 0 ].children[ 0 ].uuid;

			assert.deepEqual( a, b, "Objects are equal post-copy()" );

		} );

	} );

} );
