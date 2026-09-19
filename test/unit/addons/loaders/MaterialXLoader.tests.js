import { ClampToEdgeWrapping, CompressedTexture, DataTexture, HalfFloatType, LinearFilter, LinearSRGBColorSpace, LoadingManager, NearestFilter, RedFormat, RepeatWrapping, RGB_S3TC_DXT1_Format, SRGBColorSpace } from 'three';
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

function createDocumentURL( text = MATERIAL_X ) {

	return URL.createObjectURL( new Blob( [ text ], { type: 'application/xml' } ) );

}

function findTexture( object, image, visited = new WeakSet(), depth = 0 ) {

	if ( object === null || typeof object !== 'object' || depth > 10 ) return null;
	if ( object.isTextureNode === true ) return findTexture( object.value, image, visited, depth + 1 );
	if ( object.isTexture === true && object.image === image ) return object;
	if ( visited.has( object ) ) return null;

	visited.add( object );

	for ( const key of Object.keys( object ) ) {

		const found = findTexture( object[ key ], image, visited, depth + 1 );
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

				assert.ok( findTexture( material, image ), 'The texture image is assigned before the load resolves.' );
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

				const dataTexture = new DataTexture( new Uint16Array( 6 ), 3, 2, RedFormat, HalfFloatType );
				dataTexture.minFilter = LinearFilter;
				dataTexture.magFilter = NearestFilter;
				dataTexture.colorSpace = LinearSRGBColorSpace;
				dataTexture.generateMipmaps = false;
				textureLoader.succeed( dataTexture );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );

				const material = result.materials.test_material;
				const textureNode = findTexture( material, dataTexture.image );

				assert.ok( textureNode, 'The texture node receives the DataTexture image data.' );
				assert.true( textureNode.isDataTexture, 'isDataTexture is propagated so the renderer uploads raw pixel data.' );
				assert.strictEqual( textureNode.type, HalfFloatType, 'The half-float texture type is propagated.' );
				assert.strictEqual( textureNode.format, RedFormat, 'The texture format is propagated.' );
				assert.strictEqual( textureNode.minFilter, LinearFilter, 'The min filter is propagated.' );
				assert.false( textureNode.generateMipmaps, 'generateMipmaps is propagated so loaders can opt out of mipmaps.' );
				assert.strictEqual( textureNode.magFilter, NearestFilter, 'The mag filter is propagated.' );
				assert.strictEqual( textureNode.colorSpace, LinearSRGBColorSpace, 'The color space is propagated.' );
				assert.strictEqual( textureNode.unpackAlignment, 1, 'Odd-width half-float rows retain their packed alignment.' );
				assert.ok( textureNode instanceof DataTexture, 'The loaded texture retains its subtype.' );

				const clone = textureNode.clone();
				assert.true( clone.isDataTexture, 'Cloning preserves raw pixel upload behavior.' );
				assert.strictEqual( clone.image, dataTexture.image, 'Cloning preserves the pixel data.' );
				assert.strictEqual( clone.unpackAlignment, 1, 'Cloning preserves row alignment.' );

			} );

			QUnit.test( 'shares loaded textures by URI and address modes without modifying handler results', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const text = `<materialx version="1.39">
					${ [ 'periodic', 'periodic', 'clamp' ].map( ( mode, index ) => `
						<surfacematerial name="material_${index}" type="material">
							<input name="surfaceshader" type="surfaceshader" nodename="surface_${index}" />
						</surfacematerial>
						<standard_surface name="surface_${index}" type="surfaceshader">
							<input name="base_color" type="color3" nodename="image_${index}" />
						</standard_surface>
						<image name="image_${index}" type="color3">
							<input name="file" type="filename" value="texture.test" />
							<input name="uaddressmode" type="string" value="${mode}" />
						</image>
					` ).join( '' ) }
				</materialx>`;
				const documentURL = createDocumentURL( text );
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;

				assert.strictEqual( textureLoader.pending.length, 2, 'Matching URI and address modes share one request.' );
				const source = new DataTexture( new Uint16Array( 6 ), 3, 2, RedFormat, HalfFloatType );
				source.flipY = true;
				textureLoader.succeed( source );
				textureLoader.succeed( source );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );
				const first = findTexture( result.materials.material_0, source.image );
				const second = findTexture( result.materials.material_1, source.image );
				const clamped = findTexture( result.materials.material_2, source.image );

				assert.strictEqual( first, second, 'All samples sharing a cache entry see the loaded texture.' );
				assert.notStrictEqual( first, clamped, 'Different address modes use separate textures.' );
				assert.notStrictEqual( first, source, 'MaterialX owns its texture settings.' );
				assert.strictEqual( first.wrapS, RepeatWrapping, 'Periodic addressing is applied.' );
				assert.strictEqual( clamped.wrapS, ClampToEdgeWrapping, 'Clamp addressing is applied.' );
				assert.strictEqual( clamped.wrapT, RepeatWrapping, 'The other axis keeps periodic addressing.' );
				assert.false( first.flipY, 'MaterialX keeps its texture orientation.' );
				assert.strictEqual( source.wrapS, ClampToEdgeWrapping, 'The handler texture wrapping is unchanged.' );
				assert.true( source.flipY, 'The handler texture orientation is unchanged.' );

			} );

			QUnit.test( 'preserves compressed textures and their mipmaps', async ( assert ) => {

				const manager = new LoadingManager();
				const textureLoader = new ControlledTextureLoader( manager );
				manager.addHandler( /\.test$/i, textureLoader );

				const documentURL = createDocumentURL();
				const loadPromise = new MaterialXLoader( manager ).loadAsync( documentURL );
				await textureLoader.started;

				const mipmaps = [ 4, 2, 1 ].map( size => ( { data: new Uint8Array( 8 ), width: size, height: size } ) );
				const source = new CompressedTexture( mipmaps, 4, 4, RGB_S3TC_DXT1_Format );
				source.colorSpace = SRGBColorSpace;
				textureLoader.succeed( source );

				const result = await loadPromise;
				URL.revokeObjectURL( documentURL );
				const loaded = findTexture( result.materials.test_material, source.image );

				assert.ok( loaded instanceof CompressedTexture, 'The compressed texture subtype is preserved.' );
				assert.strictEqual( loaded.format, RGB_S3TC_DXT1_Format, 'The compressed format is preserved.' );
				assert.deepEqual( loaded.mipmaps, mipmaps, 'Every mip level retains its dimensions and compressed data.' );
				assert.strictEqual( loaded.minFilter, source.minFilter, 'The mipmap filter is preserved.' );
				assert.strictEqual( loaded.colorSpace, SRGBColorSpace, 'The color space is preserved.' );
				assert.false( loaded.generateMipmaps, 'Compressed mipmaps are not regenerated.' );
				assert.false( loaded.flipY, 'Compressed textures are not flipped.' );
				assert.true( loaded.clone().isCompressedTexture, 'Cloning preserves compressed upload behavior.' );

			} );

		} );

	} );

} );
