import { Curve } from '../../../../../src/extras/core/Curve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'Curve', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new Curve();
				assert.ok( object, 'Can instantiate a Curve.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new Curve();
				assert.ok(
					object.type === 'Curve',
					'Curve.type should be Curve'
				);

			} );

		} );

	} );

} );
