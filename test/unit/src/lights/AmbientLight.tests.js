/**
 * @author TristanVALCKE / https://github.com/Itee
 * @author moraxy / https://github.com/moraxy
 */
/* global QUnit */

import { AmbientLight } from '../../../../src/lights/AmbientLight';

export default QUnit.module( 'Lights', () => {

	QUnit.module.todo( 'ArrowHelper', ( hooks ) => {

		var lights = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				color: 0xaaaaaa,
				intensity: 0.5
			};

			lights = [
				new AmbientLight(),
				new AmbientLight( parameters.color ),
				new AmbientLight( parameters.color, parameters.intensity )
			];

		} );

		// INHERITANCE
		QUnit.test( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.test( "isAmbiantLight", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( 'Standard light tests', ( assert ) => {

			runStdLightTests( assert, lights );

		} );

	} );

} );
