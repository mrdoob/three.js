import { GaussianSplatPLYLoader } from '../../../../examples/jsm/loaders/GaussianSplatPLYLoader.js';
import { GaussianSplatData } from '../../../../examples/jsm/objects/GaussianSplatData.js';
import { SH_C0 } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createPLYBuffer( { format = 'binary_little_endian', omitOpacity = false } = {} ) {

	const properties = [
		'property float x',
		'property float y',
		'property float z',
		'property float scale_0',
		'property float scale_1',
		'property float scale_2',
		'property float rot_0',
		'property float rot_1',
		'property float rot_2',
		'property float rot_3',
		'property float f_dc_0',
		'property float f_dc_1',
		'property float f_dc_2'
	];

	if ( omitOpacity === false ) {

		properties.push( 'property float opacity' );

	}

	properties.push( 'property float f_rest_0' );

	const header = [
		'ply',
		`format ${ format } 1.0`,
		'element face 1',
		'property list uchar int vertex_indices',
		'element vertex 1',
		...properties,
		'end_header',
		''
	].join( '\n' );

	const encoder = new TextEncoder();
	const headerBytes = encoder.encode( header );

	if ( format !== 'binary_little_endian' ) {

		return headerBytes.buffer;

	}

	const faceBytes = 1 + 3 * 4;
	const vertexValues = [
		1, 2, 3,
		Math.log( 2 ), Math.log( 3 ), Math.log( 4 ),
		1, 0, 0, 0,
		0, 0, 0
	];

	if ( omitOpacity === false ) {

		vertexValues.push( 0 );

	}

	vertexValues.push( 99 );

	const binaryBytes = faceBytes + vertexValues.length * 4;
	const bytes = new Uint8Array( headerBytes.length + binaryBytes );
	bytes.set( headerBytes );

	const view = new DataView( bytes.buffer );
	let offset = headerBytes.length;

	view.setUint8( offset, 3 );
	offset += 1;
	view.setInt32( offset, 0, true );
	offset += 4;
	view.setInt32( offset, 1, true );
	offset += 4;
	view.setInt32( offset, 2, true );
	offset += 4;

	for ( const value of vertexValues ) {

		view.setFloat32( offset, value, true );
		offset += 4;

	}

	return bytes.buffer;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GaussianSplatPLYLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GaussianSplatPLYLoader();

				assert.ok( loader instanceof GaussianSplatPLYLoader, 'Can instantiate a GaussianSplatPLYLoader.' );

			} );

			QUnit.test( 'parses binary little-endian 3DGS PLY data', ( assert ) => {

				const loader = new GaussianSplatPLYLoader();
				const data = loader.parse( createPLYBuffer() );

				assert.ok( data instanceof GaussianSplatData, 'returns GaussianSplatData' );
				assert.strictEqual( data.count, 1, 'count' );
				assert.deepEqual( Array.from( data.centers ), [ 1, 2, 3 ], 'centers' );
				closeTo( assert, data.covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, data.covariances[ 1 ], 0, 'covariance xy' );
				closeTo( assert, data.covariances[ 2 ], 0, 'covariance xz' );
				closeTo( assert, data.covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, data.covariances[ 4 ], 0, 'covariance yz' );
				closeTo( assert, data.covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.colors ), [ 128, 128, 128, 128 ], 'degree-0 color and opacity' );

			} );

			QUnit.test( 'ignores extra spherical harmonic fields', ( assert ) => {

				const loader = new GaussianSplatPLYLoader();
				const data = loader.parse( createPLYBuffer() );

				assert.deepEqual( Array.from( data.colors ), [ 128, 128, 128, 128 ], 'extra f_rest_0 field does not affect baked color' );

			} );

			QUnit.test( 'rejects unsupported PLY formats', ( assert ) => {

				const loader = new GaussianSplatPLYLoader();

				assert.throws(
					() => loader.parse( createPLYBuffer( { format: 'ascii' } ) ),
					/Only binary little-endian PLY files are supported/,
					'ASCII PLY is rejected'
				);

			} );

			QUnit.test( 'requires the GraphDECO opacity property', ( assert ) => {

				const loader = new GaussianSplatPLYLoader();

				assert.throws(
					() => loader.parse( createPLYBuffer( { omitOpacity: true } ) ),
					/Missing required PLY property "opacity"/,
					'missing opacity is rejected'
				);

			} );

			QUnit.test( 'uses degree-0 spherical harmonics conversion', ( assert ) => {

				const loader = new GaussianSplatPLYLoader();
				const buffer = createPLYBuffer();
				const view = new DataView( buffer );
				const bytes = new Uint8Array( buffer );
				const headerEnd = new TextDecoder().decode( bytes ).indexOf( 'end_header\n' ) + 'end_header\n'.length;
				const fDC0Offset = headerEnd + 13 + 10 * 4;

				view.setFloat32( fDC0Offset, ( 1 - 0.5 ) / SH_C0, true );

				const data = loader.parse( buffer );

				assert.strictEqual( data.colors[ 0 ], 255, 'red channel is decoded from f_dc_0 and clamped' );

			} );

		} );

	} );

} );
