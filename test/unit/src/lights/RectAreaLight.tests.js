/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { RectAreaLight } from '../../../../src/lights/RectAreaLight';

export default QUnit.module.todo( 'Lights', () => {

	QUnit.module.todo( 'RectAreaLight', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			this.lights = [
				new RectAreaLight( parameters.color ),
				new RectAreaLight( parameters.color, parameters.intensity ),
				new RectAreaLight( parameters.color, parameters.intensity, 5.0 ),
				new RectAreaLight( parameters.color, parameters.intensity, 5.0, 20.0 ),
				new RectAreaLight( parameters.color, parameters.intensity, undefined, 20.0 ),
			];

		} );

		QUnit.test( 'Standard light tests', function ( assert ) {

			runStdLightTests( assert, this.lights );

		} );

	} );

} );
