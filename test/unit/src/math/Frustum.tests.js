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
		QUnit.test( 'Instancing', ( assert ) => {

			let a = new Frustum();

			assert.ok( a.planes !== undefined, 'Passed!' );
			assert.ok( a.planes.length === 6, 'Passed!' );

			const pDefault = new Plane();
			for ( let i = 0; i < 6; i ++ ) {

				assert.ok( a.planes[ i ].equals( pDefault ), 'Passed!' );

			}

			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			a = new Frustum( p0, p1, p2, p3, p4, p5 );
			assert.ok( a.planes[ 0 ].equals( p0 ), 'Passed!' );
			assert.ok( a.planes[ 1 ].equals( p1 ), 'Passed!' );
			assert.ok( a.planes[ 2 ].equals( p2 ), 'Passed!' );
			assert.ok( a.planes[ 3 ].equals( p3 ), 'Passed!' );
			assert.ok( a.planes[ 4 ].equals( p4 ), 'Passed!' );
			assert.ok( a.planes[ 5 ].equals( p5 ), 'Passed!' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( assert ) => {

			const a = new Frustum();
			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			a.set( p0, p1, p2, p3, p4, p5 );

			assert.ok( a.planes[ 0 ].equals( p0 ), 'Check plane #0' );
			assert.ok( a.planes[ 1 ].equals( p1 ), 'Check plane #1' );
			assert.ok( a.planes[ 2 ].equals( p2 ), 'Check plane #2' );
			assert.ok( a.planes[ 3 ].equals( p3 ), 'Check plane #3' );
			assert.ok( a.planes[ 4 ].equals( p4 ), 'Check plane #4' );
			assert.ok( a.planes[ 5 ].equals( p5 ), 'Check plane #5' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			const b = new Frustum( p0, p1, p2, p3, p4, p5 );
			const a = b.clone();
			assert.ok( a.planes[ 0 ].equals( p0 ), 'Passed!' );
			assert.ok( a.planes[ 1 ].equals( p1 ), 'Passed!' );
			assert.ok( a.planes[ 2 ].equals( p2 ), 'Passed!' );
			assert.ok( a.planes[ 3 ].equals( p3 ), 'Passed!' );
			assert.ok( a.planes[ 4 ].equals( p4 ), 'Passed!' );
			assert.ok( a.planes[ 5 ].equals( p5 ), 'Passed!' );

			// ensure it is a true copy by modifying source
			a.planes[ 0 ].copy( p1 );
			assert.ok( b.planes[ 0 ].equals( p0 ), 'Passed!' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const p0 = new Plane( unit3, - 1 );
			const p1 = new Plane( unit3, 1 );
			const p2 = new Plane( unit3, 2 );
			const p3 = new Plane( unit3, 3 );
			const p4 = new Plane( unit3, 4 );
			const p5 = new Plane( unit3, 5 );

			const b = new Frustum( p0, p1, p2, p3, p4, p5 );
			const a = new Frustum().copy( b );
			assert.ok( a.planes[ 0 ].equals( p0 ), 'Passed!' );
			assert.ok( a.planes[ 1 ].equals( p1 ), 'Passed!' );
			assert.ok( a.planes[ 2 ].equals( p2 ), 'Passed!' );
			assert.ok( a.planes[ 3 ].equals( p3 ), 'Passed!' );
			assert.ok( a.planes[ 4 ].equals( p4 ), 'Passed!' );
			assert.ok( a.planes[ 5 ].equals( p5 ), 'Passed!' );

			// ensure it is a true copy by modifying source
			b.planes[ 0 ] = p1;
			assert.ok( a.planes[ 0 ].equals( p0 ), 'Passed!' );

		} );

		QUnit.test( 'setFromProjectionMatrix/makeOrthographic/containsPoint', ( assert ) => {

			const m = new Matrix4().makeOrthographic( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );

			assert.ok( ! a.containsPoint( new Vector3( 0, 0, 0 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0, 0, - 50 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0, 0, - 1.001 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( - 1, - 1, - 1.001 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( - 1.1, - 1.1, - 1.001 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 1, 1, - 1.001 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( 1.1, 1.1, - 1.001 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0, 0, - 99.999 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( - 0.999, - 0.999, - 99.999 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( - 1.1, - 1.1, - 100.1 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0.999, 0.999, - 99.999 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( 1.1, 1.1, - 100.1 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( 0, 0, - 101 ) ), 'Passed!' );

		} );

		QUnit.test( 'setFromProjectionMatrix/makePerspective/containsPoint', ( assert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );

			assert.ok( ! a.containsPoint( new Vector3( 0, 0, 0 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0, 0, - 50 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0, 0, - 1.001 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( - 1, - 1, - 1.001 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( - 1.1, - 1.1, - 1.001 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 1, 1, - 1.001 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( 1.1, 1.1, - 1.001 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 0, 0, - 99.999 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( - 99.999, - 99.999, - 99.999 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( - 100.1, - 100.1, - 100.1 ) ), 'Passed!' );
			assert.ok( a.containsPoint( new Vector3( 99.999, 99.999, - 99.999 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( 100.1, 100.1, - 100.1 ) ), 'Passed!' );
			assert.ok( ! a.containsPoint( new Vector3( 0, 0, - 101 ) ), 'Passed!' );

		} );

		QUnit.test( 'setFromProjectionMatrix/makePerspective/intersectsSphere', ( assert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );

			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 0 ) ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 0.9 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 1.1 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 50 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 1.001 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( - 1, - 1, - 1.001 ), 0 ) ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( - 1.1, - 1.1, - 1.001 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( - 1.1, - 1.1, - 1.001 ), 0.5 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 1, 1, - 1.001 ), 0 ) ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 1.1, 1.1, - 1.001 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 1.1, 1.1, - 1.001 ), 0.5 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 99.999 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( - 99.999, - 99.999, - 99.999 ), 0 ) ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( - 100.1, - 100.1, - 100.1 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( - 100.1, - 100.1, - 100.1 ), 0.5 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 99.999, 99.999, - 99.999 ), 0 ) ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 100.1, 100.1, - 100.1 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 100.1, 100.1, - 100.1 ), 0.2 ) ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 101 ), 0 ) ), 'Passed!' );
			assert.ok( a.intersectsSphere( new Sphere( new Vector3( 0, 0, - 101 ), 1.1 ) ), 'Passed!' );

		} );

		QUnit.test( 'intersectsObject', ( assert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );
			const object = new Mesh( new BoxGeometry( 1, 1, 1 ) );
			let intersects;

			intersects = a.intersectsObject( object );
			assert.notOk( intersects, 'No intersection' );

			object.position.set( - 1, - 1, - 1 );
			object.updateMatrixWorld();

			intersects = a.intersectsObject( object );
			assert.ok( intersects, 'Successful intersection' );

			object.position.set( 1, 1, 1 );
			object.updateMatrixWorld();

			intersects = a.intersectsObject( object );
			assert.notOk( intersects, 'No intersection' );

		} );

		QUnit.test( 'intersectsSprite', ( assert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );
			const sprite = new Sprite();
			let intersects;

			intersects = a.intersectsSprite( sprite );
			assert.notOk( intersects, 'No intersection' );

			sprite.position.set( - 1, - 1, - 1 );
			sprite.updateMatrixWorld();

			intersects = a.intersectsSprite( sprite );
			assert.ok( intersects, 'Successful intersection' );

		} );

		QUnit.todo( 'intersectsSphere', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'intersectsBox', ( assert ) => {

			const m = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );
			const a = new Frustum().setFromProjectionMatrix( m );
			const box = new Box3( zero3.clone(), one3.clone() );
			let intersects;

			intersects = a.intersectsBox( box );
			assert.notOk( intersects, 'No intersection' );

			// add eps so that we prevent box touching the frustum,
			// which might intersect depending on floating point numerics
			box.translate( new Vector3( - 1 - eps, - 1 - eps, - 1 - eps ) );

			intersects = a.intersectsBox( box );
			assert.ok( intersects, 'Successful intersection' );

		} );

		QUnit.todo( 'containsPoint', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
