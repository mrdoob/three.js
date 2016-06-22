(function () {

	'use strict';

	var parameters = {
		radius: 10,
		detail: undefined
	};

	var geometries;

	QUnit.module( "Extras - Geometries - DodecahedronGeometry", {

		beforeEach: function() {

			geometries = [

				new THREE.DodecahedronGeometry(),
				new THREE.DodecahedronGeometry( parameters.radius ),
				new THREE.DodecahedronGeometry( parameters.radius, parameters.detail ),

			];

		}

	});

	QUnit.test( "standard geometry tests", function( assert ) {

		runStdGeometryTests( assert, geometries );

	});

})();
