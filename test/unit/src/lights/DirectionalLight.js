/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "DirectionalLight" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5
	};

	var lights = [
		new THREE.DirectionalLight( parameters.color ),
		new THREE.DirectionalLight( parameters.color, parameters.intensity )
	];

	runStdLightTests( lights );

} );
