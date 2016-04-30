(function () {

	'use strict';

	var parameters = {
		radius: 10,
		tube: 20,
		tubularSegments: 30,
		radialSegments: 10,
		p: 3,
		q: 2
	};

	var geometries;

	QUnit.module( "Extras - Geometries - TorusKnotGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.TorusKnotGeometry(),
				new THREE.TorusKnotGeometry( parameters.radius ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments, parameters.p, parameters.q ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
