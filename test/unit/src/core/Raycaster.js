/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "Raycaster" );

QUnit.test( "intersectObjects" , function( assert ) {
	var raycaster = getRaycaster();
	var objectsToCheck = getObjectsToCheck();

	assert.ok( raycaster.intersectObjects( objectsToCheck ).length === 1,
		"no recursive search should lead to one hit" );

	assert.ok( raycaster.intersectObjects( objectsToCheck, true ).length === 3,
		"recursive search should lead to three hits" );

	var intersections = raycaster.intersectObjects( objectsToCheck, true );
	for ( var i = 0; i < intersections.length - 1; i++ ) {

	  assert.ok( intersections[ i ].distance <= intersections[ i + 1 ].distance, "intersections are sorted" );

	}
});

QUnit.test( "intersectObject" , function( assert ) {
	var raycaster = getRaycaster();
	var objectsToCheck = getObjectsToCheck();

	assert.ok( raycaster.intersectObject( objectsToCheck[ 0 ] ).length === 1,
		"no recursive search should lead to one hit" );

	assert.ok( raycaster.intersectObject( objectsToCheck[ 0 ], true ).length === 3,
		"recursive search should lead to three hits" );

	var intersections = raycaster.intersectObject( objectsToCheck[ 0 ], true );
	for ( var i = 0; i < intersections.length - 1; i++ ) {

	  assert.ok( intersections[ i ].distance <= intersections[ i + 1 ].distance, "intersections are sorted" );

	}
});

QUnit.test( "setFromCamera" , function( assert ) {
	var raycaster = new THREE.Raycaster();
	var rayDirection = raycaster.ray.direction;
	var camera = new THREE.PerspectiveCamera( 90, 1, 1, 1000 );

	raycaster.setFromCamera( { x : 0, y: 0 }, camera );
	assert.ok( rayDirection.x === 0, rayDirection.y === 0, rayDirection.z === -1,
		"camera is looking straight to -z and so does the ray in the middle of the screen" );

	var step = 0.1;

	for ( var x = -1; x <= 1; x += step ) {

		for ( var y = -1; y <= 1; y += step ) {

			raycaster.setFromCamera( { x, y }, camera );

			var refVector = new THREE.Vector3( x, y, -1 ).normalize();

			checkRayDirectionAgainstReferenceVector( rayDirection, refVector, assert );

		}

	}
});

function checkRayDirectionAgainstReferenceVector( rayDirection, refVector, assert ) {
	assert.ok( refVector.x - rayDirection.x <= Number.EPSILON &&
			refVector.y - rayDirection.y <= Number.EPSILON &&
			refVector.z - rayDirection.z <= Number.EPSILON,
			"camera is pointing to the same direction as expected" );
}

function getRaycaster() {
	return raycaster = new THREE.Raycaster(
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( 0, 0, -1 ),
		1,
		100
	);
}

function getObjectsToCheck() {
	var objects = [];

	var sphere1 = getSphere();
	sphere1.position.set( 0, 0, -10 );
	sphere1.name = 1;
	objects.push( sphere1 );

	var sphere11 = getSphere();
	sphere11.position.set( 0, 0, 1 );
	sphere11.name = 11;
	sphere1.add( sphere11 );

	var sphere12 = getSphere();
	sphere12.position.set( 0, 0, -1 );
	sphere12.name = 12;
	sphere1.add( sphere12 );

	var sphere2 = getSphere();
	sphere2.position.set( -5, 0, -5 );
	sphere2.name = 2;
	objects.push( sphere2 );

	for ( var i = 0; i < objects.length; i++ ) {

		objects[ i ].updateMatrixWorld();

	}

	return objects;
}

function getSphere() {
	return new THREE.Mesh( new THREE.SphereGeometry( 1, 100, 100 ) );
}
