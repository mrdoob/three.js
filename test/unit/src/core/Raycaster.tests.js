/* global QUnit */

import { Raycaster } from '../../../../src/core/Raycaster.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { Line } from '../../../../src/objects/Line.js';
import { Points } from '../../../../src/objects/Points.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera.js';

function checkRayDirectionAgainstReferenceVector( rayDirection, refVector, assert ) {

	assert.ok( refVector.x - rayDirection.x <= Number.EPSILON && refVector.y - rayDirection.y <= Number.EPSILON && refVector.z - rayDirection.z <= Number.EPSILON, 'camera is pointing to' +
		' the same direction as expected' );

}

function getRaycaster() {

	return new Raycaster(
		new Vector3( 0, 0, 0 ),
		new Vector3( 0, 0, - 1 ),
		1,
		100
	);

}

function getObjectsToCheck() {

	const objects = [];

	const sphere1 = getSphere();
	sphere1.position.set( 0, 0, - 10 );
	sphere1.name = 1;
	objects.push( sphere1 );

	const sphere11 = getSphere();
	sphere11.position.set( 0, 0, 1 );
	sphere11.name = 11;
	sphere1.add( sphere11 );

	const sphere12 = getSphere();
	sphere12.position.set( 0, 0, - 1 );
	sphere12.name = 12;
	sphere1.add( sphere12 );

	const sphere2 = getSphere();
	sphere2.position.set( - 5, 0, - 5 );
	sphere2.name = 2;
	objects.push( sphere2 );

	for ( let i = 0; i < objects.length; i ++ ) {

		objects[ i ].updateMatrixWorld();

	}

	return objects;

}

function getSphere() {

	return new Mesh( new SphereGeometry( 1, 100, 100 ) );

}

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Raycaster', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			// no params
			const object = new Raycaster();
			assert.ok( object, 'Can instantiate a Raycaster.' );

		} );

		// PROPERTIES
		QUnit.todo( 'ray', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'near', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'far', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'camera', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'layers', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'params', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( assert ) => {

			const origin = new Vector3( 0, 0, 0 );
			const direction = new Vector3( 0, 0, - 1 );
			const a = new Raycaster( origin.clone(), direction.clone() );

			assert.deepEqual( a.ray.origin, origin, 'Origin is correct' );
			assert.deepEqual( a.ray.direction, direction, 'Direction is correct' );

			origin.set( 1, 1, 1 );
			direction.set( - 1, 0, 0 );
			a.set( origin, direction );

			assert.deepEqual( a.ray.origin, origin, 'Origin was set correctly' );
			assert.deepEqual( a.ray.direction, direction, 'Direction was set correctly' );

		} );

		QUnit.test( 'setFromCamera (Perspective)', ( assert ) => {

			const raycaster = new Raycaster();
			const rayDirection = raycaster.ray.direction;
			const camera = new PerspectiveCamera( 90, 1, 1, 1000 );

			raycaster.setFromCamera( {
				x: 0,
				y: 0
			}, camera );
			assert.ok( rayDirection.x === 0 && rayDirection.y === 0 && rayDirection.z === - 1,
				'camera is looking straight to -z and so does the ray in the middle of the screen' );

			const step = 0.1;

			for ( let x = - 1; x <= 1; x += step ) {

				for ( let y = - 1; y <= 1; y += step ) {

					raycaster.setFromCamera( {
						x,
						y
					}, camera );

					const refVector = new Vector3( x, y, - 1 ).normalize();

					checkRayDirectionAgainstReferenceVector( rayDirection, refVector, assert );

				}

			}

		} );

		QUnit.test( 'setFromCamera (Orthographic)', ( assert ) => {

			const raycaster = new Raycaster();
			const rayOrigin = raycaster.ray.origin;
			const rayDirection = raycaster.ray.direction;
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1000 );
			const expectedOrigin = new Vector3( 0, 0, 0 );
			const expectedDirection = new Vector3( 0, 0, - 1 );

			raycaster.setFromCamera( {
				x: 0,
				y: 0
			}, camera );
			assert.deepEqual( rayOrigin, expectedOrigin, 'Ray origin has the right coordinates' );
			assert.deepEqual( rayDirection, expectedDirection, 'Camera and Ray are pointing towards -z' );

		} );

		QUnit.test( 'intersectObject', ( assert ) => {

			const raycaster = getRaycaster();
			const objectsToCheck = getObjectsToCheck();

			assert.ok( raycaster.intersectObject( objectsToCheck[ 0 ], false ).length === 1,
				'no recursive search should lead to one hit' );

			assert.ok( raycaster.intersectObject( objectsToCheck[ 0 ] ).length === 3,
				'recursive search should lead to three hits' );

			const intersections = raycaster.intersectObject( objectsToCheck[ 0 ] );
			for ( let i = 0; i < intersections.length - 1; i ++ ) {

				assert.ok( intersections[ i ].distance <= intersections[ i + 1 ].distance, 'intersections are sorted' );

			}

		} );

		QUnit.test( 'intersectObjects', ( assert ) => {

			const raycaster = getRaycaster();
			const objectsToCheck = getObjectsToCheck();

			assert.ok( raycaster.intersectObjects( objectsToCheck, false ).length === 1,
				'no recursive search should lead to one hit' );

			assert.ok( raycaster.intersectObjects( objectsToCheck ).length === 3,
				'recursive search should lead to three hits' );

			const intersections = raycaster.intersectObjects( objectsToCheck );
			for ( let i = 0; i < intersections.length - 1; i ++ ) {

				assert.ok( intersections[ i ].distance <= intersections[ i + 1 ].distance, 'intersections are sorted' );

			}

		} );

		QUnit.test( 'Line intersection threshold', ( assert ) => {

			const raycaster = getRaycaster();
			const points = [ new Vector3( - 2, - 10, - 5 ), new Vector3( - 2, 10, - 5 ) ];
			const geometry = new BufferGeometry().setFromPoints( points );
			const line = new Line( geometry, null );

			raycaster.params.Line.threshold = 1.999;
			assert.ok( raycaster.intersectObject( line ).length === 0,
				'no Line intersection with a not-large-enough threshold' );

			raycaster.params.Line.threshold = 2.001;
			assert.ok( raycaster.intersectObject( line ).length === 1,
				'successful Line intersection with a large-enough threshold' );

		} );

		QUnit.test( 'Points intersection threshold', ( assert ) => {

			const raycaster = getRaycaster();
			const coordinates = [ new Vector3( - 2, 0, - 5 ) ];
			const geometry = new BufferGeometry().setFromPoints( coordinates );
			const points = new Points( geometry, null );

			raycaster.params.Points.threshold = 1.999;
			assert.ok( raycaster.intersectObject( points ).length === 0,
				'no Points intersection with a not-large-enough threshold' );

			raycaster.params.Points.threshold = 2.001;
			assert.ok( raycaster.intersectObject( points ).length === 1,
				'successful Points intersection with a large-enough threshold' );

		} );

	} );

} );
