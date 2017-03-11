(function () {

	'use strict';

	var parameters = {
		radius: 10,
		widthSegments: 20,
		heightSegments: 30,
		phiStart: 0.5,
		phiLength: 1.0,
		thetaStart: 0.4,
		thetaLength: 2.0,
	};

	var geometries;

	QUnit.module( "Extras - Geometries - SphereBufferGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.SphereBufferGeometry(),
				new THREE.SphereBufferGeometry( parameters.radius ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart ),
				new THREE.SphereBufferGeometry( parameters.radius, parameters.widthSegments, parameters.heightSegments, parameters.phiStart, parameters.phiLength, parameters.thetaStart, parameters.thetaLength ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
