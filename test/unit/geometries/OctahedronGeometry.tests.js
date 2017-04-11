(function() {

	'use strict';

	var parameters = {
		radius: 10,
		detail: undefined
	};

	var geometries;

	QUnit.module( "Extras - Geometries - OctahedronGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.OctahedronGeometry(),
				new THREE.OctahedronGeometry( parameters.radius ),
				new THREE.OctahedronGeometry( parameters.radius, parameters.detail ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
