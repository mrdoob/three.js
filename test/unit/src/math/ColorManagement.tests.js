import { ColorManagement } from '../../../../src/math/ColorManagement.js';
import { Color } from '../../../../src/math/Color.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { LinearSRGBColorSpace, LinearTransfer } from '../../../../src/constants.js';
import { eps } from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorManagement', () => {

		// PROPERTIES
		QUnit.test( 'enabled', ( assert ) => {

			assert.strictEqual(
				ColorManagement.enabled, true,
				'ColorManagement.enabled is true by default.'
			);

		} );

		// INTERNALS
		QUnit.test( '_getMatrix', ( assert ) => {

			const LinearDisplayP3ColorSpace = 'test-display-p3-linear';

			ColorManagement.define( {
				[ LinearDisplayP3ColorSpace ]: {
					primaries: [ 0.680, 0.320, 0.265, 0.690, 0.150, 0.060 ],
					whitePoint: [ 0.3127, 0.3290 ],
					transfer: LinearTransfer,
					toXYZ: new Matrix3().set(
						0.4865709, 0.2656677, 0.1982173,
						0.2289746, 0.6917385, 0.0792869,
						0.0000000, 0.0451134, 1.0439444
					),
					fromXYZ: new Matrix3().set(
						2.4934969, - 0.9313836, - 0.4027108,
						- 0.8294890, 1.7626641, 0.0236247,
						0.0358458, - 0.0761724, 0.9568845
					),
					luminanceCoefficients: [ 0.2289, 0.6917, 0.0793 ]
				}
			} );

			const matrix = new Matrix3();
			const vector = new Vector3();
			const color = new Color();

			const conversions = [
				[ LinearSRGBColorSpace, LinearDisplayP3ColorSpace ],
				[ LinearDisplayP3ColorSpace, LinearSRGBColorSpace ]
			];

			for ( const [ source, target ] of conversions ) {

				ColorManagement._getMatrix( matrix, source, target );

				for ( const rgb of [[ 1, 1, 1 ], [ 1, 0, 0 ], [ 0.2, 0.5, 0.8 ]] ) {

					vector.fromArray( rgb ).applyMatrix3( matrix );
					ColorManagement.convert( color.fromArray( rgb ), source, target );

					assert.ok(
						Math.abs( vector.x - color.r ) < eps &&
						Math.abs( vector.y - color.g ) < eps &&
						Math.abs( vector.z - color.b ) < eps,
						`Matrix from ${ source } to ${ target } matches convert() for ( ${ rgb } ).`
					);

				}

			}

			delete ColorManagement.spaces[ LinearDisplayP3ColorSpace ];

		} );

	} );

} );
