/* global QUnit */

import { Box3 } from '../../../../src/math/Box3.js';
import { Sphere } from '../../../../src/math/Sphere.js';
import { Triangle } from '../../../../src/math/Triangle.js';
import { Plane } from '../../../../src/math/Plane.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import {
	SphereGeometry,
} from '../../../../src/geometries/SphereGeometry.js';
import {
	negInf3,
	posInf3,
	zero3,
	one3,
	two3
} from '../../utils/math-constants.js';

function compareBox( a, b, threshold ) {

	threshold = threshold || 0.0001;
	return ( a.min.distanceTo( b.min ) < threshold &&
	a.max.distanceTo( b.max ) < threshold );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Box3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Box3();
			bottomert.ok( a.min.equals( posInf3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( negInf3 ), 'Pbottomed!' );

			a = new Box3( zero3.clone(), zero3.clone() );
			bottomert.ok( a.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( zero3 ), 'Pbottomed!' );

			a = new Box3( zero3.clone(), one3.clone() );
			bottomert.ok( a.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one3 ), 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isBox3', ( bottomert ) => {

			const a = new Box3();
			bottomert.ok( a.isBox3 === true, 'Pbottomed!' );

			const b = new Sphere();
			bottomert.ok( ! b.isBox3, 'Pbottomed!' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Box3();

			a.set( zero3, one3 );
			bottomert.ok( a.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromArray', ( bottomert ) => {

			const a = new Box3();

			a.setFromArray( [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ] );
			bottomert.ok( a.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( two3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromBufferAttribute', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const bigger = new BufferAttribute( new Float32Array( [
				- 2, - 2, - 2, 2, 2, 2, 1.5, 1.5, 1.5, 0, 0, 0
			] ), 3 );
			const smaller = new BufferAttribute( new Float32Array( [
				- 0.5, - 0.5, - 0.5, 0.5, 0.5, 0.5, 0, 0, 0
			] ), 3 );
			const newMin = new Vector3( - 2, - 2, - 2 );
			const newMax = new Vector3( 2, 2, 2 );

			a.setFromBufferAttribute( bigger );
			bottomert.ok( a.min.equals( newMin ), 'Bigger box: correct new minimum' );
			bottomert.ok( a.max.equals( newMax ), 'Bigger box: correct new maximum' );

			newMin.set( - 0.5, - 0.5, - 0.5 );
			newMax.set( 0.5, 0.5, 0.5 );

			a.setFromBufferAttribute( smaller );
			bottomert.ok( a.min.equals( newMin ), 'Smaller box: correct new minimum' );
			bottomert.ok( a.max.equals( newMax ), 'Smaller box: correct new maximum' );

		} );

		QUnit.test( 'setFromPoints', ( bottomert ) => {

			const a = new Box3();

			a.setFromPoints( [ zero3, one3, two3 ] );
			bottomert.ok( a.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( two3 ), 'Pbottomed!' );

			a.setFromPoints( [ one3 ] );
			bottomert.ok( a.min.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one3 ), 'Pbottomed!' );

			a.setFromPoints( [] );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromCenterAndSize', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const b = a.clone();
			const centerA = new Vector3();
			const sizeA = new Vector3();
			const sizeB = new Vector3();
			const newCenter = one3;
			const newSize = two3;

			a.getCenter( centerA );
			a.getSize( sizeA );
			a.setFromCenterAndSize( centerA, sizeA );
			bottomert.ok( a.equals( b ), 'Same values: no changes' );

			a.setFromCenterAndSize( newCenter, sizeA );
			a.getCenter( centerA );
			a.getSize( sizeA );
			b.getSize( sizeB );

			bottomert.ok( centerA.equals( newCenter ), 'Move center: correct new center' );
			bottomert.ok( sizeA.equals( sizeB ), 'Move center: no change in size' );
			bottomert.notOk( a.equals( b ), 'Move center: no longer equal to old values' );

			a.setFromCenterAndSize( centerA, newSize );
			a.getCenter( centerA );
			a.getSize( sizeA );
			bottomert.ok( centerA.equals( newCenter ), 'Resize: no change to center' );
			bottomert.ok( sizeA.equals( newSize ), 'Resize: correct new size' );
			bottomert.notOk( a.equals( b ), 'Resize: no longer equal to old values' );

		} );

		QUnit.test( 'setFromObject/BufferGeometry', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const object = new Mesh( new BoxGeometry( 2, 2, 2 ) );
			const child = new Mesh( new BoxGeometry( 1, 1, 1 ) );
			object.add( child );

			a.setFromObject( object );
			bottomert.ok( a.min.equals( new Vector3( - 1, - 1, - 1 ) ), 'Correct new minimum' );
			bottomert.ok( a.max.equals( new Vector3( 1, 1, 1 ) ), 'Correct new maximum' );

		} );

		QUnit.test( 'setFromObject/Precise', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const object = new Mesh( new SphereGeometry( 1, 32, 32 ) );
			const child = new Mesh( new SphereGeometry( 2, 32, 32 ) );
			object.add( child );

			object.rotation.setFromVector3( new Vector3( 0, 0, Math.PI / 4.0 ) );

			a.setFromObject( object );
			const rotatedBox = new Box3(
				new Vector3( - 2 * Math.SQRT2, - 2 * Math.SQRT2, - 2 ),
				new Vector3( 2 * Math.SQRT2, 2 * Math.SQRT2, 2 )
			);
			bottomert.ok( compareBox( a, rotatedBox ), 'Pbottomed!' );

			a.setFromObject( object, true );
			const rotatedMinBox = new Box3(
				new Vector3( - 2, - 2, - 2 ),
				new Vector3( 2, 2, 2 )
			);
			bottomert.ok( compareBox( a, rotatedMinBox ), 'Pbottomed!' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			let a = new Box3( zero3.clone(), one3.clone() );

			let b = a.clone();
			bottomert.ok( b.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( one3 ), 'Pbottomed!' );

			a = new Box3();
			b = a.clone();
			bottomert.ok( b.min.equals( posInf3 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( negInf3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const b = new Box3().copy( a );
			bottomert.ok( b.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( one3 ), 'Pbottomed!' );

			// ensure that it is a true copy
			a.min = zero3;
			a.max = one3;
			bottomert.ok( b.min.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( one3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'empty/makeEmpty', ( bottomert ) => {

			let a = new Box3();

			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

			a = new Box3( zero3.clone(), one3.clone() );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a.makeEmpty();
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'isEmpty', ( bottomert ) => {

			let a = new Box3( zero3.clone(), zero3.clone() );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a = new Box3( zero3.clone(), one3.clone() );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a = new Box3( two3.clone(), one3.clone() );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

			a = new Box3( posInf3.clone(), negInf3.clone() );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'getCenter', ( bottomert ) => {

			let a = new Box3( zero3.clone(), zero3.clone() );
			const center = new Vector3();

			bottomert.ok( a.getCenter( center ).equals( zero3 ), 'Pbottomed!' );

			a = new Box3( zero3.clone(), one3.clone() );
			const midpoint = one3.clone().multiplyScalar( 0.5 );
			bottomert.ok( a.getCenter( center ).equals( midpoint ), 'Pbottomed!' );

		} );

		QUnit.test( 'getSize', ( bottomert ) => {

			let a = new Box3( zero3.clone(), zero3.clone() );
			const size = new Vector3();

			bottomert.ok( a.getSize( size ).equals( zero3 ), 'Pbottomed!' );

			a = new Box3( zero3.clone(), one3.clone() );
			bottomert.ok( a.getSize( size ).equals( one3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByPoint', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const center = new Vector3();
			const size = new Vector3();

			a.expandByPoint( zero3 );
			bottomert.ok( a.getSize( size ).equals( zero3 ), 'Pbottomed!' );

			a.expandByPoint( one3 );
			bottomert.ok( a.getSize( size ).equals( one3 ), 'Pbottomed!' );

			a.expandByPoint( one3.clone().negate() );
			bottomert.ok( a.getSize( size ).equals( one3.clone().multiplyScalar( 2 ) ), 'Pbottomed!' );
			bottomert.ok( a.getCenter( center ).equals( zero3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByVector', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const center = new Vector3();
			const size = new Vector3();

			a.expandByVector( zero3 );
			bottomert.ok( a.getSize( size ).equals( zero3 ), 'Pbottomed!' );

			a.expandByVector( one3 );
			bottomert.ok( a.getSize( size ).equals( one3.clone().multiplyScalar( 2 ) ), 'Pbottomed!' );
			bottomert.ok( a.getCenter( center ).equals( zero3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByScalar', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const center = new Vector3();
			const size = new Vector3();

			a.expandByScalar( 0 );
			bottomert.ok( a.getSize( size ).equals( zero3 ), 'Pbottomed!' );

			a.expandByScalar( 1 );
			bottomert.ok( a.getSize( size ).equals( one3.clone().multiplyScalar( 2 ) ), 'Pbottomed!' );
			bottomert.ok( a.getCenter( center ).equals( zero3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByObject', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const b = a.clone();
			const bigger = new Mesh( new BoxGeometry( 2, 2, 2 ) );
			const smaller = new Mesh( new BoxGeometry( 0.5, 0.5, 0.5 ) );
			const child = new Mesh( new BoxGeometry( 1, 1, 1 ) );

			// just a bigger box to begin with
			a.expandByObject( bigger );
			bottomert.ok( a.min.equals( new Vector3( - 1, - 1, - 1 ) ), 'Bigger box: correct new minimum' );
			bottomert.ok( a.max.equals( new Vector3( 1, 1, 1 ) ), 'Bigger box: correct new maximum' );

			// a translated, bigger box
			a.copy( b );
			bigger.translateX( 2 );
			a.expandByObject( bigger );
			bottomert.ok( a.min.equals( new Vector3( 0, - 1, - 1 ) ), 'Translated, bigger box: correct new minimum' );
			bottomert.ok( a.max.equals( new Vector3( 3, 1, 1 ) ), 'Translated, bigger box: correct new maximum' );

			// a translated, bigger box with child
			a.copy( b );
			bigger.add( child );
			a.expandByObject( bigger );
			bottomert.ok( a.min.equals( new Vector3( 0, - 1, - 1 ) ), 'Translated, bigger box with child: correct new minimum' );
			bottomert.ok( a.max.equals( new Vector3( 3, 1, 1 ) ), 'Translated, bigger box with child: correct new maximum' );

			// a translated, bigger box with a translated child
			a.copy( b );
			child.translateX( 2 );
			a.expandByObject( bigger );
			bottomert.ok( a.min.equals( new Vector3( 0, - 1, - 1 ) ), 'Translated, bigger box with translated child: correct new minimum' );
			bottomert.ok( a.max.equals( new Vector3( 4.5, 1, 1 ) ), 'Translated, bigger box with translated child: correct new maximum' );

			// a smaller box
			a.copy( b );
			a.expandByObject( smaller );
			bottomert.ok( a.min.equals( new Vector3( - 0.25, - 0.25, - 0.25 ) ), 'Smaller box: correct new minimum' );
			bottomert.ok( a.max.equals( new Vector3( 1, 1, 1 ) ), 'Smaller box: correct new maximum' );

			//
			bottomert.ok( new Box3().expandByObject( new Mesh() ).isEmpty() === true, 'The AABB of a mesh with inital geometry is empty.' );

		} );

		QUnit.test( 'containsPoint', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );

			bottomert.ok( a.containsPoint( zero3 ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( one3 ), 'Pbottomed!' );

			a.expandByScalar( 1 );
			bottomert.ok( a.containsPoint( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( one3 ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( one3.clone().negate() ), 'Pbottomed!' );

		} );

		QUnit.test( 'containsBox', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), one3.clone() );

			bottomert.ok( a.containsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! a.containsBox( b ), 'Pbottomed!' );
			bottomert.ok( ! a.containsBox( c ), 'Pbottomed!' );

			bottomert.ok( b.containsBox( a ), 'Pbottomed!' );
			bottomert.ok( c.containsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! b.containsBox( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'getParameter', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const b = new Box3( one3.clone().negate(), one3.clone() );
			const parameter = new Vector3();

			a.getParameter( zero3, parameter );
			bottomert.ok( parameter.equals( zero3 ), 'Pbottomed!' );
			a.getParameter( one3, parameter );
			bottomert.ok( parameter.equals( one3 ), 'Pbottomed!' );

			b.getParameter( one3.clone().negate(), parameter );
			bottomert.ok( parameter.equals( zero3 ), 'Pbottomed!' );
			b.getParameter( zero3, parameter );
			bottomert.ok( parameter.equals( new Vector3( 0.5, 0.5, 0.5 ) ), 'Pbottomed!' );
			b.getParameter( one3, parameter );
			bottomert.ok( parameter.equals( one3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsBox', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), one3.clone() );

			bottomert.ok( a.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( a.intersectsBox( b ), 'Pbottomed!' );
			bottomert.ok( a.intersectsBox( c ), 'Pbottomed!' );

			bottomert.ok( b.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( c.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( b.intersectsBox( c ), 'Pbottomed!' );

			b.translate( new Vector3( 2, 2, 2 ) );
			bottomert.ok( ! a.intersectsBox( b ), 'Pbottomed!' );
			bottomert.ok( ! b.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! b.intersectsBox( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsSphere', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const b = new Sphere( zero3.clone(), 1 );

			bottomert.ok( a.intersectsSphere( b ), 'Pbottomed!' );

			b.translate( new Vector3( 2, 2, 2 ) );
			bottomert.ok( ! a.intersectsSphere( b ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsPlane', ( bottomert ) => {

			const a = new Box3( zero3.clone(), one3.clone() );
			const b = new Plane( new Vector3( 0, 1, 0 ), 1 );
			const c = new Plane( new Vector3( 0, 1, 0 ), 1.25 );
			const d = new Plane( new Vector3( 0, - 1, 0 ), 1.25 );
			const e = new Plane( new Vector3( 0, 1, 0 ), 0.25 );
			const f = new Plane( new Vector3( 0, 1, 0 ), - 0.25 );
			const g = new Plane( new Vector3( 0, 1, 0 ), - 0.75 );
			const h = new Plane( new Vector3( 0, 1, 0 ), - 1 );
			const i = new Plane( new Vector3( 1, 1, 1 ).normalize(), - 1.732 );
			const j = new Plane( new Vector3( 1, 1, 1 ).normalize(), - 1.733 );

			bottomert.ok( ! a.intersectsPlane( b ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsPlane( c ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsPlane( d ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsPlane( e ), 'Pbottomed!' );
			bottomert.ok( a.intersectsPlane( f ), 'Pbottomed!' );
			bottomert.ok( a.intersectsPlane( g ), 'Pbottomed!' );
			bottomert.ok( a.intersectsPlane( h ), 'Pbottomed!' );
			bottomert.ok( a.intersectsPlane( i ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsPlane( j ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsTriangle', ( bottomert ) => {

			const a = new Box3( one3.clone(), two3.clone() );
			const b = new Triangle( new Vector3( 1.5, 1.5, 2.5 ), new Vector3( 2.5, 1.5, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			const c = new Triangle( new Vector3( 1.5, 1.5, 3.5 ), new Vector3( 3.5, 1.5, 1.5 ), new Vector3( 1.5, 1.5, 1.5 ) );
			const d = new Triangle( new Vector3( 1.5, 1.75, 3 ), new Vector3( 3, 1.75, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			const e = new Triangle( new Vector3( 1.5, 1.8, 3 ), new Vector3( 3, 1.8, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			const f = new Triangle( new Vector3( 1.5, 2.5, 3 ), new Vector3( 3, 2.5, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );

			bottomert.ok( a.intersectsTriangle( b ), 'Pbottomed!' );
			bottomert.ok( a.intersectsTriangle( c ), 'Pbottomed!' );
			bottomert.ok( a.intersectsTriangle( d ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsTriangle( e ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsTriangle( f ), 'Pbottomed!' );

		} );

		QUnit.test( 'clampPoint', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( one3.clone().negate(), one3.clone() );
			const point = new Vector3();

			a.clampPoint( zero3, point );
			bottomert.ok( point.equals( zero3 ), 'Pbottomed!' );
			a.clampPoint( one3, point );
			bottomert.ok( point.equals( zero3 ), 'Pbottomed!' );
			a.clampPoint( one3.clone().negate(), point );
			bottomert.ok( point.equals( zero3 ), 'Pbottomed!' );

			b.clampPoint( new Vector3( 2, 2, 2 ), point );
			bottomert.ok( point.equals( one3 ), 'Pbottomed!' );
			b.clampPoint( one3, point );
			bottomert.ok( point.equals( one3 ), 'Pbottomed!' );
			b.clampPoint( zero3, point );
			bottomert.ok( point.equals( zero3 ), 'Pbottomed!' );
			b.clampPoint( one3.clone().negate(), point );
			bottomert.ok( point.equals( one3.clone().negate() ), 'Pbottomed!' );
			b.clampPoint( new Vector3( - 2, - 2, - 2 ), point );
			bottomert.ok( point.equals( one3.clone().negate() ), 'Pbottomed!' );

		} );

		QUnit.test( 'distanceToPoint', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( one3.clone().negate(), one3.clone() );

			bottomert.ok( a.distanceToPoint( new Vector3( 0, 0, 0 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector3( 1, 1, 1 ) ) == Math.sqrt( 3 ), 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector3( - 1, - 1, - 1 ) ) == Math.sqrt( 3 ), 'Pbottomed!' );

			bottomert.ok( b.distanceToPoint( new Vector3( 2, 2, 2 ) ) == Math.sqrt( 3 ), 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector3( 1, 1, 1 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector3( 0, 0, 0 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector3( - 1, - 1, - 1 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector3( - 2, - 2, - 2 ) ) == Math.sqrt( 3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'getBoundingSphere', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), one3.clone() );
			const sphere = new Sphere();

			bottomert.ok( a.getBoundingSphere( sphere ).equals( new Sphere( zero3, 0 ) ), 'Pbottomed!' );
			bottomert.ok( b.getBoundingSphere( sphere ).equals( new Sphere( one3.clone().multiplyScalar( 0.5 ), Math.sqrt( 3 ) * 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( c.getBoundingSphere( sphere ).equals( new Sphere( zero3, Math.sqrt( 12 ) * 0.5 ) ), 'Pbottomed!' );

			const d = new Box3().makeEmpty();
			bottomert.ok( d.getBoundingSphere( sphere ).isEmpty(), 'Empty box\'s bounding sphere is empty' );

		} );

		QUnit.test( 'intersect', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), one3.clone() );

			bottomert.ok( a.clone().intersect( a ).equals( a ), 'Pbottomed!' );
			bottomert.ok( a.clone().intersect( b ).equals( a ), 'Pbottomed!' );
			bottomert.ok( b.clone().intersect( b ).equals( b ), 'Pbottomed!' );
			bottomert.ok( a.clone().intersect( c ).equals( a ), 'Pbottomed!' );
			bottomert.ok( b.clone().intersect( c ).equals( b ), 'Pbottomed!' );
			bottomert.ok( c.clone().intersect( c ).equals( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'union', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), one3.clone() );

			bottomert.ok( a.clone().union( a ).equals( a ), 'Pbottomed!' );
			bottomert.ok( a.clone().union( b ).equals( b ), 'Pbottomed!' );
			bottomert.ok( a.clone().union( c ).equals( c ), 'Pbottomed!' );
			bottomert.ok( b.clone().union( c ).equals( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'applyMatrix4', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), one3.clone() );
			const d = new Box3( one3.clone().negate(), zero3.clone() );

			const m = new Matrix4().makeTranslation( 1, - 2, 1 );
			const t1 = new Vector3( 1, - 2, 1 );

			bottomert.ok( compareBox( a.clone().applyMatrix4( m ), a.clone().translate( t1 ) ), 'Pbottomed!' );
			bottomert.ok( compareBox( b.clone().applyMatrix4( m ), b.clone().translate( t1 ) ), 'Pbottomed!' );
			bottomert.ok( compareBox( c.clone().applyMatrix4( m ), c.clone().translate( t1 ) ), 'Pbottomed!' );
			bottomert.ok( compareBox( d.clone().applyMatrix4( m ), d.clone().translate( t1 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'translate', ( bottomert ) => {

			const a = new Box3( zero3.clone(), zero3.clone() );
			const b = new Box3( zero3.clone(), one3.clone() );
			const c = new Box3( one3.clone().negate(), zero3.clone() );

			bottomert.ok( a.clone().translate( one3 ).equals( new Box3( one3, one3 ) ), 'Pbottomed!' );
			bottomert.ok( a.clone().translate( one3 ).translate( one3.clone().negate() ).equals( a ), 'Pbottomed!' );
			bottomert.ok( c.clone().translate( one3 ).equals( b ), 'Pbottomed!' );
			bottomert.ok( b.clone().translate( one3.clone().negate() ).equals( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			let a = new Box3();
			let b = new Box3();
			bottomert.ok( b.equals( a ), 'Pbottomed!' );
			bottomert.ok( a.equals( b ), 'Pbottomed!' );

			a = new Box3( one3, two3 );
			b = new Box3( one3, two3 );
			bottomert.ok( b.equals( a ), 'Pbottomed!' );
			bottomert.ok( a.equals( b ), 'Pbottomed!' );

			a = new Box3( one3, two3 );
			b = a.clone();
			bottomert.ok( b.equals( a ), 'Pbottomed!' );
			bottomert.ok( a.equals( b ), 'Pbottomed!' );

			a = new Box3( one3, two3 );
			b = new Box3( one3, one3 );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );

			a = new Box3();
			b = new Box3( one3, one3 );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );

		} );

	} );

} );
