/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { HemisphereLight } from '../../../../src/lights/HemisphereLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'HemisphereLight', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				skyColor: 0x123456,
				groundColor: 0xabc012,
				intensity: 0.6
			};

			this.lights = [
				new HemisphereLight(),
				new HemisphereLight( parameters.skyColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor, parameters.intensity ),
			];

		} );

		QUnit.test( 'Standard light tests', function ( assert ) {

			runStdLightTests( assert, this.lights );

		} );

	} );

} );
