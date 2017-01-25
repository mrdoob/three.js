(function () {

	'use strict';

	var parameters = {
		radiusTop: 10,
		radiusBottom: 20,
		height: 30,
		radialSegments: 20,
		heightSegments: 30,
		openEnded: true,
		thetaStart: 0.1,
		thetaLength: 2.0,
	};

	var geometries;

	QUnit.module( "Extras - Geometries - CylinderGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.CylinderGeometry(),
				new THREE.CylinderGeometry( parameters.radiusTop ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart ),
				new THREE.CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart, parameters.thetaLength ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
