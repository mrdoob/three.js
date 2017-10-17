/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "AmbientLight" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		color: 0xaaaaaa,
		intensity: 0.5
	};

	var lights = [
		new THREE.AmbientLight( parameters.color ),
		new THREE.AmbientLight( parameters.color, parameters.intensity )
	];

	runStdLightTests( lights );

} );
