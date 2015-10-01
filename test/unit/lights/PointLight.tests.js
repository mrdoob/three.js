(function () {

	'use strict';

	var lights;

	QUnit.module( "Lights - PointLight", {

		beforeEach: function() {

			lights = [

				new THREE.PointLight( 0xaaaaaa ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
