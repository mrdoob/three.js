import { CurvePath } from '../../../../../src/extras/core/CurvePath.js';

import { Curve } from '../../../../../src/extras/core/Curve.js';
import { LineCurve } from '../../../../../src/extras/curves/LineCurve.js';
import { Vector2 } from '../../../../../src/math/Vector2.js';

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

			// PROPERTIES
			QUnit.test( 'type', ( assert ) => {

				const object = new Curve();
				assert.ok(
					object.type === 'Curve',
					'Curve.type should be Curve'
				);

			} );

			QUnit.test( 'copy/fromJSON invalidate cached curve lengths', ( assert ) => {

				for ( const method of [ 'copy', 'fromJSON' ] ) {

					const path = new CurvePath();
					path.add( new LineCurve( new Vector2( 0, 0 ), new Vector2( 1, 0 ) ) );
					path.add( new LineCurve( new Vector2( 1, 0 ), new Vector2( 2, 0 ) ) );

					const source = new CurvePath();
					source.add( new LineCurve( new Vector2( 0, 0 ), new Vector2( 10, 0 ) ) );
					source.add( new LineCurve( new Vector2( 10, 0 ), new Vector2( 30, 0 ) ) );

					assert.strictEqual( path.getLength(), 2, 'Cache the original curve lengths' );

					const input = method === 'copy' ? source : source.toJSON();
					assert.strictEqual( path[ method ]( input ), path, method + ' returns this' );
					assert.strictEqual( path.getLength(), 30, method + ' updates the cached length' );
					assert.deepEqual(
						path.getPoint( 0.5 ), new Vector2( 15, 0 ),
						method + ' uses the new segment lengths to locate a point'
					);

				}

			} );

		} );

	} );

} );
