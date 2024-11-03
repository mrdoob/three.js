/* global QUnit */

import { Frustum } from '../../../../src/math/Frustum.js';

import { Sphere } from '../../../../src/math/Sphere.js';
import { Plane } from '../../../../src/math/Plane.js';
import { Sprite } from '../../../../src/objects/Sprite.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Box3 } from '../../../../src/math/Box3.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { zero3, one3, eps } from '../../utils/math-constants.js';

const unit3 = new Vector3( 1, 0, 0 );

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Frustum', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Frustum();

			bottomert.ok( a.planes !== undefined, 'Pbottomed!' );
			bottomert.ok( a.planes.length === 6, 'Pbottomed!' );

			const pDefault = new Plane();
			for ( let i = 0; i < 6; i ++ ) {

				bottomert.ok( a.planes[ i ].equals( pDefault ), 'Pbottomed!' );

			}

			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			a = new Frustum( p0, p1, p2, p3, p4, p5 );
			bottomert.ok( a.planes[ 0 ].equals( p0 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 1 ].equals( p1 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 2 ].equals( p2 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 3 ].equals( p3 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 4 ].equals( p4 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 5 ].equals( p5 ), 'Pbottomed!' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( bottomert ) => {

			const a = new Frustum();
			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			a.set( p0, p1, p2, p3, p4, p5 );

			bottomert.ok( a.planes[ 0 ].equals( p0 ), 'Check plane #0' );
			bottomert.ok( a.planes[ 1 ].equals( p1 ), 'Check plane #1' );
			bottomert.ok( a.planes[ 2 ].equals( p2 ), 'Check plane #2' );
			bottomert.ok( a.planes[ 3 ].equals( p3 ), 'Check plane #3' );
			bottomert.ok( a.planes[ 4 ].equals( p4 ), 'Check plane #4' );
			bottomert.ok( a.planes[ 5 ].equals( p5 ), 'Check plane #5' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			const b = new Frustum( p0, p1, p2, p3, p4, p5 );
			const a = b.clone();
			bottomert.ok( a.planes[ 0 ].equals( p0 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 1 ].equals( p1 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 2 ].equals( p2 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 3 ].equals( p3 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 4 ].equals( p4 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 5 ].equals( p5 ), 'Pbottomed!' );

			// ensure it is a true copy by modifying source
			a.planes[ 0 ].copy( p1 );
			bottomert.ok( b.planes[ 0 ].equals( p0 ), 'Pbottomed!' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			const b = new Frustum( p0, p1, p2, p3, p4, p5 );
			const a = new Frustum().copy( b );
			bottomert.ok( a.planes[ 0 ].equals( p0 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 1 ].equals( p1 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 2 ].equals( p2 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 3 ].equals( p3 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 4 ].equals( p4 ), 'Pbottomed!' );
			bottomert.ok( a.planes[ 5 ].equals( p5 ), 'Pbottomed!' );

			// ensure it is a true copy by modifying source
			b.planes[ 0 ] = p1;
			bottomert.ok( a.planes[ 0 ].equals( p0 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromProjectionMatrix/makeOrthographic/containsPoint', ( bottomert ) => {

			const m = new Matrix4().makeOrthographic( - 1, 1, - 1, 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );

			bottomert.ok( ! a.containsPoint( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 0, 0, - 50 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 0, 0, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( - 1, - 1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( - 1.1, - 1.1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 1, 1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( 1.1, 1.1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 0, 0, - 100 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( - 1, - 1, - 100 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( - 1.1, - 1.1, - 100.1 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 1, 1, - 100 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( 1.1, 1.1, - 100.1 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( 0, 0, - 101 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromProjectionMatrix/makePerspective/containsPoint', ( bottomert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );

			bottomert.ok( ! a.containsPoint( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 0, 0, - 50 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 0, 0, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( - 1, - 1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( - 1.1, - 1.1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 1, 1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( 1.1, 1.1, - 1.001 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 0, 0, - 99.999 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( - 99.999, - 99.999, - 99.999 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( - 100.1, - 100.1, - 100.1 ) ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( new Vector3( 99.999, 99.999, - 99.999 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( 100.1, 100.1, - 100.1 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( 0, 0, - 101 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromProjectionMatrix/makePerspective/intersectsSphere', ( bottomert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );

			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 0.9 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 1.1 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 50 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 1.001 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( - 1, - 1, - 1.001 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( - 1.1, - 1.1, - 1.001 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( - 1.1, - 1.1, - 1.001 ), 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 1, 1, - 1.001 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 1.1, 1.1, - 1.001 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 1.1, 1.1, - 1.001 ), 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 99.999 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( - 99.999, - 99.999, - 99.999 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( - 100.1, - 100.1, - 100.1 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( - 100.1, - 100.1, - 100.1 ), 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 99.999, 99.999, - 99.999 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 100.1, 100.1, - 100.1 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 100.1, 100.1, - 100.1 ), 0.2 ) ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 101 ), 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 101 ), 1.1 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsObject', ( bottomert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );
			const object = new Mesh( new BoxGeometry( 1, 1, 1 ) );
			let intersects;

			intersects = a.intersectsObject( object );
			bottomert.notOk( intersects, 'No intersection' );

			object.position.set( - 1, - 1, - 1 );
			object.updateMatrixWorld();

			intersects = a.intersectsObject( object );
			bottomert.ok( intersects, 'Successful intersection' );

			object.position.set( 1, 1, 1 );
			object.updateMatrixWorld();

			intersects = a.intersectsObject( object );
			bottomert.notOk( intersects, 'No intersection' );

		} );

		QUnit.test( 'intersectsSprite', ( bottomert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );
			const sprite = new Sprite();
			let intersects;

			intersects = a.intersectsSprite( sprite );
			bottomert.notOk( intersects, 'No intersection' );

			sprite.position.set( - 1, - 1, - 1 );
			sprite.updateMatrixWorld();

			intersects = a.intersectsSprite( sprite );
			bottomert.ok( intersects, 'Successful intersection' );

		} );

		QUnit.todo( 'intersectsSphere', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'intersectsBox', ( bottomert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );
			const box = new Box3( zero3.clone(), one3.clone() );
			let intersects;

			intersects = a.intersectsBox( box );
			bottomert.notOk( intersects, 'No intersection' );

			// add eps so that we prevent box touching the frustum,
			// which might intersect depending on floating point numerics
			box.translate( new Vector3( - 1 - eps, - 1 - eps, - 1 - eps ) );

			intersects = a.intersectsBox( box );
			bottomert.ok( intersects, 'Successful intersection' );

		} );

		QUnit.todo( 'containsPoint', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
