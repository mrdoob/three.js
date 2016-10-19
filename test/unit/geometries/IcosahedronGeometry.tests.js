(function () {

	'use strict';

	var parameters = {
		radius: 10,
		detail: undefined
	};

	var geometries;

	QUnit.module( "Extras - Geometries - IcosahedronGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.IcosahedronGeometry(),
				new THREE.IcosahedronGeometry( parameters.radius ),
				new THREE.IcosahedronGeometry( parameters.radius, parameters.detail ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
