/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "SpotLight" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5,
		distance: 100,
		angle: 0.8,
		penumbra: 8,
		decay: 2
	};

	var lights = [
		new THREE.SpotLight( parameters.color ),
		new THREE.SpotLight( parameters.color, parameters.intensity ),
		new THREE.SpotLight(
			parameters.color, parameters.intensity, parameters.distance
		),
		new THREE.SpotLight(
			parameters.color, parameters.intensity, parameters.distance,
			parameters.angle
		),
		new THREE.SpotLight(
			parameters.color, parameters.intensity, parameters.distance,
			parameters.angle, parameters.penumbra
		),
		new THREE.SpotLight(
			parameters.color, parameters.intensity, parameters.distance,
			parameters.angle, parameters.penumbra, parameters.decay
		)
	];

	runStdLightTests( lights );

} );

QUnit.test( "power", function ( assert ) {

	var a = new THREE.SpotLight( 0xaaaaaa );

	a.intensity = 100;
	assert.numEqual( a.power, 100 * Math.PI, "Correct power for an intensity of 100" );

	a.intensity = 40;
	assert.numEqual( a.power, 40 * Math.PI, "Correct power for an intensity of 40" );

	a.power = 100;
	assert.numEqual( a.intensity, 100 / Math.PI, "Correct intensity for a power of 100" );

} );
