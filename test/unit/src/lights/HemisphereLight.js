/**
 * @author moraxy / https://github.com/moraxy
 */

QUnit.module( "HemisphereLight" );

QUnit.test( "Standard Light tests", function ( assert ) {

	var parameters = {
		skyColor: 0x123456,
		groundColor: 0xabc012,
		intensity: 0.6
	};

	var lights = [
		new THREE.HemisphereLight( parameters.skyColor ),
		new THREE.HemisphereLight( parameters.skyColor, parameters.groundColor ),
		new THREE.HemisphereLight(
			parameters.skyColor, parameters.groundColor, parameters.intensity
		)
	];

	runStdLightTests( lights );

} );
