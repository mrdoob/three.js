(function () {

	'use strict';

	var parameters = {
		radius: 10,
		segments: 20,
		thetaStart: 0.1,
		thetaLength: 0.2
	};

	var geometries;

	QUnit.module( "Extras - Geometries - CircleBufferGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.CircleBufferGeometry(),
				new THREE.CircleBufferGeometry( parameters.radius ),
				new THREE.CircleBufferGeometry( parameters.radius, parameters.segments ),
				new THREE.CircleBufferGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new THREE.CircleBufferGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
