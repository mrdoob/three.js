(function () {

	'use strict';

	var parameters = {
		radius: 10,
		detail: undefined
	};

	var geometries;

	QUnit.module( "Extras - Geometries - TetrahedronGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.TetrahedronGeometry(),
				new THREE.TetrahedronGeometry( parameters.radius ),
				new THREE.TetrahedronGeometry( parameters.radius, parameters.detail ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
