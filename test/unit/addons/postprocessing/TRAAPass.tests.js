import {
	DataTexture, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene,
	ShaderMaterial, WebGLRenderer, WebGLRenderTarget
} from 'three';
import { GBufferPass } from '../../../../examples/jsm/postprocessing/GBufferPass.js';
import { TRAAPass } from '../../../../examples/jsm/postprocessing/TRAAPass.js';
import { FullScreenQuad } from '../../../../examples/jsm/postprocessing/Pass.js';

export default QUnit.module( 'Postprocessing', () => {

	QUnit.module( 'TRAAPass', () => {

		QUnit.test( 'jitter preserves cropped projections and restores them on failure', assert => {

			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
			camera.setViewOffset( 100, 100, 10, 20, 60, 50 );
			const projection = camera.projectionMatrix.clone();
			const inverse = camera.projectionMatrixInverse.clone();
			const view = { ...camera.view };
			const gBuffer = new GBufferPass( new Scene(), camera, 4, 4, { velocity: true } );
			const traa = new TRAAPass( camera, gBuffer );
			try {

				assert.throws( () => traa.renderFrame( { render() {

					assert.notDeepEqual( camera.projectionMatrix.elements, projection.elements, 'Projection is jittered while rendering' );
					throw new Error( 'render failed' );

				} } ), /render failed/, 'Render failure propagates' );
				assert.deepEqual( camera.projectionMatrix.elements, projection.elements, 'Projection restored' );
				assert.deepEqual( camera.projectionMatrixInverse.elements, inverse.elements, 'Inverse restored' );
				assert.deepEqual( camera.view, view, 'Cropped view unchanged' );
				assert.strictEqual( gBuffer._velocityProjectionMatrix, null, 'Motion projection restored' );
				assert.false( traa._historyValid, 'Failed frames invalidate history' );

			} finally {

				traa.dispose();
				gBuffer.dispose();

			}

		} );

		QUnit.test( 'GPU motion vectors, temporal resolve, disocclusion and resize', assert => {

			const canvas = document.createElement( 'canvas' );
			const context = canvas.getContext( 'webgl2' );
			if ( context === null ) {

				assert.ok( true, 'SKIPPED: WebGL2 unavailable' );
				return;

			}

			const renderer = new WebGLRenderer( { canvas, context } );
			renderer.setSize( 8, 8 );
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
			camera.position.z = 2;
			const scene = new Scene();
			const gradient = new DataTexture( new Uint8Array( Array.from( { length: 8 }, ( _, x ) => [ x * 36, x * 36, x * 36, 255 ] ).flat() ), 8, 1 );
			gradient.needsUpdate = true;
			const material = new MeshBasicMaterial( { color: 0xffffff } );
			const geometry = new PlaneGeometry( 1.5, 1.5 );
			const mesh = new Mesh( geometry, material );
			scene.add( mesh );
			const gBuffer = new GBufferPass( scene, camera, 8, 8, { material: true, velocity: true } );
			const traa = new TRAAPass( camera, gBuffer );
			const input = new WebGLRenderTarget( 8, 8 );
			const output = new WebGLRenderTarget( 8, 8 );
			const preview = new ShaderMaterial( {
				uniforms: { motion: { value: gBuffer.velocityTexture } },
				vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }',
				fragmentShader: 'uniform sampler2D motion; varying vec2 vUv; void main() { vec4 m = texture2D( motion, vUv ); gl_FragColor = vec4( m.xy * 0.5 + 0.5, m.b, m.a ); }'
			} );
			const quad = new FullScreenQuad( preview );
			const pixel = new Uint8Array( 4 );
			const readMotion = () => {

				renderer.setRenderTarget( output );
				quad.render( renderer );
				renderer.readRenderTargetPixels( output, 4, 4, 1, 1, pixel );

			};

			const resolve = () => {

				renderer.setRenderTarget( input );
				renderer.render( scene, camera );
				traa.render( renderer, output, input );
				renderer.readRenderTargetPixels( output, 4, 4, 1, 1, pixel );

			};

			try {

				gBuffer.render( renderer );
				readMotion();
				assert.strictEqual( pixel[ 3 ], 0, 'First frame has invalid history' );
				gBuffer.render( renderer );
				readMotion();
				assert.ok( Math.abs( pixel[ 0 ] - 128 ) <= 1 && pixel[ 3 ] === 255, 'Static geometry has zero motion and valid history' );
				mesh.position.x += 0.25;
				gBuffer.render( renderer );
				readMotion();
				assert.ok( Math.abs( pixel[ 0 ] - 159 ) <= 1, 'Translation produces positive NDC motion' );
				camera.position.y += 0.25;
				gBuffer.render( renderer );
				readMotion();
				assert.ok( Math.abs( pixel[ 1 ] - 96 ) <= 1, 'Camera translation produces negative vertical motion' );
				traa.setViewOffset( 8, 8 );
				gBuffer.render( renderer );
				traa.clearViewOffset();
				readMotion();
				assert.ok( Math.abs( pixel[ 0 ] - 128 ) <= 1 && Math.abs( pixel[ 1 ] - 128 ) <= 1, 'Jitter does not enter motion vectors' );
				mesh.rotation.z = Math.PI / 2;
				gBuffer.render( renderer );
				readMotion();
				assert.ok( pixel[ 0 ] < 127 && pixel[ 1 ] > 128, 'Rotation produces spatially varying motion in both axes' );
				mesh.morphTargetInfluences = [];
				gBuffer.render( renderer );
				readMotion();
				assert.strictEqual( pixel[ 3 ], 0, 'Unsupported deformation invalidates history' );
				delete mesh.morphTargetInfluences;
				gBuffer.render( renderer );
				resolve();
				assert.ok( pixel[ 0 ] > 250, 'First resolve uses the current image' );
				material.map = gradient;
				material.needsUpdate = true;
				traa.reset();
				gBuffer.render( renderer );
				resolve();
				material.color.setRGB( 0.9, 0.9, 0.9 );
				gBuffer.render( renderer );
				resolve();
				const accumulated = pixel[ 0 ];
				renderer.readRenderTargetPixels( input, 4, 4, 1, 1, pixel );
				assert.ok( accumulated > pixel[ 0 ] + 2, 'Valid history contributes to the resolve' );
				material.map = null;
				material.needsUpdate = true;
				material.color.setRGB( 0, 0, 0 );
				gBuffer.render( renderer );
				resolve();
				assert.strictEqual( pixel[ 0 ], 0, 'Variance clipping rejects stale bright history' );
				mesh.position.x = 4;
				gBuffer.render( renderer );
				resolve();
				assert.strictEqual( pixel[ 0 ], 0, 'Disoccluded background has no bright trail' );
				const texture = gBuffer.velocityTexture;
				gBuffer.setSize( 4, 4 );
				traa.setSize( 4, 4 );
				assert.strictEqual( gBuffer.velocityTexture, texture, 'Resize retains texture identity' );
				assert.false( traa._historyValid, 'Resize invalidates history' );
				assert.strictEqual( context.getError(), context.NO_ERROR, 'No WebGL errors' );
				assert.ok( renderer.info.programs.every( program => program.diagnostics === undefined || program.diagnostics.runnable ), 'All shaders compiled' );

			} finally {

				traa.dispose();
				gBuffer.dispose();
				input.dispose();
				output.dispose();
				quad.dispose();
				preview.dispose();
				gradient.dispose();
				geometry.dispose();
				material.dispose();
				renderer.dispose();

			}

		} );

	} );

} );
