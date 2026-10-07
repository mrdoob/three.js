import {
	DataTexture, Mesh, MeshStandardMaterial, NoBlending, OrthographicCamera,
	PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer, WebGLRenderTarget
} from 'three';
import { GBufferPass } from '../../../../examples/jsm/postprocessing/GBufferPass.js';
import { FullScreenQuad } from '../../../../examples/jsm/postprocessing/Pass.js';

export default QUnit.module( 'Postprocessing', () => {

	QUnit.module( 'GBufferPass', () => {

		QUnit.test( 'material attachment samples map channels, UV sets and changing transforms', ( assert ) => {

			const canvas = document.createElement( 'canvas' );
			const context = canvas.getContext( 'webgl2' );

			if ( context === null ) {

				assert.ok( true, 'SKIPPED: WebGL2 is not available in this environment.' );
				return;

			}

			const renderer = new WebGLRenderer( { canvas, context } );
			renderer.setSize( 4, 4 );
			const scene = new Scene();
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
			camera.position.z = 2;
			const geometry = new PlaneGeometry( 2, 2 );
			const uv1 = geometry.attributes.uv.clone();

			for ( let i = 0; i < uv1.count; i ++ ) uv1.setX( i, 1 - uv1.getX( i ) );

			geometry.setAttribute( 'uv1', uv1 );
			const roughnessMap = new DataTexture( new Uint8Array( [ 255, 64, 192, 255, 0, 192, 64, 255 ] ), 2, 1 );
			roughnessMap.needsUpdate = true;
			const metalnessMap = roughnessMap.clone();
			metalnessMap.channel = 1;
			const material = new MeshStandardMaterial( { roughness: 0.5, metalness: 0.75, roughnessMap, metalnessMap } );
			scene.add( new Mesh( geometry, material ) );
			const pass = new GBufferPass( scene, camera, 4, 4, { material: true } );
			const preview = new ShaderMaterial( {
				uniforms: { tMaterial: { value: pass.materialTexture } },
				vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }',
				fragmentShader: 'uniform sampler2D tMaterial; varying vec2 vUv; void main() { gl_FragColor = texture2D( tMaterial, vUv ); }',
				blending: NoBlending
			} );
			const quad = new FullScreenQuad( preview );
			const target = new WebGLRenderTarget( 4, 4 );
			const pixel = new Uint8Array( 4 );
			const check = ( x, roughness, metalness, message ) => {

				pass.render( renderer );
				renderer.setRenderTarget( target );
				quad.render( renderer );
				renderer.readRenderTargetPixels( target, x, 2, 1, 1, pixel );
				assert.ok( Math.abs( pixel[ 0 ] - roughness ) <= 1 && Math.abs( pixel[ 1 ] - metalness ) <= 1, message + ': ' + Array.from( pixel ) );

			};

			try {

				check( 1, 32, 48, 'Left pixel uses green roughness and blue metalness on independent UV sets' );
				check( 2, 96, 144, 'Right pixel varies with both textures' );
				roughnessMap.offset.x = 0.5;
				check( 1, 96, 48, 'Offset changes take effect without material recompilation' );
				roughnessMap.matrixAutoUpdate = false;
				roughnessMap.matrix.makeTranslation( - 0.5, 0 );
				check( 2, 32, 144, 'Manual texture matrices are respected' );
				roughnessMap.matrix.identity();
				roughnessMap.channel = 1;
				check( 1, 96, 48, 'Changing a texture UV channel recompiles the cached material' );
				material.roughness = 0.25;
				material.metalness = 0.5;
				check( 1, 48, 32, 'Scalar changes modulate the texture samples' );
				material.roughnessMap = null;
				material.metalnessMap = null;
				check( 1, 64, 128, 'Removing maps restores scalar values' );
				material.roughnessMap = roughnessMap;
				material.metalnessMap = metalnessMap;
				check( 1, 48, 32, 'Reattaching maps restores sampled values' );
				assert.strictEqual( context.getError(), context.NO_ERROR, 'No WebGL errors' );

			} finally {

				pass.dispose();
				quad.dispose();
				preview.dispose();
				target.dispose();
				material.dispose();
				geometry.dispose();
				roughnessMap.dispose();
				metalnessMap.dispose();
				renderer.dispose();

			}

		} );

	} );

} );
