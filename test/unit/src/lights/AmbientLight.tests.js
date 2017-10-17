/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author Anonymous
 */
/* global QUnit */

import { AmbientLight } from '../../../../src/lights/AmbientLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'ArrowHelper', ( hooks ) => {

		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa
			};

			this.lights = [
				new AmbientLight(),
				new AmbientLight( parameters.color )
			];

		} );

		QUnit.test( 'Standard light tests', function ( assert ) {

			runStdLightTests( assert, this.lights );

		} );

	} );

} );
