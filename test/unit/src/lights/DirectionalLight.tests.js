/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { DirectionalLight } from '../../../../src/lights/DirectionalLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'DirectionalLight', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			lights = [
				new DirectionalLight(),
				new DirectionalLight( parameters.color ),
				new DirectionalLight( parameters.color, parameters.intensity )
			];

		} );

		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
