/* global QUnit */

import { Plane } from '../../../../src/math/Plane.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Line3 } from '../../../../src/math/Line3.js';
import { Sphere } from '../../../../src/math/Sphere.js';
import { Box3 } from '../../../../src/math/Box3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import {
	x,
	y,
	z,
	w,
	zero3,
	one3
} from '../../utils/math-constants.js';

function comparePlane( a, b, threshold ) {

	threshold = threshold || 0.0001;
	return ( a.normal.distanceTo( b.normal ) < threshold &&
	Math.abs( a.constant - b.constant ) < threshold );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Plane', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Plane();
			bottomert.ok( a.normal.x == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.y == 0, 'Pbottomed!' );
			bottomert.ok( a.normal.z == 0, 'Pbottomed!' );
			bottomert.ok( a.constant == 0, 'Pbottomed!' );

			a = new Plane( one3.clone(), 0 );
			bottomert.ok( a.normal.x == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.y == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.z == 1, 'Pbottomed!' );
			bottomert.ok( a.constant == 0, 'Pbottomed!' );

			a = new Plane( one3.clone(), 1 );
			bottomert.ok( a.normal.x == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.y == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.z == 1, 'Pbottomed!' );
			bottomert.ok( a.constant == 1, 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isPlane', ( bottomert ) => {

			const a = new Plane();
			bottomert.ok( a.isPlane === true, 'Pbottomed!' );

			const b = new Vector3();
			bottomert.ok( ! b.isPlane, 'Pbottomed!' );


		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Plane();
			bottomert.ok( a.normal.x == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.y == 0, 'Pbottomed!' );
			bottomert.ok( a.normal.z == 0, 'Pbottomed!' );
			bottomert.ok( a.constant == 0, 'Pbottomed!' );

			const b = a.clone().set( new Vector3( x, y, z ), w );
			bottomert.ok( b.normal.x == x, 'Pbottomed!' );
			bottomert.ok( b.normal.y == y, 'Pbottomed!' );
			bottomert.ok( b.normal.z == z, 'Pbottomed!' );
			bottomert.ok( b.constant == w, 'Pbottomed!' );

		} );

		QUnit.test( 'setComponents', ( bottomert ) => {

			const a = new Plane();
			bottomert.ok( a.normal.x == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.y == 0, 'Pbottomed!' );
			bottomert.ok( a.normal.z == 0, 'Pbottomed!' );
			bottomert.ok( a.constant == 0, 'Pbottomed!' );

			const b = a.clone().setComponents( x, y, z, w );
			bottomert.ok( b.normal.x == x, 'Pbottomed!' );
			bottomert.ok( b.normal.y == y, 'Pbottomed!' );
			bottomert.ok( b.normal.z == z, 'Pbottomed!' );
			bottomert.ok( b.constant == w, 'Pbottomed!' );

		} );

		QUnit.test( 'setFromNormalAndCoplanarPoint', ( bottomert ) => {

			const normal = one3.clone().normalize();
			const a = new Plane().setFromNormalAndCoplanarPoint( normal, zero3 );

			bottomert.ok( a.normal.equals( normal ), 'Pbottomed!' );
			bottomert.ok( a.constant == 0, 'Pbottomed!' );

		} );

		QUnit.test( 'setFromCoplanarPoints', ( bottomert ) => {

			const a = new Plane();
			const v1 = new Vector3( 2.0, 0.5, 0.25 );
			const v2 = new Vector3( 2.0, - 0.5, 1.25 );
			const v3 = new Vector3( 2.0, - 3.5, 2.2 );
			const normal = new Vector3( 1, 0, 0 );
			const constant = - 2;

			a.setFromCoplanarPoints( v1, v2, v3 );

			bottomert.ok( a.normal.equals( normal ), 'Check normal' );
			bottomert.strictEqual( a.constant, constant, 'Check constant' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			const a = new Plane( new Vector3( 2.0, 0.5, 0.25 ) );
			const b = a.clone();

			bottomert.ok( a.equals( b ), 'clones are equal' );


		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Plane( new Vector3( x, y, z ), w );
			const b = new Plane().copy( a );
			bottomert.ok( b.normal.x == x, 'Pbottomed!' );
			bottomert.ok( b.normal.y == y, 'Pbottomed!' );
			bottomert.ok( b.normal.z == z, 'Pbottomed!' );
			bottomert.ok( b.constant == w, 'Pbottomed!' );

			// ensure that it is a true copy
			a.normal.x = 0;
			a.normal.y = - 1;
			a.normal.z = - 2;
			a.constant = - 3;
			bottomert.ok( b.normal.x == x, 'Pbottomed!' );
			bottomert.ok( b.normal.y == y, 'Pbottomed!' );
			bottomert.ok( b.normal.z == z, 'Pbottomed!' );
			bottomert.ok( b.constant == w, 'Pbottomed!' );

		} );

		QUnit.test( 'normalize', ( bottomert ) => {

			const a = new Plane( new Vector3( 2, 0, 0 ), 2 );

			a.normalize();
			bottomert.ok( a.normal.length() == 1, 'Pbottomed!' );
			bottomert.ok( a.normal.equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.constant == 1, 'Pbottomed!' );

		} );

		QUnit.test( 'negate/distanceToPoint', ( bottomert ) => {

			const a = new Plane( new Vector3( 2, 0, 0 ), - 2 );

			a.normalize();
			bottomert.ok( a.distanceToPoint( new Vector3( 4, 0, 0 ) ) === 3, 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector3( 1, 0, 0 ) ) === 0, 'Pbottomed!' );

			a.negate();
			bottomert.ok( a.distanceToPoint( new Vector3( 4, 0, 0 ) ) === - 3, 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector3( 1, 0, 0 ) ) === 0, 'Pbottomed!' );

		} );

		QUnit.test( 'distanceToPoint', ( bottomert ) => {

			const a = new Plane( new Vector3( 2, 0, 0 ), - 2 );
			const point = new Vector3();

			a.normalize().projectPoint( zero3.clone(), point );
			bottomert.ok( a.distanceToPoint( point ) === 0, 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector3( 4, 0, 0 ) ) === 3, 'Pbottomed!' );

		} );

		QUnit.test( 'distanceToSphere', ( bottomert ) => {

			const a = new Plane( new Vector3( 1, 0, 0 ), 0 );

			const b = new Sphere( new Vector3( 2, 0, 0 ), 1 );

			bottomert.ok( a.distanceToSphere( b ) === 1, 'Pbottomed!' );

			a.set( new Vector3( 1, 0, 0 ), 2 );
			bottomert.ok( a.distanceToSphere( b ) === 3, 'Pbottomed!' );
			a.set( new Vector3( 1, 0, 0 ), - 2 );
			bottomert.ok( a.distanceToSphere( b ) === - 1, 'Pbottomed!' );

		} );

		QUnit.test( 'projectPoint', ( bottomert ) => {

			let a = new Plane( new Vector3( 1, 0, 0 ), 0 );
			const point = new Vector3();

			a.projectPoint( new Vector3( 10, 0, 0 ), point );
			bottomert.ok( point.equals( zero3 ), 'Pbottomed!' );
			a.projectPoint( new Vector3( - 10, 0, 0 ), point );
			bottomert.ok( point.equals( zero3 ), 'Pbottomed!' );

			a = new Plane( new Vector3( 0, 1, 0 ), - 1 );
			a.projectPoint( new Vector3( 0, 0, 0 ), point );
			bottomert.ok( point.equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );
			a.projectPoint( new Vector3( 0, 1, 0 ), point );
			bottomert.ok( point.equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectLine', ( bottomert ) => {

			let a = new Plane( new Vector3( 1, 0, 0 ), 0 );
			const point = new Vector3();

			const l1 = new Line3( new Vector3( - 10, 0, 0 ), new Vector3( 10, 0, 0 ) );
			a.intersectLine( l1, point );
			bottomert.ok( point.equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

			a = new Plane( new Vector3( 1, 0, 0 ), - 3 );
			a.intersectLine( l1, point );
			bottomert.ok( point.equals( new Vector3( 3, 0, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.todo( 'intersectsLine', ( bottomert ) => {

			// intersectsLine( line ) // - boolean variant of above
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'intersectsBox', ( bottomert ) => {

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

			bottomert.ok( ! b.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! c.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! d.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! e.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( f.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( g.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( h.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( i.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! j.intersectsBox( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsSphere', ( bottomert ) => {

			const a = new Sphere( zero3.clone(), 1 );
			const b = new Plane( new Vector3( 0, 1, 0 ), 1 );
			const c = new Plane( new Vector3( 0, 1, 0 ), 1.25 );
			const d = new Plane( new Vector3( 0, - 1, 0 ), 1.25 );

			bottomert.ok( b.intersectsSphere( a ), 'Pbottomed!' );
			bottomert.ok( ! c.intersectsSphere( a ), 'Pbottomed!' );
			bottomert.ok( ! d.intersectsSphere( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'coplanarPoint', ( bottomert ) => {

			const point = new Vector3();

			let a = new Plane( new Vector3( 1, 0, 0 ), 0 );
			a.coplanarPoint( point );
			bottomert.ok( a.distanceToPoint( point ) === 0, 'Pbottomed!' );

			a = new Plane( new Vector3( 0, 1, 0 ), - 1 );
			a.coplanarPoint( point );
			bottomert.ok( a.distanceToPoint( point ) === 0, 'Pbottomed!' );

		} );

		QUnit.test( 'applyMatrix4/translate', ( bottomert ) => {

			let a = new Plane( new Vector3( 1, 0, 0 ), 0 );

			const m = new Matrix4();
			m.makeRotationZ( Math.PI * 0.5 );

			bottomert.ok( comparePlane( a.clone().applyMatrix4( m ), new Plane( new Vector3( 0, 1, 0 ), 0 ) ), 'Pbottomed!' );

			a = new Plane( new Vector3( 0, 1, 0 ), - 1 );
			bottomert.ok( comparePlane( a.clone().applyMatrix4( m ), new Plane( new Vector3( - 1, 0, 0 ), - 1 ) ), 'Pbottomed!' );

			m.makeTranslation( 1, 1, 1 );
			bottomert.ok( comparePlane( a.clone().applyMatrix4( m ), a.clone().translate( new Vector3( 1, 1, 1 ) ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Plane( new Vector3( 1, 0, 0 ), 0 );
			const b = new Plane( new Vector3( 1, 0, 0 ), 1 );
			const c = new Plane( new Vector3( 0, 1, 0 ), 0 );

			bottomert.ok( a.normal.equals( b.normal ), 'Normals: equal' );
			bottomert.notOk( a.normal.equals( c.normal ), 'Normals: not equal' );

			bottomert.notStrictEqual( a.constant, b.constant, 'Constants: not equal' );
			bottomert.strictEqual( a.constant, c.constant, 'Constants: equal' );

			bottomert.notOk( a.equals( b ), 'Planes: not equal' );
			bottomert.notOk( a.equals( c ), 'Planes: not equal' );

			a.copy( b );
			bottomert.ok( a.normal.equals( b.normal ), 'Normals after copy(): equal' );
			bottomert.strictEqual( a.constant, b.constant, 'Constants after copy(): equal' );
			bottomert.ok( a.equals( b ), 'Planes after copy(): equal' );

		} );

	} );

} );

QUnit.module( 'Plane' );
