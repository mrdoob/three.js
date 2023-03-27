/* global QUnit */

import { PointLightShadow } from '../../../../src/lights/PointLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'PointLightShadow', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PointLightShadow();
			assert.strictEqual(
				object instanceof LightShadow, true,
				'PointLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PointLightShadow();
			assert.ok( object, 'Can instantiate a PointLightShadow.' );

		} );

		// PUBLIC
		QUnit.test( 'isPointLightShadow', ( assert ) => {

			const object = new PointLightShadow();
			assert.ok(
				object.isPointLightShadow,
				'PointLightShadow.isPointLightShadow should be true'
			);

		} );

		QUnit.todo( 'updateMatrices', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
