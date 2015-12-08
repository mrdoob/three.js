/**
 * @author simonThiele / https://github.com/simonThiele
 */

var chai = require( 'chai' );
var expect = chai.expect;
var assert = chai.assert;

// is needed until three.js build file contains the self fix
self = global;

var THREE = require( '../../../build/three' );


describe( 'Camera', function() {

	describe( 'lookAt', function () {

		it( 'should calculate the correct x rotation value', function () {

		  var cam = new THREE.Camera();
			cam.lookAt( new THREE.Vector3( 0, 1, -1 ) );

			expect( cam.rotation.x * (180 / Math.PI) ).to.equal( 45 );

    });

		it( 'should clone', function () {

				var cam = new THREE.Camera();

				// fill the matrices with any nonsense values just to see if they get copied
				cam.matrixWorldInverse.set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
				cam.projectionMatrix.set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );

				var clonedCam = cam.clone();

				assert.equal( cam.matrixWorldInverse.equals( clonedCam.matrixWorldInverse ), true, "matrixWorldInverse is equal" );
				assert.equal( cam.projectionMatrix.equals( clonedCam.projectionMatrix ), true, "projectionMatrix is equal" );

    });

  });

});
