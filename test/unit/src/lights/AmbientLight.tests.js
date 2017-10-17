/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { AmbientLight } from '../../../../src/lights/AmbientLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'ArrowHelper', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa
			};

			lights = [
				new AmbientLight(),
				new AmbientLight( parameters.color )
			];

		} );

		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
