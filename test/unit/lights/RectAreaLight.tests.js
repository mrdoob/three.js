(function () {

	'use strict';

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5,
	};

	var lights;

	// TODO (abelnation): verify this works

	QUnit.module( "Lights - RectAreaLight", {

		beforeEach: function() {

			lights = [

				new THREE.RectAreaLight( parameters.color ),
				new THREE.RectAreaLight( parameters.color, parameters.intensity ),
				new THREE.RectAreaLight( parameters.color, parameters.intensity, 5.0 ),
				new THREE.RectAreaLight( parameters.color, parameters.intensity, 5.0, 20.0 ),
				new THREE.RectAreaLight( parameters.color, parameters.intensity, undefined, 20.0 ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
