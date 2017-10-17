/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { PointLight } from '../../../../src/lights/PointLight';

export default QUnit.module.todo( 'Lights', () => {

	QUnit.module.todo( 'PointLight', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.8
			};

			this.lights = [
				new PointLight(),
				new PointLight( parameters.color ),
				new PointLight( parameters.color, parameters.intensity )
			];

		} );

		QUnit.test( 'Standard light tests', function ( assert ) {

			runStdLightTests( assert, this.lights );

		} );

	} );

} );
