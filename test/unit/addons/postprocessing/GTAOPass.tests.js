import { DataTexture, DepthTexture, PerspectiveCamera, Scene, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
import { GTAOPass } from '../../../../examples/jsm/postprocessing/GTAOPass.js';

function assertGBuffer( assert, pass, depth, normal ) {

	assert.strictEqual( pass.gtaoMaterial.uniforms.tDepth.value, depth, 'AO uses the selected depth' );
	assert.strictEqual( pass.pdMaterial.uniforms.tDepth.value, depth, 'Denoising uses the selected depth' );
	assert.strictEqual( pass.depthRenderMaterial.uniforms.tDepth.value, depth, 'Depth preview uses the selected depth' );
	assert.strictEqual( pass.gtaoMaterial.uniforms.tNormal.value, normal, 'AO uses the selected normals' );
	assert.strictEqual( pass.pdMaterial.uniforms.tNormal.value, normal, 'Denoising uses the selected normals' );

}

export default QUnit.module( 'Postprocessing', () => {

	QUnit.module( 'GTAOPass', () => {

		QUnit.test( 'external construction, resize and disposal preserve caller ownership', ( assert ) => {

			const depth = new DepthTexture( 32, 32 );
			const normal = new Texture();
			let disposed = 0;
			depth.addEventListener( 'dispose', () => disposed ++ );
			normal.addEventListener( 'dispose', () => disposed ++ );
			const pass = new GTAOPass( new Scene(), new PerspectiveCamera(), 32, 32, { depthTexture: depth, normalTexture: normal } );

			assertGBuffer( assert, pass, depth, normal );
			assert.notOk( pass._renderGBuffer, 'External inputs skip the internal prepass' );
			assert.strictEqual( pass.normalRenderTarget, undefined, 'No internal target is allocated' );
			pass.setSize( 64, 48 );
			assert.deepEqual( [ depth.image.width, depth.image.height ], [ 32, 32 ], 'External depth is not resized' );
			assert.deepEqual( pass.gtaoMaterial.uniforms.resolution.value.toArray(), [ 64, 48 ], 'AO resolution is updated' );
			assert.strictEqual( pass.pdRenderTarget.width, 64, 'Denoise target is resized' );
			pass.dispose();
			assert.strictEqual( disposed, 0, 'External textures are not disposed' );
			depth.dispose();
			normal.dispose();

		} );

		QUnit.test( 'internal → external → internal restores inputs and reuses the owned target', ( assert ) => {

			const pass = new GTAOPass( new Scene(), new PerspectiveCamera(), 32, 32 );
			const target = pass.normalRenderTarget;
			let disposed = 0;
			target.addEventListener( 'dispose', () => disposed ++ );
			assertGBuffer( assert, pass, target.depthTexture, target.texture );
			assert.ok( pass._renderGBuffer, 'Default mode renders the internal prepass' );
			const depth = new DepthTexture( 32, 32 );
			const normal = new Texture();
			const versions = [ pass.gtaoMaterial.version, pass.pdMaterial.version ];
			pass.setGBuffer( depth );
			assertGBuffer( assert, pass, depth, undefined );

			for ( const [ i, material ] of [ pass.gtaoMaterial, pass.pdMaterial ].entries() ) {

				assert.strictEqual( material.defines.NORMAL_VECTOR_TYPE, 0, 'Depth-only input reconstructs normals' );
				assert.ok( material.version > versions[ i ], 'Input switch invalidates the shader' );

			}

			pass.setGBuffer( depth, normal );
			assertGBuffer( assert, pass, depth, normal );

			pass.setGBuffer();
			pass.setGBuffer();
			assert.strictEqual( pass.normalRenderTarget, target, 'Returning to internal mode reuses the target' );
			assert.strictEqual( disposed, 0, 'Switches do not dispose the retained target' );
			assert.ok( pass._renderGBuffer, 'Internal prepass is restored' );
			assertGBuffer( assert, pass, target.depthTexture, target.texture );

			for ( const material of [ pass.gtaoMaterial, pass.pdMaterial ] ) {

				assert.strictEqual( material.defines.NORMAL_VECTOR_TYPE, 1, 'Internal input restores supplied normals' );

			}

			pass.dispose();
			assert.strictEqual( disposed, 1, 'Owned target is disposed once' );
			depth.dispose();
			normal.dispose();

		} );

		QUnit.test( 'depth-only input and lazy internal allocation after resize', ( assert ) => {

			const depth = new DepthTexture( 32, 32 );
			const pass = new GTAOPass( new Scene(), new PerspectiveCamera(), 32, 32, { depthTexture: depth } );
			assertGBuffer( assert, pass, depth, undefined );
			assert.strictEqual( pass.gtaoMaterial.defines.NORMAL_VECTOR_TYPE, 0, 'AO reconstructs normals' );
			assert.strictEqual( pass.pdMaterial.defines.NORMAL_VECTOR_TYPE, 0, 'Denoising reconstructs normals' );
			pass.setSize( 64, 48 );
			pass.setGBuffer();
			assert.deepEqual( [ pass.normalRenderTarget.width, pass.normalRenderTarget.height ], [ 64, 48 ], 'Internal target is allocated at the current size' );
			assertGBuffer( assert, pass, pass.normalRenderTarget.depthTexture, pass.normalRenderTarget.texture );
			assert.strictEqual( pass.gtaoMaterial.defines.NORMAL_VECTOR_TYPE, 1, 'Internal normals restore the normal shader variant' );
			pass.dispose();
			depth.dispose();

		} );

		QUnit.test( 'browser previews follow external, depth-only and internal inputs', ( assert ) => {

			const canvas = document.createElement( 'canvas' );
			const context = canvas.getContext( 'webgl2' );

			if ( context === null ) {

				assert.ok( true, 'SKIPPED: WebGL2 is not available in this environment.' );
				return;

			}

			const renderer = new WebGLRenderer( { canvas, context } );
			renderer.setSize( 4, 4 );
			const camera = new PerspectiveCamera( 50, 1, 1, 11 );
			const depth = new DataTexture( new Uint8Array( [ 153, 0, 0, 255 ] ), 1, 1 );
			const normal = new DataTexture( new Uint8Array( [ 64, 128, 192, 51 ] ), 1, 1 );
			depth.needsUpdate = true;
			normal.needsUpdate = true;
			const pass = new GTAOPass( new Scene(), camera, 4, 4, { depthTexture: depth, normalTexture: normal } );
			const target = new WebGLRenderTarget( 4, 4 );
			const pixel = new Uint8Array( 4 );
			const checkPreview = ( output, expected, message ) => {

				pass.output = output;
				pass.render( renderer, target, target );
				renderer.readRenderTargetPixels( target, 2, 2, 1, 1, pixel );
				assert.ok( expected.every( ( value, i ) => Math.abs( pixel[ i ] - value ) <= 1 ), message + ': ' + Array.from( pixel ) );

			};

			checkPreview( GTAOPass.OUTPUT.Depth, [ 224, 224, 224, 255 ], 'External depth preview' );
			checkPreview( GTAOPass.OUTPUT.Normal, [ 64, 128, 192, 51 ], 'External normal preview' );
			pass.setGBuffer( depth );
			checkPreview( GTAOPass.OUTPUT.Normal, [ 0, 0, 0, 0 ], 'Depth-only normal preview is black' );
			checkPreview( GTAOPass.OUTPUT.Depth, [ 224, 224, 224, 255 ], 'Depth preview restores red depth' );
			pass.setGBuffer();
			checkPreview( GTAOPass.OUTPUT.Depth, [ 0, 0, 0, 255 ], 'Internal background depth preview' );
			checkPreview( GTAOPass.OUTPUT.Normal, [ 47, 47, 255, 255 ], 'Internal background normal preview' );
			pass.setGBuffer( depth, normal );
			checkPreview( GTAOPass.OUTPUT.Normal, [ 64, 128, 192, 51 ], 'External preview replaces the retained internal source' );
			pass.dispose();
			target.dispose();
			depth.dispose();
			normal.dispose();
			renderer.dispose();

		} );

	} );

} );
