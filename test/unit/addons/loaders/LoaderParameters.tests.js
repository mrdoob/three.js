import { LWOLoader } from '../../../../examples/jsm/loaders/LWOLoader.js';
import { MaterialXLoader } from '../../../../examples/jsm/loaders/MaterialXLoader.js';
import { MDDLoader } from '../../../../examples/jsm/loaders/MDDLoader.js';
import { LUTCubeLoader } from '../../../../examples/jsm/loaders/LUTCubeLoader.js';
import { LUT3dlLoader } from '../../../../examples/jsm/loaders/LUT3dlLoader.js';
import { VOXLoader } from '../../../../examples/jsm/loaders/VOXLoader.js';
import { HDRCubeTextureLoader } from '../../../../examples/jsm/loaders/HDRCubeTextureLoader.js';
import { LoadingManager } from '../../../../src/loaders/LoadingManager.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from '../../../../examples/jsm/loaders/HDRLoader.js';
import { DDSLoader } from '../../../../examples/jsm/loaders/DDSLoader.js';
import { ColladaLoader } from '../../../../examples/jsm/loaders/ColladaLoader.js';
import { Rhino3dmLoader } from '../../../../examples/jsm/loaders/3DMLoader.js';
import { DRACOLoader } from '../../../../examples/jsm/loaders/DRACOLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'Loader parameters', () => {

			QUnit.test( 'asset requests inherit headers and credentials', async ( assert ) => {

				const originalFetch = window.fetch;
				let requests = 0;
				window.fetch = async ( request ) => {

					requests ++;
					assert.ok( request.url.startsWith( 'https://example.org/assets/' ), 'The model request path is inherited.' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'model' );
					assert.strictEqual( request.credentials, 'include' );
					assert.strictEqual( request.cache, 'no-store' );
					return new Response( new Uint8Array( 8 ) );

				};

				try {

					const parameters = { path: 'https://example.org/assets/', requestHeader: { 'X-Asset': 'model' }, withCredentials: true, priority: 'high', cache: 'no-store' };
					for ( const LoaderClass of [ LWOLoader, MaterialXLoader, MDDLoader, LUTCubeLoader, LUT3dlLoader, VOXLoader ] ) {

						const loader = new LoaderClass( undefined, parameters );
						loader.parse = () => ( {} );
						if ( loader instanceof MaterialXLoader ) {

							loader._parseBuffer = () => ( { document: { waitForResources: async () => {} }, result: {}, log: { errors: [], warnings: [] } } );

						}

						await loader.loadAsync( LoaderClass.name );

					}

					const cubeLoader = new HDRCubeTextureLoader( undefined, parameters );
					cubeLoader.hdrLoader.parse = () => ( { width: 1, height: 1, data: new Uint16Array( 4 ) } );
					await cubeLoader.loadAsync( [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ] );
					assert.strictEqual( requests, 12, 'All model and cube-face requests were checked.' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

			QUnit.test( 'MaterialX texture loaders inherit settings and use the document resource root', ( assert ) => {

				const parameters = { path: 'models/', crossOrigin: 'use-credentials', withCredentials: true, requestHeader: { 'X-Asset': 'texture' }, priority: 'high', cache: 'no-store' };
				const loader = new MaterialXLoader( undefined, parameters );
				const { document } = loader._parse( '<materialx version="1.38"></materialx>', { path: 'textures/' } );

				for ( const child of [ document.imageLoader, document.textureLoader ] ) {

					assert.strictEqual( child.path, 'textures/' );
					for ( const property of [ 'crossOrigin', 'withCredentials', 'requestHeader', 'priority', 'cache' ] ) {

						assert.strictEqual( child[ property ], parameters[ property ], property );

					}

				}

			} );

			QUnit.test( 'glTF buffers inherit explicit credentials without duplicating the resource path', async ( assert ) => {

				const originalFetch = window.fetch;
				window.fetch = async ( request ) => {

					assert.strictEqual( request.url, 'https://example.org/textures/buffer.bin' );
					assert.strictEqual( request.credentials, 'include' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'model' );
					assert.strictEqual( request.cache, 'no-store' );
					return new Response( new Uint8Array( 4 ) );

				};

				try {

					const loader = new GLTFLoader( undefined, { path: 'models/', crossOrigin: 'anonymous', withCredentials: true, requestHeader: { 'X-Asset': 'model' }, cache: 'no-store' } );
					let bufferPromise;
					loader.register( ( parser ) => {

						bufferPromise = parser.getDependency( 'buffer', 0 );
						return { name: 'loader-parameters-test' };

					} );
					await loader.parseAsync( JSON.stringify( { asset: { version: '2.0' }, scene: 0, scenes: [ { nodes: [] } ], buffers: [ { uri: 'buffer.bin', byteLength: 4 } ] } ), 'https://example.org/textures/' );
					assert.strictEqual( ( await bufferPromise ).byteLength, 4 );

				} finally {

					window.fetch = originalFetch;

				}

			} );

			QUnit.test( 'subclasses forward constructor parameters', ( assert ) => {

				const manager = new LoadingManager();
				const parameters = { path: 'assets/', resourcePath: 'textures/', crossOrigin: 'use-credentials', withCredentials: true, requestHeader: { Accept: 'application/json' }, priority: 'low', cache: 'reload' };

				for ( const LoaderClass of [ Rhino3dmLoader, DRACOLoader, GLTFLoader, HDRLoader, DDSLoader, ColladaLoader ] ) {

					const loader = new LoaderClass( manager, parameters );
					assert.strictEqual( loader.manager, manager, `${ LoaderClass.name }: manager` );
					for ( const property of Object.keys( parameters ) ) {

						assert.strictEqual( loader[ property ], parameters[ property ], `${ LoaderClass.name }: ${ property }` );

					}

				}

			} );

			QUnit.test( 'Rhino model requests inherit settings and retain binary decoding', async ( assert ) => {

				const originalFetch = window.fetch;
				window.fetch = async ( request ) => {

					assert.strictEqual( request.url, 'https://example.org/models/constructor.3dm' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'model' );
					assert.strictEqual( request.credentials, 'include', 'Model requests inherit credentials.' );
					assert.strictEqual( request.cache, 'no-store' );
					return new Response( new Uint8Array( [ 1, 2, 3 ] ) );

				};

				try {

					const loader = new Rhino3dmLoader();
					loader.setPath( 'https://example.org/models/' );
					loader.setPriority( 'low' );
					loader.setCache( 'no-store' );
					loader.setRequestHeader( { 'X-Asset': 'model' } );
					loader.setWithCredentials( true );
					loader.decodeObjects = async buffer => {

						assert.ok( buffer instanceof ArrayBuffer, 'The constructor override requests binary data.' );
						assert.strictEqual( buffer.byteLength, 3 );
						return { userData: {} };

					};

					await loader.loadAsync( 'constructor.3dm' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

			QUnit.test( 'Draco decoder requests do not inherit model paths or headers', async ( assert ) => {

				const originalFetch = window.fetch;
				window.fetch = async ( request ) => {

					assert.strictEqual( request.url, 'https://example.org/decoder/constructor.js' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), null );
					assert.strictEqual( request.credentials, 'include' );
					assert.strictEqual( request.cache, 'no-store' );
					return new Response( 'decoder' );

				};

				try {

					const loader = new DRACOLoader();
					loader.setPath( 'https://example.org/models/' );
					loader.setPriority( 'low' );
					loader.setCache( 'no-store' );
					loader.setRequestHeader( { 'X-Asset': 'model' } );
					loader.setWithCredentials( true );
					assert.strictEqual( await loader._loadLibrary( 'https://example.org/decoder/constructor.js', 'text' ), 'decoder' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

		} );

	} );

} );
