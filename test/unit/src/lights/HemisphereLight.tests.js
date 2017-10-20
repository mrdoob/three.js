/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author moraxy / https://github.com/moraxy
 */
/* global QUnit */

import { HemisphereLight } from '../../../../src/lights/HemisphereLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'HemisphereLight', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				skyColor: 0x123456,
				groundColor: 0xabc012,
				intensity: 0.6
			};

			lights = [
				new HemisphereLight(),
				new HemisphereLight( parameters.skyColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor ),
				new HemisphereLight( parameters.skyColor, parameters.groundColor, parameters.intensity ),
			];

		} );

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "isHemisphereLight", ( assert ) => {} );

		QUnit.test( "copy", ( assert ) => {} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
