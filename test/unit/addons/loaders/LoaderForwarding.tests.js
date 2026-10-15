import { Scene } from '../../../../src/scenes/Scene.js';
import { ColladaComposer } from '../../../../examples/jsm/loaders/collada/ColladaComposer.js';
import { LWOLoader } from '../../../../examples/jsm/loaders/LWOLoader.js';
import { MaterialXLoader } from '../../../../examples/jsm/loaders/MaterialXLoader.js';
import { MDDLoader } from '../../../../examples/jsm/loaders/MDDLoader.js';
import { LUTCubeLoader } from '../../../../examples/jsm/loaders/LUTCubeLoader.js';
import { LUT3dlLoader } from '../../../../examples/jsm/loaders/LUT3dlLoader.js';
import { VOXLoader } from '../../../../examples/jsm/loaders/VOXLoader.js';
import { HDRCubeTextureLoader } from '../../../../examples/jsm/loaders/HDRCubeTextureLoader.js';
import { ColladaLoader } from '../../../../examples/jsm/loaders/ColladaLoader.js';
import { Rhino3dmLoader } from '../../../../examples/jsm/loaders/3DMLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'Loader forwarding', () => {

			QUnit.test( 'asset requests inherit headers and credentials', async ( assert ) => {

				const originalFetch = window.fetch;
				let requests = 0;
				window.fetch = async ( request ) => {

					requests ++;
					assert.ok( request.url.startsWith( 'https://example.org/assets/' ), 'The model request path is inherited.' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'model' );
					assert.strictEqual( request.credentials, 'include' );
					return new Response( new Uint8Array( 8 ) );

				};

				try {

					const parameters = { path: 'https://example.org/assets/', requestHeader: { 'X-Asset': 'model' }, withCredentials: true };
					for ( const LoaderClass of [ LWOLoader, MaterialXLoader, MDDLoader, LUTCubeLoader, LUT3dlLoader, VOXLoader ] ) {

						const loader = new LoaderClass().setPath( parameters.path ).setRequestHeader( parameters.requestHeader ).setWithCredentials( parameters.withCredentials );
						loader.parse = () => ( {} );
						if ( loader instanceof MaterialXLoader ) {

							loader._parseBuffer = () => ( { document: { waitForResources: async () => {} }, result: {}, log: { errors: [], warnings: [] } } );

						}

						await loader.loadAsync( LoaderClass.name );

					}

					const cubeLoader = new HDRCubeTextureLoader().setPath( parameters.path ).setRequestHeader( parameters.requestHeader ).setWithCredentials( parameters.withCredentials );
					cubeLoader.hdrLoader.parse = () => ( { width: 1, height: 1, data: new Uint16Array( 4 ) } );
					await cubeLoader.loadAsync( [ 'px', 'nx', 'py', 'ny', 'pz', 'nz' ] );
					assert.strictEqual( requests, 12, 'All model and cube-face requests were checked.' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

			QUnit.test( 'Collada TGA requests inherit asset authentication and resource paths', async ( assert ) => {

				const originalFetch = window.fetch;
				const originalCompose = ColladaComposer.prototype.compose;
				let texturePromise;
				let requests = 0;
				window.fetch = async ( request ) => {

					requests ++;
					assert.strictEqual( request.url, 'https://example.org/textures/diffuse.tga' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'texture' );
					assert.strictEqual( request.credentials, 'include' );
					return new Response( new Uint8Array( 4 ) );

				};

				ColladaComposer.prototype.compose = function () {

					// Exercise the actual TGA and FileLoader request, without requiring geometry or image decoding.
					this.tgaLoader.parse = () => ( { width: 1, height: 1, data: new Uint8Array( 4 ) } );
					texturePromise = this.tgaLoader.loadAsync( 'diffuse.tga' );
					return { scene: new Scene(), animations: [], kinematics: {} };

				};

				try {

					new ColladaLoader()
						.setPath( 'https://example.org/models/' )
						.setResourcePath( 'https://example.org/textures/' )
						.setRequestHeader( { 'X-Asset': 'texture' } )
						.setWithCredentials( true )
						.parse( '<COLLADA version="1.4.1"><asset><unit meter="1"/><up_axis>Y_UP</up_axis></asset></COLLADA>', 'https://example.org/fallback/' );
					await texturePromise;
					assert.strictEqual( requests, 1, 'The internal TGA loader made one request.' );

				} finally {

					window.fetch = originalFetch;
					ColladaComposer.prototype.compose = originalCompose;

				}

			} );

			QUnit.test( 'Rhino model requests inherit settings and retain binary decoding', async ( assert ) => {

				const originalFetch = window.fetch;
				window.fetch = async ( request ) => {

					assert.strictEqual( request.url, 'https://example.org/models/model.3dm' );
					assert.strictEqual( request.headers.get( 'X-Asset' ), 'model' );
					assert.strictEqual( request.credentials, 'include', 'Model requests inherit credentials.' );
					return new Response( new Uint8Array( [ 1, 2, 3 ] ) );

				};

				try {

					const loader = new Rhino3dmLoader();
					loader.setPath( 'https://example.org/models/' );
					loader.setRequestHeader( { 'X-Asset': 'model' } );
					loader.setWithCredentials( true );
					loader.decodeObjects = async buffer => {

						assert.ok( buffer instanceof ArrayBuffer, 'The model request retains binary data.' );
						assert.strictEqual( buffer.byteLength, 3 );
						return { userData: {} };

					};

					await loader.loadAsync( 'model.3dm' );

				} finally {

					window.fetch = originalFetch;

				}

			} );

		} );

	} );

} );
