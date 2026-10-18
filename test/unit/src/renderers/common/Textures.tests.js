import Textures from '../../../../../src/renderers/common/Textures.js';
import { DepthTexture } from '../../../../../src/textures/DepthTexture.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';

/**
 * Backend stand-in that records GPU textures the way WebGPUTextureUtils does.
 * createTexture() throws when the texture was already initialized.
 */
class MockBackend {

	constructor() {

		this.data = new WeakMap();
		this.created = 0;
		this.destroyed = 0;

	}

	get( object ) {

		let map = this.data.get( object );

		if ( map === undefined ) {

			map = {};
			this.data.set( object, map );

		}

		return map;

	}

	delete( object ) {

		this.data.delete( object );

	}

	createTexture( texture, options ) {

		const textureData = this.get( texture );

		if ( textureData.initialized === true ) {

			throw new Error( 'THREE.WebGPUTextureUtils: Texture already initialized.' );

		}

		this.created ++;

		textureData.initialized = true;
		textureData.texture = {
			width: options.width,
			height: options.height,
			depthOrArrayLayers: options.depth,
			mipLevelCount: options.levels
		};

	}

	destroyTexture( texture ) {

		this.destroyed ++;

		const textureData = this.get( texture );

		if ( textureData.texture !== undefined ) textureData.texture.destroyed = true;

		this.delete( texture );

	}

}

function createTextures( backend ) {

	const info = {
		createTexture() {},
		destroyTexture() {}
	};

	return new Textures( {}, backend, info );

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Textures', () => {

		QUnit.test( 'updateTexture keeps a live shadow depth texture when the renderer record is missing', ( assert ) => {

			const backend = new MockBackend();
			const textures = createTextures( backend );
			const depthTexture = new DepthTexture( 1024, 1024 );
			depthTexture.name = 'ShadowDepthTexture';

			textures.updateTexture( depthTexture );

			const gpuTexture = backend.get( depthTexture ).texture;

			assert.strictEqual( backend.created, 1, 'The shadow pass creates the depth texture once.' );
			assert.ok( gpuTexture, 'A GPU texture exists.' );

			// The state reported in #35069: backend data is live, renderer record is gone.
			textures.delete( depthTexture );

			textures.updateTexture( depthTexture );

			assert.strictEqual( backend.created, 1, 'compileAsync() does not create the depth texture again.' );
			assert.strictEqual( backend.destroyed, 0, 'The live depth texture is not destroyed.' );
			assert.strictEqual( backend.get( depthTexture ).texture, gpuTexture, 'The same GPU texture is kept.' );
			assert.strictEqual( textures.get( depthTexture ).initialized, true, 'The renderer record is adopted.' );
			assert.strictEqual( gpuTexture.destroyed, undefined, 'The GPU texture was not destroyed.' );

		} );

		QUnit.test( 'updateTexture replaces a live depth texture when its size no longer matches', ( assert ) => {

			const backend = new MockBackend();
			const textures = createTextures( backend );
			const depthTexture = new DepthTexture( 1024, 1024 );

			textures.updateTexture( depthTexture );

			const previous = backend.get( depthTexture ).texture;

			textures.delete( depthTexture );

			depthTexture.image.width = 512;
			depthTexture.image.height = 512;

			textures.updateTexture( depthTexture );

			const next = backend.get( depthTexture ).texture;

			assert.strictEqual( backend.destroyed, 1, 'The previous GPU texture is destroyed.' );
			assert.strictEqual( backend.created, 2, 'A texture is created at the new size.' );
			assert.ok( previous !== next, 'The replacement is a new GPU texture.' );
			assert.strictEqual( next.width, 512, 'The new texture has the requested width.' );
			assert.strictEqual( next.height, 512, 'The new texture has the requested height.' );

		} );

		QUnit.test( 'updateTexture recreates a render target texture when its version changes', ( assert ) => {

			const backend = new MockBackend();
			const textures = createTextures( backend );
			const depthTexture = new DepthTexture( 256, 256 );

			textures.updateTexture( depthTexture );

			depthTexture.needsUpdate = true;

			textures.updateTexture( depthTexture );

			assert.strictEqual( backend.destroyed, 1, 'The previous GPU texture is destroyed.' );
			assert.strictEqual( backend.created, 2, 'A new GPU texture is created.' );
			assert.strictEqual( textures.get( depthTexture ).version, depthTexture.version, 'The renderer record stores the new version.' );

		} );

		QUnit.test( 'updateTexture does not replace an external render target texture', ( assert ) => {

			const backend = new MockBackend();
			const textures = createTextures( backend );
			const texture = new RenderTarget( 4, 4 ).texture;
			const externalTexture = {
				width: 99,
				height: 99,
				depthOrArrayLayers: 2,
				mipLevelCount: 1
			};

			const backendData = backend.get( texture );
			backendData.initialized = true;
			backendData.externalTexture = true;
			backendData.texture = externalTexture;

			textures.updateTexture( texture );

			assert.strictEqual( backend.created, 0, 'No GPU texture is allocated.' );
			assert.strictEqual( backend.destroyed, 0, 'The external texture is not destroyed.' );
			assert.strictEqual( backend.get( texture ).texture, externalTexture, 'The external GPU texture is kept.' );
			assert.strictEqual( textures.get( texture ).initialized, true, 'The renderer record is adopted.' );

		} );

	} );

} );
