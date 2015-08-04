(function () {

	'use strict';

	var parameters = {
		width: 10,
		height: 30,
		widthSegments: 3,
		heightSegments: 5
	};

	var geometries;

	QUnit.module( "Extras - Geometries - PlaneBufferGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.PlaneBufferGeometry(),
				new THREE.PlaneBufferGeometry( parameters.width ),
				new THREE.PlaneBufferGeometry( parameters.width, parameters.height ),
				new THREE.PlaneBufferGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new THREE.PlaneBufferGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
