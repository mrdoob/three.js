import { HDRLoader } from '../../../../examples/jsm/loaders/HDRLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'HDRLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new HDRLoader();

				assert.ok( loader instanceof HDRLoader, 'Can instantiate an HDRLoader.' );

			} );

			QUnit.test( 'parses valid HDR with large header (> chunk size)', ( assert ) => {

				// Regression: fgets uses chunkSize=128. When a line (e.g. pcomb) exceeds
				// 128 bytes, chunking can skip the FORMAT line, causing "missing format
				// specifier". This minimal synthetic HDR reproduces the bug.
				const header = [
					'#?RADIANCE',
					'some large header line' + 'x'.repeat( 128 ),
					'FORMAT=32-bit_rle_rgbe',
					'-Y 0 +X 0',
					''
				].join( '\n' );
				const encoder = new TextEncoder();
				const headerBytes = encoder.encode( header );

				const buffer = new Uint8Array( headerBytes.length );
				buffer.set( headerBytes );

				const loader = new HDRLoader();
				const result = loader.parse( buffer.buffer );

				assert.ok( result, 'Parse succeeds' );
				assert.strictEqual( result.width, 0, 'Width' );
				assert.strictEqual( result.height, 0, 'Height' );
				assert.ok( result.data, 'Has texture data' );

			} );

		} );

	} );

} );
