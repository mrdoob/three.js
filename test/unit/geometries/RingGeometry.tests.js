(function () {

	'use strict';

	var parameters = {
		innerRadius: 10,
		outerRadius: 60,
		thetaSegments: 12,
		phiSegments: 14,
		thetaStart: 0.1,
		thetaLength: 2.0
	};

	var geometries;

	QUnit.module( "Extras - Geometries - RingGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.RingGeometry(),
				new THREE.RingGeometry( parameters.innerRadius ),
				new THREE.RingGeometry( parameters.innerRadius, parameters.outerRadius ),
				new THREE.RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments ),
				new THREE.RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments ),
				new THREE.RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart ),
				new THREE.RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart, parameters.thetaLength ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
