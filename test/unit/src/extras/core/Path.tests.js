import { Path } from '../../../../../src/extras/core/Path.js';

import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'Path', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new Path();
				assert.strictEqual(
					object instanceof CurvePath, true,
					'Path extends from CurvePath'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new Path();
				assert.ok( object, 'Can instantiate a Path.' );

			} );

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new Path();
				assert.ok(
					object.type === 'Path',
					'Path.type should be Path'
				);

			} );

		} );

	} );

} );
