/* global QUnit */

import { Raycaster } from '../../../../src/core/Raycaster';
import { Vector3 } from '../../../../src/math/Vector3';
import { Mesh } from '../../../../src/objects/Mesh';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry';
import { BufferGeometry } from '../../../../src/core/BufferGeometry';
import { Line } from '../../../../src/objects/Line.js';
import { Points } from '../../../../src/objects/Points.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera';
import { OrthographicCamera } from '../../../../src/cameras/OrthographicCamera';

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

	var objects = [];

	var sphere1 = getSphere();
	sphere1.position.set( 0, 0, - 10 );
	sphere1.name = 1;
	objects.push( sphere1 );

	var sphere11 = getSphere();
	sphere11.position.set( 0, 0, 1 );
	sphere11.name = 11;
	sphere1.add( sphere11 );

	var sphere12 = getSphere();
	sphere12.position.set( 0, 0, - 1 );
	sphere12.name = 12;
	sphere1.add( sphere12 );

	var sphere2 = getSphere();
	sphere2.position.set( - 5, 0, - 5 );
	sphere2.name = 2;
	objects.push( sphere2 );

	for ( var i = 0; i < objects.length; i ++ ) {

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
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'set', ( assert ) => {

			var origin = new Vector3( 0, 0, 0 );
			var direction = new Vector3( 0, 0, - 1 );
			var a = new Raycaster( origin.clone(), direction.clone() );

			assert.deepEqual( a.ray.origin, origin, 'Origin is correct' );
			assert.deepEqual( a.ray.direction, direction, 'Direction is correct' );

			origin.set( 1, 1, 1 );
			direction.set( - 1, 0, 0 );
			a.set( origin, direction );

			assert.deepEqual( a.ray.origin, origin, 'Origin was set correctly' );
			assert.deepEqual( a.ray.direction, direction, 'Direction was set correctly' );

		} );

		QUnit.test( 'setFromCamera (Perspective)', ( assert ) => {

			var raycaster = new Raycaster();
			var rayDirection = raycaster.ray.direction;
			var camera = new PerspectiveCamera( 90, 1, 1, 1000 );

			raycaster.setFromCamera( {
				x: 0,
				y: 0
			}, camera );
			assert.ok( rayDirection.x === 0 && rayDirection.y === 0 && rayDirection.z === - 1,
				'camera is looking straight to -z and so does the ray in the middle of the screen' );

			var step = 0.1;

			for ( var x = - 1; x <= 1; x += step ) {

				for ( var y = - 1; y <= 1; y += step ) {

					raycaster.setFromCamera( {
						x,
						y
					}, camera );

					var refVector = new Vector3( x, y, - 1 ).normalize();

					checkRayDirectionAgainstReferenceVector( rayDirection, refVector, assert );

				}

			}

		} );

		QUnit.test( 'setFromCamera (Orthographic)', ( assert ) => {

			var raycaster = new Raycaster();
			var rayOrigin = raycaster.ray.origin;
			var rayDirection = raycaster.ray.direction;
			var camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1000 );
			var expectedOrigin = new Vector3( 0, 0, 0 );
			var expectedDirection = new Vector3( 0, 0, - 1 );

			raycaster.setFromCamera( {
				x: 0,
				y: 0
			}, camera );
			assert.deepEqual( rayOrigin, expectedOrigin, 'Ray origin has the right coordinates' );
			assert.deepEqual( rayDirection, expectedDirection, 'Camera and Ray are pointing towards -z' );

		} );

		QUnit.test( 'intersectObject', ( assert ) => {

			var raycaster = getRaycaster();
			var objectsToCheck = getObjectsToCheck();

			assert.ok( raycaster.intersectObject( objectsToCheck[ 0 ], false ).length === 1,
				'no recursive search should lead to one hit' );

			assert.ok( raycaster.intersectObject( objectsToCheck[ 0 ] ).length === 3,
				'recursive search should lead to three hits' );

			var intersections = raycaster.intersectObject( objectsToCheck[ 0 ] );
			for ( var i = 0; i < intersections.length - 1; i ++ ) {

				assert.ok( intersections[ i ].distance <= intersections[ i + 1 ].distance, 'intersections are sorted' );

			}

		} );

		QUnit.test( 'intersectObjects', ( assert ) => {

			var raycaster = getRaycaster();
			var objectsToCheck = getObjectsToCheck();

			assert.ok( raycaster.intersectObjects( objectsToCheck, false ).length === 1,
				'no recursive search should lead to one hit' );

			assert.ok( raycaster.intersectObjects( objectsToCheck ).length === 3,
				'recursive search should lead to three hits' );

			var intersections = raycaster.intersectObjects( objectsToCheck );
			for ( var i = 0; i < intersections.length - 1; i ++ ) {

				assert.ok( intersections[ i ].distance <= intersections[ i + 1 ].distance, 'intersections are sorted' );

			}

		} );

		QUnit.test( 'Line intersection threshold', ( assert ) => {

			var raycaster = getRaycaster();
			var points = [ new Vector3( - 2, - 10, - 5 ), new Vector3( - 2, 10, - 5 ) ];
			var geometry = new BufferGeometry().setFromPoints( points );
			var line = new Line( geometry, null );

			raycaster.params.Line.threshold = 1.999;
			assert.ok( raycaster.intersectObject( line ).length === 0,
				'no Line intersection with a not-large-enough threshold' );

			raycaster.params.Line.threshold = 2.001;
			assert.ok( raycaster.intersectObject( line ).length === 1,
				'successful Line intersection with a large-enough threshold' );

		} );

		QUnit.test( 'Points intersection threshold', ( assert ) => {

			var raycaster = getRaycaster();
			var coordinates = [ new Vector3( - 2, 0, - 5 ) ];
			var geometry = new BufferGeometry().setFromPoints( coordinates );
			var points = new Points( geometry, null );

			raycaster.params.Points.threshold = 1.999;
			assert.ok( raycaster.intersectObject( points ).length === 0,
				'no Points intersection with a not-large-enough threshold' );

			raycaster.params.Points.threshold = 2.001;
			assert.ok( raycaster.intersectObject( points ).length === 1,
				'successful Points intersection with a large-enough threshold' );

		} );


	} );

} );
