/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "PointLight" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5,
		distance: 100,
		decay: 2
	};

	var lights = [
		new THREE.PointLight( parameters.color ),
		new THREE.PointLight( parameters.color, parameters.intensity ),
		new THREE.PointLight(
			parameters.color, parameters.intensity, parameters.distance
		),
		new THREE.PointLight(
			parameters.color, parameters.intensity, parameters.distance,
			parameters.decay
		)
	];

	runStdLightTests( lights );

} );

QUnit.test( "power", function ( assert ) {

	var a = new THREE.PointLight( 0xaaaaaa );

	a.intensity = 100;
	assert.numEqual( a.power, 100 * Math.PI * 4, "Correct power for an intensity of 100" );

	a.intensity = 40;
	assert.numEqual( a.power, 40 * Math.PI * 4, "Correct power for an intensity of 40" );

	a.power = 100;
	assert.numEqual( a.intensity, 100 / ( 4 * Math.PI ), "Correct intensity for a power of 100" );

} );
