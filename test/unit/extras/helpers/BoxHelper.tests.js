(function () {

	'use strict';

	var parameters = {
		diameter: 10
	};

	var geometries;

	QUnit.module( "Extras - Helpers - BoxHelper", {

		beforeEach: function() {
			var greenMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

			// Test with a normal cube and a box helper
			var boxGeometry = new THREE.BoxGeometry( parameters.diameter );
			var box = new THREE.Mesh( boxGeometry, greenMaterial );
			var boxHelper = new THREE.BoxHelper( box );

			// The same should happen with a comparable sphere
			var sphereGeometry = new THREE.SphereGeometry( parameters.diameter / 2 );
			var sphere = new THREE.Mesh( sphereGeometry, greenMaterial );
			var sphereBoxHelper = new THREE.BoxHelper( sphere );

			// Note that unlike what I'd like to, these doesn't check the equivalency of the two generated geometries
			geometries = [ boxHelper.geometry, sphereBoxHelper.geometry ];
		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {
		runStdGeometryTests( assert, geometries );
	});

})();
