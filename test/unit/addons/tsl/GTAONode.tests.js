import { BoxGeometry, Mesh, MeshBasicNodeMaterial, PerspectiveCamera, PlaneGeometry, RenderPipeline, Scene, UnsignedByteType, Vector2, WebGPURenderer } from 'three/webgpu';
import { mrt, normalViewGeometry, pass, rtt, vec4 } from 'three/tsl';
import { ao } from '../../../../examples/jsm/tsl/display/GTAONode.js';

// Read through RGBA8 since RedFormat readback is not supported on all backends.
async function readVisibility( renderer, target, x, y, width, height ) {

	const data = await renderer.readRenderTargetPixelsAsync( target, x, y, width, height );
	const stride = ( data.length - width * 4 ) / ( height - 1 );
	const values = [];

	for ( let row = 0; row < height; row ++ ) {

		for ( let column = 0; column < width; column ++ ) {

			values.push( data[ row * stride + column * 4 ] / 255 );

		}

	}

	return values;

}

async function createFixture( backend, assert ) {

	const renderer = new WebGPURenderer( { antialias: false, forceWebGL: backend === 'webgl' } );

	try {

		await renderer.init();

	} catch ( error ) {

		renderer.dispose();
		assert.ok( true, `SKIPPED: ${ backend } is unavailable (${ error.message }).` );
		return null;

	}

	renderer.setPixelRatio( 1 );
	renderer.setSize( 320, 180 );

	const scene = new Scene();
	const camera = new PerspectiveCamera( 75, 320 / 180, 0.05, 1200 );
	const wall = new Mesh( new PlaneGeometry( 10000, 10000 ), new MeshBasicNodeMaterial() );
	scene.add( wall );

	const prePass = pass( scene, camera, { samples: 0 } );
	prePass.setMRT( mrt( { output: normalViewGeometry } ) );
	const effect = ao( prePass.getTextureNode( 'depth' ), prePass.getTextureNode(), camera );
	const output = rtt( vec4( effect.getTextureNode().r, 0, 0, 1 ), 320, 180, { type: UnsignedByteType, depthBuffer: false } );
	const pipeline = new RenderPipeline( renderer, output );
	pipeline.outputColorTransform = false;

	return {
		renderer, scene, camera, wall, effect,
		async render() {

			const size = renderer.getDrawingBufferSize( new Vector2() );
			output.setSize( Math.round( size.x * effect.resolutionScale ), Math.round( size.y * effect.resolutionScale ) );

			// Let FRAME nodes update and newly compiled materials settle.
			for ( let i = 0; i < 3; i ++ ) {

				await new Promise( requestAnimationFrame );
				pipeline.render();

			}

			return output.renderTarget;

		},
		dispose() {

			pipeline.dispose();
			output.dispose();
			effect.dispose();
			prePass.dispose();
			wall.geometry.dispose();
			wall.material.dispose();
			renderer.dispose();

		}
	};

}

QUnit.module( 'Addons', () => {

	QUnit.module( 'GTAONode', () => {

		for ( const backend of [ 'webgpu', 'webgl' ] ) {

			QUnit.test( `Subpixel steps must not occlude an isolated wall (${ backend })`, async ( assert ) => {

				const fixture = await createFixture( backend, assert );
				if ( fixture === null ) return;
				const { renderer, camera, wall, effect } = fixture;

				try {

					for ( const angle of [ 0, 45, 75, 85 ] ) {

						for ( const distance of [ 3, 30, 60, 100 ] ) {

							wall.position.z = - distance;
							wall.rotation.y = angle * Math.PI / 180;
							const values = await readVisibility( renderer, await fixture.render(), 152, 82, 16, 16 );
							const mean = values.reduce( ( sum, value ) => sum + value, 0 ) / values.length;
							assert.ok( mean > 0.92, `${ angle } degrees, ${ distance } m: visibility ${ mean } should be near 1, not self-occluded.` );

						}

					}

					// Exercise depth textures with odd dimensions and reduced AO resolution.
					renderer.setSize( 321, 169 );
					camera.aspect = 321 / 169;
					camera.updateProjectionMatrix();
					wall.rotation.y = 0;

					for ( const scale of [ 1, 0.5, 0.25 ] ) {

						effect.resolutionScale = scale;
						const target = await fixture.render();
						const values = await readVisibility( renderer, target, Math.floor( target.width / 2 ) - 16, Math.floor( target.height / 2 ) - 16, 32, 32 );
						assert.strictEqual( target.width, Math.round( 321 * scale ) );
						assert.strictEqual( target.height, Math.round( 169 * scale ) );
						const mean = values.reduce( ( sum, value ) => sum + value, 0 ) / values.length;
						assert.ok( mean > 0.95, `Frontal wall remains near-unoccluded after resize, scale ${ scale }: ${ mean }.` );

					}

				} finally {

					fixture.dispose();

				}

			} );

			QUnit.test( `Contact occlusion and cleared depth (${ backend })`, async ( assert ) => {

				const fixture = await createFixture( backend, assert );
				if ( fixture === null ) return;
				const { renderer, scene, wall, effect } = fixture;
				const blocker = new Mesh( new BoxGeometry( 1, 1, 0.25 ), wall.material );

				try {

					wall.position.z = - 4;
					blocker.position.z = - 3.875;
					scene.add( blocker );
					effect.radius.value = 1;
					const contact = await readVisibility( renderer, await fixture.render(), 128, 58, 64, 64 );
					assert.ok( contact.filter( value => value < 0.9 ).length > 100, 'A real protruding blocker still occludes the wall.' );

					scene.remove( blocker );
					wall.geometry.dispose();
					wall.geometry = new PlaneGeometry( 3, 3 );
					wall.position.z = - 6;
					const sky = await readVisibility( renderer, await fixture.render(), 0, 0, 16, 16 );
					assert.ok( Math.min( ...sky ) > 0.99, 'Cleared depth stays unoccluded.' );

				} finally {

					blocker.geometry.dispose();
					fixture.dispose();

				}

			} );

		}

	} );

} );
