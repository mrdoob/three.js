/**
 * @author simonThiele / https://github.com/simonThiele
 */

QUnit.module( "OrthographicCamera" );

QUnit.test( "updateProjectionMatrix" , function( assert ) {
	var left = -1, right = 1, top = 1, bottom = -1, near = 1, far = 3;
	var cam = new THREE.OrthographicCamera(left, right, top, bottom, near, far);

	// updateProjectionMatrix is called in contructor
	var pMatrix = cam.projectionMatrix.elements;

	// orthographic projection is given my the 4x4 Matrix
	// 2/r-l		0			 0		-(l+r/r-l)
	//   0		2/t-b		 0		-(t+b/t-b)
	//   0			0		-2/f-n	-(f+n/f-n)
	//   0			0			 0				1

	assert.ok( pMatrix[0] === 2 / ( right - left ), "m[0,0] === 2 / (r - l)" );
	assert.ok( pMatrix[5] === 2 / ( top - bottom ), "m[1,1] === 2 / (t - b)" );
	assert.ok( pMatrix[10] === -2 / ( far - near ), "m[2,2] === -2 / (f - n)" );
	assert.ok( pMatrix[12] === - ( ( right + left ) / ( right - left ) ), "m[3,0] === -(r+l/r-l)" );
	assert.ok( pMatrix[13] === - ( ( top + bottom ) / ( top - bottom ) ), "m[3,1] === -(t+b/b-t)" );
	assert.ok( pMatrix[14] === - ( ( far + near ) / ( far - near ) ), "m[3,2] === -(f+n/f-n)" );
});

QUnit.test( "clone" , function( assert ) {
	var left = -1.5, right = 1.5, top = 1, bottom = -1, near = 0.1, far = 42;
	var cam = new THREE.OrthographicCamera(left, right, top, bottom, near, far);

	var clonedCam = cam.clone();

	assert.ok( cam.left === clonedCam.left , "left is equal" );
	assert.ok( cam.right === clonedCam.right , "right is equal" );
	assert.ok( cam.top === clonedCam.top , "top is equal" );
	assert.ok( cam.bottom === clonedCam.bottom , "bottom is equal" );
	assert.ok( cam.near === clonedCam.near , "near is equal" );
	assert.ok( cam.far === clonedCam.far , "far is equal" );
	assert.ok( cam.zoom === clonedCam.zoom , "zoom is equal" );
});
