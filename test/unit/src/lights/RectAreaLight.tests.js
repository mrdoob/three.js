/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { RectAreaLight } from '../../../../src/lights/RectAreaLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'RectAreaLight', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new RectAreaLight( parameters.color ),
				new RectAreaLight( parameters.color, parameters.intensity ),
				new RectAreaLight( parameters.color, parameters.intensity, 5.0 ),
				new RectAreaLight( parameters.color, parameters.intensity, 5.0, 20.0 ),
				new RectAreaLight( parameters.color, parameters.intensity, undefined, 20.0 ),
			];

		} );

		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
