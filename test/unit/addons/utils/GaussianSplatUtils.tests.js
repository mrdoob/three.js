import {
	SH_BAND_COMPONENTS,
	SH_BAND_WORDS,
	createGaussianSplatGeometry,
	getSphericalHarmonicsDegree,
	linearToSH0,
	sh0ToLinear,
	sigmoid
} from '../../../../examples/jsm/utils/GaussianSplatUtils.js';
import {
	getSphericalHarmonicsCoefficientLocation,
	packSphericalHarmonicsBand,
	unpackSphericalHarmonicsBand
} from './GaussianSplatTestUtils.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'GaussianSplatUtils', () => {

			QUnit.test( 'maps spherical harmonics coefficients to packed uint words', ( assert ) => {

				assert.deepEqual( SH_BAND_WORDS, [ 0, 3, 4, 6 ], 'words cover each band with four bytes per uint' );

				for ( let degree = 1; degree <= 3; degree ++ ) {

					assert.strictEqual(
						SH_BAND_WORDS[ degree ],
						Math.ceil( SH_BAND_COMPONENTS[ degree ] / 4 ),
						`degree ${ degree } word count matches component count`
					);

				}

				assert.deepEqual( getSphericalHarmonicsCoefficientLocation( 0 ), { word: 0, shift: 0 }, 'first byte' );
				assert.deepEqual( getSphericalHarmonicsCoefficientLocation( 3 ), { word: 0, shift: 24 }, 'fourth byte' );
				assert.deepEqual( getSphericalHarmonicsCoefficientLocation( 4 ), { word: 1, shift: 0 }, 'fifth byte' );
				assert.deepEqual( getSphericalHarmonicsCoefficientLocation( 20 ), { word: 5, shift: 0 }, 'last SH3 byte' );

			} );

			QUnit.test( 'converts degree-0 spherical harmonics and linear color', ( assert ) => {

				closeTo( assert, sh0ToLinear( 0 ), 0.5, 'zero coefficient maps to biased half' );
				closeTo( assert, linearToSH0( 0.5 ), 0, 'biased half maps to zero coefficient' );
				closeTo( assert, sh0ToLinear( linearToSH0( 0.25 ) ), 0.25, 'color round-trips through SH0' );

			} );

			QUnit.test( 'applies sigmoid activation', ( assert ) => {

				closeTo( assert, sigmoid( 0 ), 0.5, 'zero maps to half' );
				closeTo( assert, sigmoid( Math.log( 3 ) ), 0.75, 'logit maps to expected value' );

			} );

			QUnit.test( 'creates Gaussian splat geometry from packed arrays', ( assert ) => {

				const data = createGaussianSplatGeometry(
					new Float32Array( [ 1, 2, 3 ] ),
					new Float32Array( [ 4, 0, 0, 9, 0, 16 ] ),
					new Uint8Array( [ 128, 128, 128, 128 ] )
				);

				assert.strictEqual( data.getAttribute( 'position' ).count, 1, 'count' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1, 2, 3 ], 'centers' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 128 ], 'colors' );
				assert.ok( data.boundingBox !== null, 'computes bounding box' );
				assert.ok( data.boundingSphere !== null, 'computes bounding sphere' );

			} );

			QUnit.test( 'creates Gaussian splat geometry with spherical harmonics attributes', ( assert ) => {

				const coefficients = new Uint8ClampedArray( [ 129, 130, 131, 132, 133, 134, 135, 136, 137 ] );
				const packedWords = packSphericalHarmonicsBand( coefficients, 1, 1 );
				const data = createGaussianSplatGeometry(
					new Float32Array( [ 1, 2, 3 ] ),
					new Float32Array( [ 4, 0, 0, 9, 0, 16 ] ),
					new Uint8Array( [ 128, 128, 128, 128 ] ),
					{
						sh1: packedWords
					}
				);
				const packed = data.getAttribute( 'sphericalHarmonics1' );

				assert.strictEqual( getSphericalHarmonicsDegree( data ), 1, 'degree' );
				assert.strictEqual( packed.itemSize, SH_BAND_WORDS[ 1 ], 'item size' );
				assert.ok( packed.array instanceof Uint32Array, 'stores packed uint32 words' );
				assert.strictEqual( packed.array, packedWords, 'reuses the packed buffer' );
				assert.deepEqual(
					Array.from( unpackSphericalHarmonicsBand( packed.array, 1, 1 ) ),
					Array.from( coefficients ),
					'coefficients round-trip through packed words'
				);

			} );

			QUnit.test( 'requires packed uint32 spherical harmonics on geometry', ( assert ) => {

				assert.throws( () => {

					createGaussianSplatGeometry(
						new Float32Array( [ 1, 2, 3 ] ),
						new Float32Array( [ 4, 0, 0, 9, 0, 16 ] ),
						new Uint8Array( [ 128, 128, 128, 128 ] ),
						{ sh1: new Float32Array( 9 ) }
					);

				}, /must use packed uint32 words/, 'rejects floating-point SH attributes' );

				assert.throws( () => {

					createGaussianSplatGeometry(
						new Float32Array( [ 1, 2, 3 ] ),
						new Float32Array( [ 4, 0, 0, 9, 0, 16 ] ),
						new Uint8Array( [ 128, 128, 128, 128 ] ),
						{ sh1: new Uint8ClampedArray( 9 ) }
					);

				}, /must use packed uint32 words/, 'rejects unpacked byte SH attributes' );

			} );

		} );

	} );

} );
