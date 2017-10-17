/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { SpotLight } from '../../../../src/lights/SpotLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'SpotLight', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5,
				distance: 100,
				angle: 0.8,
				penumbra: 8,
				decay: 2
			};

			lights = [
				new SpotLight( parameters.color ),
				new SpotLight( parameters.color, parameters.intensity ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle, parameters.penumbra ),
				new SpotLight( parameters.color, parameters.intensity, parameters.distance, parameters.angle, parameters.penumbra, parameters.decay ),
			];

		} );

		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
