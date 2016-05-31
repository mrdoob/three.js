(function () {

	'use strict';

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5,
	};

	var shapes = {
		square: THREE.Polygon.makeSquare( 10.0 ),
		rectangle: THREE.Polygon.makeRectangle( 10.0, 5.0 ),
		circle: THREE.Polygon.makeCircle( 5.0, 20 ),
		star: THREE.Polygon.makeStar( 5, 5.0, 2.5 ),
		triangle: new THREE.Polygon( [
			new THREE.Vector3( -5.0, -5.0, 0 ),
			new THREE.Vector3(  0.0,  5.0, 0 ),
			new THREE.Vector3(  5.0, -5.0, 0 ),
		] )
	};

	var lights;

	// TODO (abelnation): verify this works

	QUnit.module( "Lights - AreaLight", {

		beforeEach: function() {

			lights = [

				new THREE.AreaLight( parameters.color ),
				new THREE.AreaLight( parameters.color, parameters.intensity ),
				new THREE.AreaLight( parameters.color, parameters.intensity, shapes.square ),
				new THREE.AreaLight( parameters.color, parameters.intensity, shapes.rectangle ),
				new THREE.AreaLight( parameters.color, parameters.intensity, shapes.circle ),
				new THREE.AreaLight( parameters.color, parameters.intensity, shapes.star ),
				new THREE.AreaLight( parameters.color, parameters.intensity, shapes.triangle )

			];

		}

	});

	QUnit.test( "standard light tests", function( assert ) {

		runStdLightTests( assert, lights );

	});

})();
