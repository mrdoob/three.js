(function () {

	'use strict';

	var parameters = {
		skyColor: 0x123456,
		groundColor: 0xabc012,
		intensity: 0.6
	};

	var lights;

	QUnit.module( "Lights - HemisphereLight", {

		beforeEach: function() {

			lights = [

				new THREE.HemisphereLight( parameters.skyColor ),
				new THREE.HemisphereLight( parameters.skyColor, parameters.groundColor ),
				new THREE.HemisphereLight( parameters.skyColor, parameters.groundColor, parameters.intensity ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
