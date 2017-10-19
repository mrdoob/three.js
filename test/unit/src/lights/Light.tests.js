/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Light } from '../../../../src/lights/Light';

export default QUnit.module( 'Lights', () => {

	QUnit.module.todo( 'Light', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new Light(),
				new Light( parameters.color ),
				new Light( parameters.color, parameters.intensity )
			];

		} );

		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
