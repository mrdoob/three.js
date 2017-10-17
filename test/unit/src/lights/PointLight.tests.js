/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { PointLight } from '../../../../src/lights/PointLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'PointLight', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			lights = [
				new PointLight(),
				new PointLight( parameters.color ),
				new PointLight( parameters.color, parameters.intensity )
			];

		} );

		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
