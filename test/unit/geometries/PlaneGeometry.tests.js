(function () {

	'use strict';

	var parameters = {
		width: 10,
		height: 30,
		widthSegments: 3,
		heightSegments: 5
	};

	var geometries;

	QUnit.module( "Extras - Geometries - PlaneGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.PlaneGeometry(),
				new THREE.PlaneGeometry( parameters.width ),
				new THREE.PlaneGeometry( parameters.width, parameters.height ),
				new THREE.PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new THREE.PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
