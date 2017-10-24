/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "RectAreaLight" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5,
		width: 100,
		height: 50
	};

	var lights = [
		new THREE.RectAreaLight( parameters.color ),
		new THREE.RectAreaLight( parameters.color, parameters.intensity ),
		new THREE.RectAreaLight(
			parameters.color, parameters.intensity, parameters.width
		),
		new THREE.RectAreaLight(
			parameters.color, parameters.intensity, parameters.width, parameters.height
		)
	];

	runStdLightTests( lights );

} );
