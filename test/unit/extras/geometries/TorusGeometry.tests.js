(function () {

	'use strict';

	var parameters = {
		radius: 10,
		tube: 20,
		radialSegments: 30,
		tubularSegments: 10,
		arc: 2.0,
	};

	var geometries;

	QUnit.module( "Extras - Geometries - TorusGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.TorusGeometry(),
				new THREE.TorusGeometry( parameters.radius ),
				new THREE.TorusGeometry( parameters.radius, parameters.tube ),
				new THREE.TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new THREE.TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new THREE.TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
