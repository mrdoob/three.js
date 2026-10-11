import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'CurvePath', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new CurvePath();
				assert.strictEqual(
					object instanceof Curve, true,
					'CurvePath extends from Curve'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				const object = new CurvePath();
				assert.ok( object, 'Can instantiate a CurvePath.' );

			} );

			QUnit.test( 'Empty path', ( assert ) => {

				const path = new CurvePath();
				assert.strictEqual( path.getLength(), 0, 'An empty path has zero length.' );
				assert.strictEqual( path.closePath(), path, 'Closing an empty path returns the path.' );
				assert.deepEqual( path.getPoints(), [], 'An empty path has no points.' );
				assert.deepEqual( path.getSpacedPoints(), [], 'An empty path has no spaced points.' );
				path.autoClose = true;
				assert.deepEqual( path.getSpacedPoints(), [], 'Auto-closing does not add null points.' );

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
