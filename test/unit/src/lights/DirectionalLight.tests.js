/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { DirectionalLight } from '../../../../src/lights/DirectionalLight';

export default QUnit.module.todo( 'Lights', () => {

	QUnit.module.todo( 'DirectionalLight', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			this.lights = [
				new DirectionalLight(),
				new DirectionalLight( parameters.color ),
				new DirectionalLight( parameters.color, parameters.intensity )
			];

		} );

		QUnit.test( 'Standard light tests', function ( assert ) {

			runStdLightTests( assert, this.lights );

		} );

	} );

} );
