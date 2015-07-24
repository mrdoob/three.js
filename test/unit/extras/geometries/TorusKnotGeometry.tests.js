(function () {

	'use strict';

	var parameters = {
		radius: 10,
		tube: 20,
		radialSegments: 30,
		tubularSegments: 10,
		p: 3,
		q: 2,
		heightScale: 2.0
	};

	var geometries;

	QUnit.module( "Extras - Geometries - TorusKnotGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.TorusKnotGeometry(),
				new THREE.TorusKnotGeometry( parameters.radius ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new THREE.TorusKnotGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.p, parameters.q, parameters.heightScale ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
