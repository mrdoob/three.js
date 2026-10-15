import { ColorManagement, SRGBToLinear, LinearToSRGB } from '../../../../src/math/ColorManagement.js';
import { Color } from '../../../../src/math/Color.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { SRGBColorSpace, LinearSRGBColorSpace, LinearTransfer } from '../../../../src/constants.js';
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

		QUnit.test( 'SRGBToLinear', ( assert ) => {

			const values = [
				[ 0, 0 ],
				[ 0.02, 0.0015479876160990713 ],
				[ 0.04044, 0.0031300309597523217 ],
				[ 0.04045, 0.0031308072830676845 ],
				[ 0.04046, 0.003131594552688991 ],
				[ 0.1, 0.010022825574869039 ],
				[ 0.5, 0.21404114048223255 ],
				[ 1, 1 ],
				[ 2, 4.953845751592042 ]
			];

			for ( const [ srgb, linear ] of values ) {

				for ( const sign of [ - 1, 1 ] ) {

					assert.ok( Math.abs( SRGBToLinear( sign * srgb ) - sign * linear ) < 1e-8, `Converts ${ sign * srgb } to ${ sign * linear }` );

				}

			}

			assert.ok( Object.is( SRGBToLinear( - 0 ), - 0 ), 'Preserves negative zero' );

		} );

		QUnit.test( 'LinearToSRGB', ( assert ) => {

			const values = [
				[ 0, 0 ],
				[ 0.001, 0.01292 ],
				[ 0.0031307, 0.040448644 ],
				[ 0.0031308, 0.04044990748269014 ],
				[ 0.0031309, 0.04045117777859802 ],
				[ 0.01, 0.09985282273412832 ],
				[ 0.21404114048223255, 0.5 ],
				[ 1, 1 ],
				[ 2, 1.3532560461493863 ]
			];

			for ( const [ linear, srgb ] of values ) {

				for ( const sign of [ - 1, 1 ] ) {

					assert.ok( Math.abs( LinearToSRGB( sign * linear ) - sign * srgb ) < eps, `Converts ${ sign * linear } to ${ sign * srgb }` );

				}

			}

			assert.ok( Object.is( LinearToSRGB( - 0 ), - 0 ), 'Preserves negative zero' );

		} );

		QUnit.test( 'Extended sRGB round trip', ( assert ) => {

			for ( const value of [ - 2, - 1, - 0.5, - 0.04, - 0.001, 0, 0.001, 0.04, 0.5, 1, 2 ] ) {

				assert.ok( Math.abs( LinearToSRGB( SRGBToLinear( value ) ) - value ) < eps, `sRGB round trip for ${ value }` );
				assert.ok( Math.abs( SRGBToLinear( LinearToSRGB( value ) ) - value ) < eps, `Linear sRGB round trip for ${ value }` );

			}

		} );

		QUnit.test( 'convert extended sRGB', ( assert ) => {

			const color = new Color().setRGB( - 0.5, 0.02, 2 );
			ColorManagement.convert( color, SRGBColorSpace, LinearSRGBColorSpace );
			assert.ok( Math.abs( color.r + 0.21404114048223255 ) < eps, 'Converts the negative channel' );
			assert.ok( Math.abs( color.g - 0.0015479876160990713 ) < eps, 'Converts the linear segment' );
			assert.ok( Math.abs( color.b - 4.953845751592042 ) < eps, 'Preserves values above one' );

			ColorManagement.convert( color, LinearSRGBColorSpace, SRGBColorSpace );
			assert.ok( Math.abs( color.r + 0.5 ) < eps && Math.abs( color.g - 0.02 ) < eps && Math.abs( color.b - 2 ) < eps, 'Restores the original color' );

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
