import { SphericalHarmonics3 } from '../../../../src/math/SphericalHarmonics3.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'SphericalHarmonics3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new SphericalHarmonics3();
			assert.ok( object, 'Can instantiate a SphericalHarmonics3.' );

		} );

		// PUBLIC
		QUnit.test( 'isSphericalHarmonics3', ( assert ) => {

			const object = new SphericalHarmonics3();
			assert.ok(
				object.isSphericalHarmonics3,
				'SphericalHarmonics3.isSphericalHarmonics3 should be true'
			);

		} );

		// PUBLIC - STATIC

	} );

} );
