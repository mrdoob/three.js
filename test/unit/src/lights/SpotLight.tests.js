(function () {

	'use strict';

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5,
		distance: 100,
		angle: 0.8,
		exponent: 8,
		decay: 2
	};

	var lights;

	QUnit.module( "Lights - SpotLight", {

		beforeEach: function() {

			lights = [

				new THREE.SpotLight( parameters.color ),
				new THREE.SpotLight( parameters.color, parameters.intensity ),
				new THREE.SpotLight( parameters.color, parameters.intensity, parameters.distance ),
				new THREE.SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle ),
				new THREE.SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle, parameters.exponent ),
				new THREE.SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle, parameters.exponent, parameters.decay ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
