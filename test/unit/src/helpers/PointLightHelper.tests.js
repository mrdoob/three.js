import { PointLightHelper } from '../../../../src/helpers/PointLightHelper.js';

import { PointLight } from '../../../../src/lights/PointLight.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'PointLightHelper', () => {

		const parameters = {
			size: 1,
			color: 0xaaaaaa,
			intensity: 0.5,
			decay: 2
		};

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.size );
			assert.ok( object, 'Can instantiate a PointLightHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.size );
			assert.ok(
				object.type === 'PointLightHelper',
				'PointLightHelper.type should be PointLightHelper'
			);

		} );

		// PUBLIC
		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const light = new PointLight( parameters.color );
			const object = new PointLightHelper( light, parameters.size );
			object.dispose();

		} );

	} );

} );
