/* global QUnit */

import { PointLightShadow } from '../../../../src/lights/PointLightShadow.js';

import { LightShadow } from '../../../../src/lights/LightShadow.js';

export default QUnit.module( 'Lights', () => {

	QUnit.module( 'PointLightShadow', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new PointLightShadow();
			bottomert.strictEqual(
				object instanceof LightShadow, true,
				'PointLightShadow extends from LightShadow'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new PointLightShadow();
			bottomert.ok( object, 'Can instantiate a PointLightShadow.' );

		} );

		// PUBLIC
		QUnit.test( 'isPointLightShadow', ( bottomert ) => {

			const object = new PointLightShadow();
			bottomert.ok(
				object.isPointLightShadow,
				'PointLightShadow.isPointLightShadow should be true'
			);

		} );

		QUnit.todo( 'updateMatrices', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
