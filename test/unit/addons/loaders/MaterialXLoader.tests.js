import { LoadingManager } from '../../../../build/three.module.js';
import { MaterialXLoader } from '../../../../examples/jsm/loaders/MaterialXLoader.js';

const MATERIAL_X = `<?xml version="1.0"?>
<materialx version="1.39">
	<surfacematerial name="test_material" type="material">
		<input name="surfaceshader" type="surfaceshader" nodename="test_surface" />
	</surfacematerial>
	<standard_surface name="test_surface" type="surfaceshader">
		<input name="base_color" type="color3" output="out" nodegraph="test_graph" />
	</standard_surface>
	<nodegraph name="test_graph">
		<image name="test_image" type="color3">
			<input name="file" type="filename" value="texture.test" />
		</image>
		<output name="out" type="color3" nodename="test_image" />
	</nodegraph>
</materialx>`;

class ControlledTextureLoader {

	constructor( manager ) {

		this.manager = manager;
		this.pending = [];
		this.started = new Promise( ( resolve ) => {

			this.resolveStarted = resolve;

		} );

	}

	load( url, onLoad, onProgress, onError ) {

		this.manager.itemStart( url );
		this.pending.push( { url, onLoad, onError } );
		this.resolveStarted();
		return this;

	}

	succeed( image ) {

		const { url, onLoad } = this.pending.shift();
		onLoad( image );
		this.manager.itemEnd( url );

	}

	fail( error ) {

		const { url, onError } = this.pending.shift();
		onError( error );
		this.manager.itemError( url );
		this.manager.itemEnd( url );

	}

}

function createDocumentURL() {

	return URL.createObjectURL( new Blob( [ MATERIAL_X ], { type: 'application/xml' } ) );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'MaterialXLoader', () => {

			QUnit.test( 'waits for dependent textures before resolving', async ( assert ) => {

				const progressURLs = [];
				const manager = new LoadingManager( undefined, ( url ) => progressURLs.push( url ) );
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				let resolved = false;
				loadPromise.then( () => {

					resolved = true;

				} );

				await textureLoader.started;
				await Promise.resolve();
				assert.false( resolved, 'The MaterialX load remains pending while its texture is pending.' );

				const image = { width: 1, height: 1 };
				textureLoader.succeed( image );
				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				const material = result.materials.test_material;
				const texture = material.materialXDocument.textureCache.values().next().value;

				assert.false( 'texturesReady' in result, 'The result does not expose a separate readiness promise.' );
				assert.strictEqual( texture.image, image, 'The texture image is assigned before the load resolves.' );
				assert.ok( progressURLs.includes( 'texture.test' ), 'LoadingManager reports dependent texture progress.' );

			} );

			QUnit.test( 'applies throwOnErrors after dependent textures settle', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;
				textureLoader.fail( new Error( 'Texture unavailable.' ) );

				await assert.rejects(
					loadPromise,
					/Failed to load texture "texture\.test"/,
					'Texture errors reject the load by default.'
				);
				URL.revokeObjectURL( documentURL );

				const tolerantManager = new LoadingManager();
				const tolerantTextureLoader = new ControlledTextureLoader( tolerantManager );
				tolerantManager.addHandler( /\.test$/i, tolerantTextureLoader );

				const tolerantDocumentURL = createDocumentURL();
				const tolerantLoadPromise = new MaterialXLoader( tolerantManager ).loadAsync( tolerantDocumentURL, { throwOnErrors: false } );
				await tolerantTextureLoader.started;
				tolerantTextureLoader.fail( new Error( 'Texture unavailable.' ) );

				const result = await tolerantLoadPromise;
				URL.revokeObjectURL( tolerantDocumentURL );

				assert.strictEqual( result.errors.length, 1, 'The texture error remains available to the caller.' );
				assert.strictEqual( result.errors[ 0 ].code, 'texture-load-failed', 'The error uses the structured MaterialX log code.' );

			} );

			QUnit.test( 'keeps LoadingManager active through the loader callback', async ( assert ) => {

				let managerComplete = false;
				const manager = new LoadingManager( () => {

					managerComplete = true;

				} );
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new Promise( ( resolve, reject ) => {

					new MaterialXLoader( manager ).load( documentURL, ( result ) => {

						assert.false( managerComplete, 'LoadingManager remains active while the loader callback runs.' );
						resolve( result );

					}, undefined, reject );

				} );

				await textureLoader.started;
				textureLoader.succeed( { width: 1, height: 1 } );
				await loadPromise;
				URL.revokeObjectURL( documentURL );

				assert.true( managerComplete, 'LoadingManager completes after the loader callback.' );

			} );

		} );

	} );

} );
