(function () {

	'use strict';

	var lights;

	QUnit.module( "Lights - AmbientLight", {

		beforeEach: function() {

			lights = [

				new THREE.AmbientLight( 0xaaaaaa ),

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
