import WebGPURenderer from '../../../../../src/renderers/webgpu/WebGPURenderer.js';
import { PlaneGeometry } from '../../../../../src/geometries/PlaneGeometry.js';
import { MeshBasicMaterial } from '../../../../../src/materials/MeshBasicMaterial.js';
import { InstancedMesh } from '../../../../../src/objects/InstancedMesh.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';
import { FloatType } from '../../../../../src/constants.js';
import { OrthographicCamera } from '../../../../../src/cameras/OrthographicCamera.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import { Matrix4 } from '../../../../../src/math/Matrix4.js';
import { Color } from '../../../../../src/math/Color.js';

QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WebGPURenderer', () => {

			QUnit.test( 'Equivalent instanced meshes share a pipeline, not their buffers', async ( assert ) => {

				if ( ! navigator.gpu || ! await navigator.gpu.requestAdapter() ) {

					assert.ok( true, 'SKIPPED: WebGPU adapter is not available in this environment.' );
					return;

				}

				const renderer = new WebGPURenderer();
				const geometry = new PlaneGeometry( 0.3, 0.4 );
				const material = new MeshBasicMaterial( { color: 0xffffff, toneMapped: false } );
				const meshes = [
					new InstancedMesh( geometry, material, 2 ),
					new InstancedMesh( geometry, material, 2 )
				];
				const target = new RenderTarget( 128, 64, { type: FloatType, depthBuffer: false } );
				const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
				camera.position.z = 2;
				const scene = new Scene();
				scene.add( ...meshes );
				const colors = [[ 0.8, 0.1, 0.2 ], [ 0.1, 0.8, 0.2 ], [ 0.1, 0.2, 0.8 ], [ 0.8, 0.8, 0.1 ]];
				const matrix = new Matrix4();
				const color = new Color();
				const builders = [];

				for ( let i = 0; i < 4; i ++ ) {

					meshes[ i >> 1 ].setMatrixAt( i % 2, matrix.makeTranslation( - 0.75 + i * 0.5, 0, 0 ) );
					meshes[ i >> 1 ].setColorAt( i % 2, color.setRGB( ...colors[ i ] ) );

				}

				const checkPixel = ( pixels, x, y, expected ) => {

					const offset = ( y * 128 + x ) * 4;
					const actual = Array.from( pixels.slice( offset, offset + 4 ) );
					assert.ok( actual.length === 4 && actual.every( ( value, i ) => Number.isFinite( value ) && Math.abs( value - expected[ i ] ) < 1e-5 ),
						`Pixel (${ x }, ${ y }): ${ actual }, expected ${ expected }` );

				};

				try {

					await renderer.init();
					assert.ok( renderer.backend.isWebGPUBackend, 'Using the native WebGPU backend' );
					renderer.debug.onNodeBuilderCreated = builder => builders.push( builder );
					renderer.setRenderTarget( target );
					renderer.setClearColor( 0, 0 );
					renderer.render( scene, camera );

					const pixels = await renderer.readRenderTargetPixelsAsync( target, 0, 0, 128, 64 );

					for ( let i = 0; i < colors.length; i ++ ) {

						checkPixel( pixels, 16 + i * 32, 32, [ ...colors[ i ], 1 ] );

					}

					assert.strictEqual( builders.length, 2, 'Each mesh retains its own shader builder' );
					assert.strictEqual( builders[ 0 ].vertexShader, builders[ 1 ].vertexShader, 'Equivalent vertex shader source' );
					assert.strictEqual( builders[ 0 ].fragmentShader, builders[ 1 ].fragmentShader, 'Equivalent fragment shader source' );
					assert.strictEqual( renderer._pipelines.caches.size, 1, 'One cached render pipeline' );

					// Update one batch. Both batches must keep their own matrices and colors.
					meshes[ 0 ].setMatrixAt( 0, matrix.makeTranslation( - 0.4, 0.6, 0 ) );
					meshes[ 0 ].setColorAt( 1, color.setRGB( 0.7, 0.2, 0.6 ) );
					meshes[ 0 ].instanceMatrix.needsUpdate = true;
					meshes[ 0 ].instanceColor.needsUpdate = true;
					renderer.render( scene, camera );

					const updated = await renderer.readRenderTargetPixelsAsync( target, 0, 0, 128, 64 );
					checkPixel( updated, 16, 32, [ 0, 0, 0, 0 ] );
					checkPixel( updated, 38, 13, [ ...colors[ 0 ], 1 ] );
					checkPixel( updated, 48, 32, [ 0.7, 0.2, 0.6, 1 ] );
					checkPixel( updated, 80, 32, [ ...colors[ 2 ], 1 ] );
					checkPixel( updated, 112, 32, [ ...colors[ 3 ], 1 ] );
					assert.strictEqual( builders.length, 2, 'Updating instance data does not rebuild shaders' );
					assert.strictEqual( renderer._pipelines.caches.size, 1, 'Updating instance data does not create another pipeline' );

				} finally {

					renderer.setRenderTarget( null );
					for ( const mesh of meshes ) mesh.dispose();
					geometry.dispose();
					material.dispose();
					target.dispose();
					renderer.dispose();

				}

			} );

		} );

	} );

} );
