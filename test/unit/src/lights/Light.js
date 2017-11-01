/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "Light" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5
	};

	var lights = [
		new THREE.Light( parameters.color ),
		new THREE.Light( parameters.color, parameters.intensity )
	];

	runStdLightTests( lights, true );

} );
