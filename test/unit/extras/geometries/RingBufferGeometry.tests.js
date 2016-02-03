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

	QUnit.module( "Extras - Geometries - RingBufferGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.RingBufferGeometry(),
				new THREE.RingBufferGeometry( parameters.innerRadius ),
				new THREE.RingBufferGeometry( parameters.innerRadius, parameters.outerRadius ),
				new THREE.RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments ),
				new THREE.RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments ),
				new THREE.RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart ),
				new THREE.RingBufferGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart, parameters.thetaLength ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
