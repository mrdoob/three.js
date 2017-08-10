(function () {

	'use strict';

	var lights;

	QUnit.module( "Lights - DirectionalLight", {

		beforeEach: function() {

			lights = [

				new THREE.DirectionalLight( 0xaaaaaa ),
				new THREE.DirectionalLight( 0xaaaaaa, 0.8 ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
