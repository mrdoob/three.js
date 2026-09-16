import { DataTexture, FloatType, LoadingManager, RGBAFormat } from 'three';
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

function hasTextureImage( object, image, visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 10 ) return false;
	if ( object.isTexture === true && object.image === image ) return true;
	if ( visited.has( object ) ) return false;

	visited.add( object );

	for ( const key of Object.keys( object ) ) {

		if ( hasTextureImage( object[ key ], image, visited, depth + 1 ) ) return true;

	}

	return false;

}

function findTextureNode( object, image, visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 10 ) return null;
	if ( object.isTexture === true && object.image === image ) return object;
	if ( visited.has( object ) ) return null;

	visited.add( object );

	for ( const key of Object.keys( object ) ) {

		const found = findTextureNode( object[ key ], image, visited, depth + 1 );
		if ( found ) return found;

	}

	return null;

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

				assert.true( hasTextureImage( material, image ), 'The texture image is assigned before the load resolves.' );
				assert.ok( progressURLs.includes( 'texture.test' ), 'LoadingManager reports dependent texture progress.' );

			} );

			QUnit.test( 'reports failed dependent textures as warnings, matching GLTFLoader', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;
				textureLoader.fail( new Error( 'Texture unavailable.' ) );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				assert.strictEqual( result.errors.length, 0, 'A failed texture does not fail the load by default.' );
				assert.strictEqual( result.warnings.length, 1, 'The texture failure is reported as a warning.' );
				assert.strictEqual( result.warnings[ 0 ].code, 'texture-load-failed', 'The warning uses the structured MaterialX log code.' );

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

			QUnit.test( 'propagates DataTexture-style results from handlers like EXRLoader', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;

				const dataTexture = new DataTexture( new Float32Array( 4 ), 1, 1, RGBAFormat, FloatType );
				textureLoader.succeed( dataTexture );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				const material = result.materials.test_material;
				const textureNode = findTextureNode( material, dataTexture.image );

				assert.ok( textureNode, 'The texture node receives the DataTexture image data.' );
				assert.true( textureNode.isDataTexture, 'isDataTexture is propagated so the renderer uploads raw pixel data.' );
				assert.strictEqual( textureNode.type, FloatType, 'The texture type (e.g. float) is propagated.' );
				assert.strictEqual( textureNode.format, RGBAFormat, 'The texture format is propagated.' );

			} );

		} );

	} );

} );
