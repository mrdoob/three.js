import { ShapePath } from '../../../../../src/extras/core/ShapePath.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'ShapePath', () => {

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new ShapePath();
				assert.ok( object, 'Can instantiate a ShapePath.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new ShapePath();
				assert.ok(
					object.type === 'ShapePath',
					'ShapePath.type should be ShapePath'
				);

			} );

		} );

	} );

} );
