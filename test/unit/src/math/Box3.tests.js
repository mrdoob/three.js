/**
 * @author bhouston / http://exocortex.com
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Box3 } from '../../../../src/math/Box3';
import { Sphere } from '../../../../src/math/Sphere';
import { Triangle } from '../../../../src/math/Triangle';
import { Plane } from '../../../../src/math/Plane';
import { Vector3 } from '../../../../src/math/Vector3';
import { Matrix4 } from '../../../../src/math/Matrix4';
import { Mesh } from '../../../../src/objects/Mesh';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import {
	BoxGeometry,
	BoxBufferGeometry
} from '../../../../src/geometries/BoxGeometry';
import {
	negInf3,
	posInf3,
	zero3,
	one3,
	two3
} from './Constants.tests';

function compareBox( a, b, threshold ) {

	threshold = threshold || 0.0001;
	return ( a.min.distanceTo( b.min ) < threshold &&
	a.max.distanceTo( b.max ) < threshold );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Box3', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Box3();
			assert.ok( a.min.equals( posInf3 ), "Passed!" );
			assert.ok( a.max.equals( negInf3 ), "Passed!" );

			var a = new Box3( zero3.clone(), zero3.clone() );
			assert.ok( a.min.equals( zero3 ), "Passed!" );
			assert.ok( a.max.equals( zero3 ), "Passed!" );

			var a = new Box3( zero3.clone(), one3.clone() );
			assert.ok( a.min.equals( zero3 ), "Passed!" );
			assert.ok( a.max.equals( one3 ), "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isBox3", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "set", ( assert ) => {

			var a = new Box3();

			a.set( zero3, one3 );
			assert.ok( a.min.equals( zero3 ), "Passed!" );
			assert.ok( a.max.equals( one3 ), "Passed!" );

		} );

		QUnit.todo( "setFromArray", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setFromBufferAttribute", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var bigger = new BufferAttribute( new Float32Array( [
				- 2, - 2, - 2, 2, 2, 2, 1.5, 1.5, 1.5, 0, 0, 0
			] ), 3 );
			var smaller = new BufferAttribute( new Float32Array( [
				- 0.5, - 0.5, - 0.5, 0.5, 0.5, 0.5, 0, 0, 0
			] ), 3 );
			var newMin = new Vector3( - 2, - 2, - 2 );
			var newMax = new Vector3( 2, 2, 2 );

			a.setFromBufferAttribute( bigger );
			assert.ok( a.min.equals( newMin ), "Bigger box: correct new minimum" );
			assert.ok( a.max.equals( newMax ), "Bigger box: correct new maximum" );

			newMin.set( - 0.5, - 0.5, - 0.5 );
			newMax.set( 0.5, 0.5, 0.5 );

			a.setFromBufferAttribute( smaller );
			assert.ok( a.min.equals( newMin ), "Smaller box: correct new minimum" );
			assert.ok( a.max.equals( newMax ), "Smaller box: correct new maximum" );

		} );

		QUnit.test( "setFromPoints", ( assert ) => {

			var a = new Box3();

			a.setFromPoints( [ zero3, one3, two3 ] );
			assert.ok( a.min.equals( zero3 ), "Passed!" );
			assert.ok( a.max.equals( two3 ), "Passed!" );

			a.setFromPoints( [ one3 ] );
			assert.ok( a.min.equals( one3 ), "Passed!" );
			assert.ok( a.max.equals( one3 ), "Passed!" );

			a.setFromPoints( [] );
			assert.ok( a.isEmpty(), "Passed!" );

		} );

		QUnit.test( "setFromCenterAndSize", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var b = a.clone();
			var centerA = new Vector3();
			var sizeA = new Vector3();
			var sizeB = new Vector3();
			var newCenter = one3;
			var newSize = two3;

			a.getCenter( centerA );
			a.getSize( sizeA );
			a.setFromCenterAndSize( centerA, sizeA );
			assert.ok( a.equals( b ), "Same values: no changes" );

			a.setFromCenterAndSize( newCenter, sizeA );
			a.getCenter( centerA );
			a.getSize( sizeA );
			b.getSize( sizeB );

			assert.ok( centerA.equals( newCenter ), "Move center: correct new center" );
			assert.ok( sizeA.equals( sizeB ), "Move center: no change in size" );
			assert.notOk( a.equals( b ), "Move center: no longer equal to old values" );

			a.setFromCenterAndSize( centerA, newSize );
			a.getCenter( centerA );
			a.getSize( sizeA );
			assert.ok( centerA.equals( newCenter ), "Resize: no change to center" );
			assert.ok( sizeA.equals( newSize ), "Resize: correct new size" );
			assert.notOk( a.equals( b ), "Resize: no longer equal to old values" );

		} );

		QUnit.test( "setFromObject/BufferGeometry", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var object = new Mesh( new BoxBufferGeometry( 2, 2, 2 ) );
			var child = new Mesh( new BoxBufferGeometry( 1, 1, 1 ) );
			object.add( child );

			a.setFromObject( object );
			assert.ok( a.min.equals( new Vector3( - 1, - 1, - 1 ) ), "Correct new minimum" );
			assert.ok( a.max.equals( new Vector3( 1, 1, 1 ) ), "Correct new maximum" );

		} );

		QUnit.todo( "clone", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var b = new Box3().copy( a );
			assert.ok( b.min.equals( zero3 ), "Passed!" );
			assert.ok( b.max.equals( one3 ), "Passed!" );

			// ensure that it is a true copy
			a.min = zero3;
			a.max = one3;
			assert.ok( b.min.equals( zero3 ), "Passed!" );
			assert.ok( b.max.equals( one3 ), "Passed!" );

		} );

		QUnit.test( "empty/makeEmpty", ( assert ) => {

			var a = new Box3();

			assert.ok( a.isEmpty(), "Passed!" );

			var a = new Box3( zero3.clone(), one3.clone() );
			assert.ok( ! a.isEmpty(), "Passed!" );

			a.makeEmpty();
			assert.ok( a.isEmpty(), "Passed!" );

		} );

		QUnit.todo( "isEmpty", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getCenter", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var center = new Vector3();

			assert.ok( a.getCenter( center ).equals( zero3 ), "Passed!" );

			var a = new Box3( zero3.clone(), one3.clone() );
			var midpoint = one3.clone().multiplyScalar( 0.5 );
			assert.ok( a.getCenter( center ).equals( midpoint ), "Passed!" );

		} );

		QUnit.test( "getSize", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var size = new Vector3();

			assert.ok( a.getSize( size ).equals( zero3 ), "Passed!" );

			var a = new Box3( zero3.clone(), one3.clone() );
			assert.ok( a.getSize( size ).equals( one3 ), "Passed!" );

		} );

		QUnit.test( "expandByPoint", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var center = new Vector3();
			var size = new Vector3();

			a.expandByPoint( zero3 );
			assert.ok( a.getSize( size ).equals( zero3 ), "Passed!" );

			a.expandByPoint( one3 );
			assert.ok( a.getSize( size ).equals( one3 ), "Passed!" );

			a.expandByPoint( one3.clone().negate() );
			assert.ok( a.getSize( size ).equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
			assert.ok( a.getCenter( center ).equals( zero3 ), "Passed!" );

		} );

		QUnit.test( "expandByVector", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var center = new Vector3();
			var size = new Vector3();

			a.expandByVector( zero3 );
			assert.ok( a.getSize( size ).equals( zero3 ), "Passed!" );

			a.expandByVector( one3 );
			assert.ok( a.getSize( size ).equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
			assert.ok( a.getCenter( center ).equals( zero3 ), "Passed!" );

		} );

		QUnit.test( "expandByScalar", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var center = new Vector3();
			var size = new Vector3();

			a.expandByScalar( 0 );
			assert.ok( a.getSize( size ).equals( zero3 ), "Passed!" );

			a.expandByScalar( 1 );
			assert.ok( a.getSize( size ).equals( one3.clone().multiplyScalar( 2 ) ), "Passed!" );
			assert.ok( a.getCenter( center ).equals( zero3 ), "Passed!" );

		} );

		QUnit.test( "expandByObject", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var b = a.clone();
			var bigger = new Mesh( new BoxGeometry( 2, 2, 2 ) );
			var smaller = new Mesh( new BoxGeometry( 0.5, 0.5, 0.5 ) );
			var child = new Mesh( new BoxGeometry( 1, 1, 1 ) );

			// just a bigger box to begin with
			a.expandByObject( bigger );
			assert.ok( a.min.equals( new Vector3( - 1, - 1, - 1 ) ), "Bigger box: correct new minimum" );
			assert.ok( a.max.equals( new Vector3( 1, 1, 1 ) ), "Bigger box: correct new maximum" );

			// a translated, bigger box
			a.copy( b );
			bigger.translateX( 2 );
			a.expandByObject( bigger );
			assert.ok( a.min.equals( new Vector3( 0, - 1, - 1 ) ), "Translated, bigger box: correct new minimum" );
			assert.ok( a.max.equals( new Vector3( 3, 1, 1 ) ), "Translated, bigger box: correct new maximum" );

			// a translated, bigger box with child
			a.copy( b );
			bigger.add( child );
			a.expandByObject( bigger );
			assert.ok( a.min.equals( new Vector3( 0, - 1, - 1 ) ), "Translated, bigger box with child: correct new minimum" );
			assert.ok( a.max.equals( new Vector3( 3, 1, 1 ) ), "Translated, bigger box with child: correct new maximum" );

			// a translated, bigger box with a translated child
			a.copy( b );
			child.translateX( 2 );
			a.expandByObject( bigger );
			assert.ok( a.min.equals( new Vector3( 0, - 1, - 1 ) ), "Translated, bigger box with translated child: correct new minimum" );
			assert.ok( a.max.equals( new Vector3( 4.5, 1, 1 ) ), "Translated, bigger box with translated child: correct new maximum" );

			// a smaller box
			a.copy( b );
			a.expandByObject( smaller );
			assert.ok( a.min.equals( new Vector3( - 0.25, - 0.25, - 0.25 ) ), "Smaller box: correct new minimum" );
			assert.ok( a.max.equals( new Vector3( 1, 1, 1 ) ), "Smaller box: correct new maximum" );

		} );

		QUnit.test( "containsPoint", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );

			assert.ok( a.containsPoint( zero3 ), "Passed!" );
			assert.ok( ! a.containsPoint( one3 ), "Passed!" );

			a.expandByScalar( 1 );
			assert.ok( a.containsPoint( zero3 ), "Passed!" );
			assert.ok( a.containsPoint( one3 ), "Passed!" );
			assert.ok( a.containsPoint( one3.clone().negate() ), "Passed!" );

		} );

		QUnit.test( "containsBox", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );

			assert.ok( a.containsBox( a ), "Passed!" );
			assert.ok( ! a.containsBox( b ), "Passed!" );
			assert.ok( ! a.containsBox( c ), "Passed!" );

			assert.ok( b.containsBox( a ), "Passed!" );
			assert.ok( c.containsBox( a ), "Passed!" );
			assert.ok( ! b.containsBox( c ), "Passed!" );

		} );

		QUnit.test( "getParameter", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var b = new Box3( one3.clone().negate(), one3.clone() );
			var parameter = new Vector3();

			a.getParameter( zero3, parameter );
			assert.ok( parameter.equals( zero3 ), "Passed!" );
			a.getParameter( one3, parameter );
			assert.ok( parameter.equals( one3 ), "Passed!" );

			b.getParameter( one3.clone().negate(), parameter );
			assert.ok( parameter.equals( zero3 ), "Passed!" );
			b.getParameter( zero3, parameter );
			assert.ok( parameter.equals( new Vector3( 0.5, 0.5, 0.5 ) ), "Passed!" );
			b.getParameter( one3, parameter );
			assert.ok( parameter.equals( one3 ), "Passed!" );

		} );

		QUnit.test( "intersectsBox", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );

			assert.ok( a.intersectsBox( a ), "Passed!" );
			assert.ok( a.intersectsBox( b ), "Passed!" );
			assert.ok( a.intersectsBox( c ), "Passed!" );

			assert.ok( b.intersectsBox( a ), "Passed!" );
			assert.ok( c.intersectsBox( a ), "Passed!" );
			assert.ok( b.intersectsBox( c ), "Passed!" );

			b.translate( new Vector3( 2, 2, 2 ) );
			assert.ok( ! a.intersectsBox( b ), "Passed!" );
			assert.ok( ! b.intersectsBox( a ), "Passed!" );
			assert.ok( ! b.intersectsBox( c ), "Passed!" );

		} );

		QUnit.test( "intersectsSphere", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var b = new Sphere( zero3.clone(), 1 );

			assert.ok( a.intersectsSphere( b ), "Passed!" );

			b.translate( new Vector3( 2, 2, 2 ) );
			assert.ok( ! a.intersectsSphere( b ), "Passed!" );

		} );

		QUnit.test( "intersectsPlane", ( assert ) => {

			var a = new Box3( zero3.clone(), one3.clone() );
			var b = new Plane( new Vector3( 0, 1, 0 ), 1 );
			var c = new Plane( new Vector3( 0, 1, 0 ), 1.25 );
			var d = new Plane( new Vector3( 0, - 1, 0 ), 1.25 );

			assert.ok( a.intersectsPlane( b ), "Passed!" );
			assert.ok( ! a.intersectsPlane( c ), "Passed!" );
			assert.ok( ! a.intersectsPlane( d ), "Passed!" );

		} );

		QUnit.test( "intersectsTriangle", ( assert ) => {

			var a = new Box3( one3.clone(), two3.clone() );
			var b = new Triangle( new Vector3( 1.5, 1.5, 2.5 ), new Vector3( 2.5, 1.5, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			var c = new Triangle( new Vector3( 1.5, 1.5, 3.5 ), new Vector3( 3.5, 1.5, 1.5 ), new Vector3( 1.5, 1.5, 1.5 ) );
			var d = new Triangle( new Vector3( 1.5, 1.75, 3 ), new Vector3( 3, 1.75, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			var e = new Triangle( new Vector3( 1.5, 1.8, 3 ), new Vector3( 3, 1.8, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			var f = new Triangle( new Vector3( 1.5, 2.5, 3 ), new Vector3( 3, 2.5, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );

			assert.ok( a.intersectsTriangle( b ), "Passed!" );
			assert.ok( a.intersectsTriangle( c ), "Passed!" );
			assert.ok( a.intersectsTriangle( d ), "Passed!" );
			assert.ok( ! a.intersectsTriangle( e ), "Passed!" );
			assert.ok( ! a.intersectsTriangle( f ), "Passed!" );

		} );

		QUnit.test( "clampPoint", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( one3.clone().negate(), one3.clone() );
			var point = new Vector3();

			a.clampPoint( zero3, point );
			assert.ok( point.equals( zero3 ), "Passed!" );
			a.clampPoint( one3, point );
			assert.ok( point.equals( zero3 ), "Passed!" );
			a.clampPoint( one3.clone().negate(), point );
			assert.ok( point.equals( zero3 ), "Passed!" );

			b.clampPoint( new Vector3( 2, 2, 2 ), point );
			assert.ok( point.equals( one3 ), "Passed!" );
			b.clampPoint( one3, point );
			assert.ok( point.equals( one3 ), "Passed!" );
			b.clampPoint( zero3, point );
			assert.ok( point.equals( zero3 ), "Passed!" );
			b.clampPoint( one3.clone().negate(), point );
			assert.ok( point.equals( one3.clone().negate() ), "Passed!" );
			b.clampPoint( new Vector3( - 2, - 2, - 2 ), point );
			assert.ok( point.equals( one3.clone().negate() ), "Passed!" );

		} );

		QUnit.test( "distanceToPoint", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( one3.clone().negate(), one3.clone() );

			assert.ok( a.distanceToPoint( new Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
			assert.ok( a.distanceToPoint( new Vector3( 1, 1, 1 ) ) == Math.sqrt( 3 ), "Passed!" );
			assert.ok( a.distanceToPoint( new Vector3( - 1, - 1, - 1 ) ) == Math.sqrt( 3 ), "Passed!" );

			assert.ok( b.distanceToPoint( new Vector3( 2, 2, 2 ) ) == Math.sqrt( 3 ), "Passed!" );
			assert.ok( b.distanceToPoint( new Vector3( 1, 1, 1 ) ) == 0, "Passed!" );
			assert.ok( b.distanceToPoint( new Vector3( 0, 0, 0 ) ) == 0, "Passed!" );
			assert.ok( b.distanceToPoint( new Vector3( - 1, - 1, - 1 ) ) == 0, "Passed!" );
			assert.ok( b.distanceToPoint( new Vector3( - 2, - 2, - 2 ) ) == Math.sqrt( 3 ), "Passed!" );

		} );

		QUnit.test( "getBoundingSphere", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );
			var sphere = new Sphere();

			assert.ok( a.getBoundingSphere( sphere ).equals( new Sphere( zero3, 0 ) ), "Passed!" );
			assert.ok( b.getBoundingSphere( sphere ).equals( new Sphere( one3.clone().multiplyScalar( 0.5 ), Math.sqrt( 3 ) * 0.5 ) ), "Passed!" );
			assert.ok( c.getBoundingSphere( sphere ).equals( new Sphere( zero3, Math.sqrt( 12 ) * 0.5 ) ), "Passed!" );

		} );

		QUnit.test( "intersect", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );

			assert.ok( a.clone().intersect( a ).equals( a ), "Passed!" );
			assert.ok( a.clone().intersect( b ).equals( a ), "Passed!" );
			assert.ok( b.clone().intersect( b ).equals( b ), "Passed!" );
			assert.ok( a.clone().intersect( c ).equals( a ), "Passed!" );
			assert.ok( b.clone().intersect( c ).equals( b ), "Passed!" );
			assert.ok( c.clone().intersect( c ).equals( c ), "Passed!" );

		} );

		QUnit.test( "union", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );

			assert.ok( a.clone().union( a ).equals( a ), "Passed!" );
			assert.ok( a.clone().union( b ).equals( b ), "Passed!" );
			assert.ok( a.clone().union( c ).equals( c ), "Passed!" );
			assert.ok( b.clone().union( c ).equals( c ), "Passed!" );

		} );

		QUnit.test( "applyMatrix4", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );
			var d = new Box3( one3.clone().negate(), zero3.clone() );

			var m = new Matrix4().makeTranslation( 1, - 2, 1 );
			var t1 = new Vector3( 1, - 2, 1 );

			assert.ok( compareBox( a.clone().applyMatrix4( m ), a.clone().translate( t1 ) ), "Passed!" );
			assert.ok( compareBox( b.clone().applyMatrix4( m ), b.clone().translate( t1 ) ), "Passed!" );
			assert.ok( compareBox( c.clone().applyMatrix4( m ), c.clone().translate( t1 ) ), "Passed!" );
			assert.ok( compareBox( d.clone().applyMatrix4( m ), d.clone().translate( t1 ) ), "Passed!" );

		} );

		QUnit.test( "translate", ( assert ) => {

			var a = new Box3( zero3.clone(), zero3.clone() );
			var b = new Box3( zero3.clone(), one3.clone() );
			var c = new Box3( one3.clone().negate(), one3.clone() );
			var d = new Box3( one3.clone().negate(), zero3.clone() );

			assert.ok( a.clone().translate( one3 ).equals( new Box3( one3, one3 ) ), "Passed!" );
			assert.ok( a.clone().translate( one3 ).translate( one3.clone().negate() ).equals( a ), "Passed!" );
			assert.ok( d.clone().translate( one3 ).equals( b ), "Passed!" );
			assert.ok( b.clone().translate( one3.clone().negate() ).equals( d ), "Passed!" );

		} );

		QUnit.todo( "equals", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
