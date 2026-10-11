import { QuaternionLinearInterpolant } from '../../../../../src/math/interpolants/QuaternionLinearInterpolant.js';

import { Interpolant } from '../../../../../src/math/Interpolant.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Interpolants', () => {

		QUnit.module( 'QuaternionLinearInterpolant', () => {

			// INHERITANCE
			QUnit.test( 'Extending', ( assert ) => {

				const object = new QuaternionLinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.strictEqual(
					object instanceof Interpolant, true,
					'QuaternionLinearInterpolant extends from Interpolant'
				);

			} );

			// INSTANCING
			QUnit.test( 'Instancing', ( assert ) => {

				// parameterPositions, sampleValues, sampleSize, resultBuffer
				const object = new QuaternionLinearInterpolant( null, [ 1, 11, 2, 22, 3, 33 ], 2, [] );
				assert.ok( object, 'Can instantiate a QuaternionLinearInterpolant.' );

			} );

			QUnit.test( 'evaluate multiple quaternions per sample', ( assert ) => {

				const values = new Float64Array( [
					0, 0, 0, 1, 0, 0, 0, 1,
					1, 0, 0, 0, 0, 1, 0, 0,
					0, 0, 0, 1, 0, 0, 0, 1
				] );

				for ( const buffer of [ undefined, new Float64Array( 8 ) ] ) {

					const interpolant = new QuaternionLinearInterpolant( [ 0, 1, 2 ], values, 8, buffer );

					for ( const time of [ 0, 0.25, 0.5, 1, 1.5, 2, 0.5 ] ) {

						const angle = Math.min( time, 2 - time ) * Math.PI / 2;
						const expected = [ Math.sin( angle ), 0, 0, Math.cos( angle ), 0, Math.sin( angle ), 0, Math.cos( angle ) ];
						const result = interpolant.evaluate( time );

						assert.strictEqual( result, buffer || interpolant.resultBuffer, 'Reuses the result buffer.' );

						for ( let i = 0; i < expected.length; i ++ ) {

							assert.numEqual( result[ i ], expected[ i ], `Quaternion component ${i} at t=${time}.` );

						}

					}

				}

			} );

			QUnit.test( 'evaluate a single quaternion', ( assert ) => {

				const interpolant = new QuaternionLinearInterpolant( [ 0, 1 ], new Float64Array( [
					0, 0, 0, 1,
					1, 0, 0, 0
				] ), 4 );
				const result = interpolant.evaluate( 0.5 );

				assert.numEqual( result[ 0 ], Math.SQRT1_2 );
				assert.strictEqual( result[ 1 ], 0 );
				assert.strictEqual( result[ 2 ], 0 );
				assert.numEqual( result[ 3 ], Math.SQRT1_2 );

			} );

		} );

	} );

} );
