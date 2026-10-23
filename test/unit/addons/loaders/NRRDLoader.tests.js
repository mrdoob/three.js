import { NRRDLoader } from '../../../../examples/jsm/loaders/NRRDLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'NRRDLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new NRRDLoader();

				assert.ok( loader instanceof NRRDLoader, 'Can instantiate an NRRDLoader.' );

			} );

			QUnit.test( 'parses the last header field', ( assert ) => {

				const header = [
					'NRRD0004',
					'type: uchar',
					'dimension: 3',
					'sizes: 2 2 1',
					'encoding: raw',
					'',
					''
				].join( '\n' );
				const headerBytes = new TextEncoder().encode( header );

				const buffer = new Uint8Array( headerBytes.length + 4 );
				buffer.set( headerBytes );
				buffer.set( [ 1, 2, 3, 4 ], headerBytes.length );

				const loader = new NRRDLoader();
				const volume = loader.parse( buffer.buffer );

				assert.strictEqual( volume.header.encoding, 'raw', 'Encoding' );
				assert.deepEqual( Array.from( volume.data ), [ 1, 2, 3, 4 ], 'Data' );

			} );

		} );

	} );

} );
