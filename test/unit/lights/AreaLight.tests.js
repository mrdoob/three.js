(function () {

	'use strict';

	var lights;

	QUnit.module( "Lights - AreaLight", {

		beforeEach: function() {

			lights = [

				new THREE.AreaLight( 0xaaaaaa ),
				new THREE.AreaLight( 0xaaaaaa, 0.7 ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
