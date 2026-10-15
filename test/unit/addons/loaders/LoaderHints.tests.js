import { DRACOLoader } from '../../../../examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from '../../../../examples/jsm/loaders/KTX2Loader.js';
import { LUTCubeLoader } from '../../../../examples/jsm/loaders/LUTCubeLoader.js';
import { LUT3dlLoader } from '../../../../examples/jsm/loaders/LUT3dlLoader.js';
import { LWOLoader } from '../../../../examples/jsm/loaders/LWOLoader.js';
import { MDDLoader } from '../../../../examples/jsm/loaders/MDDLoader.js';
import { Rhino3dmLoader } from '../../../../examples/jsm/loaders/3DMLoader.js';
import { VOXLoader } from '../../../../examples/jsm/loaders/VOXLoader.js';

// Record RequestInit because browsers need not expose the priority hint on Request.
async function withRequests( callback ) {

	const OriginalRequest = globalThis.Request;
	const originalFetch = globalThis.fetch;
	const originalCreateImageBitmap = globalThis.createImageBitmap;
	const priorities = new WeakMap();
	const requests = [];

	globalThis.Request = class extends OriginalRequest {

		constructor( input, options ) {

			super( input, options );
			priorities.set( this, options && options.priority );

		}

	};
	globalThis.fetch = async ( input, options ) => {

		const request = input instanceof OriginalRequest ? input : new OriginalRequest( input, options );
		requests.push( {
			url: request.url,
			priority: options ? options.priority : priorities.get( input ),
			cache: request.cache
		} );
		return new Response( new Uint8Array( 4 ) );

	};

	globalThis.createImageBitmap = async () => ( { width: 1, height: 1, close() {} } );

	try {

		await callback( requests );

	} finally {

		globalThis.Request = OriginalRequest;
		globalThis.fetch = originalFetch;
		globalThis.createImageBitmap = originalCreateImageBitmap;

	}

}

function assertHints( assert, requests, count ) {

	assert.strictEqual( requests.length, count, 'Expected requests completed' );

	for ( const request of requests ) {

		assert.strictEqual( request.priority, 'low', request.url + ' priority' );
		assert.strictEqual( request.cache, 'no-store', request.url + ' HTTP cache mode' );

	}

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loader request hints', () => {

		QUnit.test( 'asset loaders forward setter hints to FileLoader requests', async ( assert ) => {

			await withRequests( async ( requests ) => {

				for ( const LoaderType of [ LWOLoader, MDDLoader, LUTCubeLoader, LUT3dlLoader, VOXLoader ] ) {

					const loader = new LoaderType().setPriority( 'low' ).setCache( 'no-store' );
					loader.parse = () => ( {} );
					await loader.loadAsync( 'https://example.com/hints/' + LoaderType.name );

				}

				const rhino = new Rhino3dmLoader().setPriority( 'low' ).setCache( 'no-store' );
				rhino.decodeObjects = async () => ( { userData: {} } );
				await rhino.loadAsync( 'https://example.com/hints/model.3dm' );
				assertHints( assert, requests, 6 );

			} );

		} );

		QUnit.test( 'decoder library requests inherit setter hints without starting workers', async ( assert ) => {

			await withRequests( async ( requests ) => {

				const draco = new DRACOLoader().setPriority( 'low' ).setCache( 'no-store' );
				const rhino = new Rhino3dmLoader().setPriority( 'low' ).setCache( 'no-store' );
				const ktx2 = new KTX2Loader().setPriority( 'low' ).setCache( 'no-store' );
				rhino.setLibraryPath( 'https://example.com/hints/rhino/' );
				ktx2.setTranscoderPath( 'https://example.com/hints/basis/' );

				try {

					await draco._initDecoder();
					await rhino._initLibrary();
					await ktx2.init();
					assertHints( assert, requests, 6 );

				} finally {

					draco.dispose();
					rhino.dispose();
					ktx2.dispose();

				}

			} );

		} );

		QUnit.test( 'GLTF external buffer and bitmap fetches inherit setter hints', async ( assert ) => {

			await withRequests( async ( requests ) => {

				const loader = new GLTFLoader().setPriority( 'low' ).setCache( 'no-store' );
				const gltf = await loader.parseAsync( {
					asset: { version: '2.0' },
					buffers: [ { uri: 'buffer.bin', byteLength: 4 } ],
					images: [ { uri: 'texture.png' } ],
					textures: [ { source: 0 } ]
				}, 'https://example.com/hints/gltf/' );
				await gltf.parser.getDependency( 'buffer', 0 );
				await gltf.parser.getDependency( 'texture', 0 );
				assertHints( assert, requests, 2 );
				assert.deepEqual( requests.map( ( request ) => request.url ), [
					'https://example.com/hints/gltf/buffer.bin',
					'https://example.com/hints/gltf/texture.png'
				], 'Resource paths are resolved once' );

			} );

		} );

	} );

} );
