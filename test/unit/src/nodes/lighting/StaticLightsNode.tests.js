import {
	FloatType, Group, LinearSRGBColorSpace, Mesh, MeshStandardMaterial,
	OrthographicCamera, PlaneGeometry, PointLight, RenderTarget, Scene,
	SphereGeometry, SpotLight
} from '../../../../../src/Three.Core.js';
import WebGPURenderer from '../../../../../src/renderers/webgpu/WebGPURenderer.js';

const size = 32;

function createFixture( isStatic ) {

	const scene = new Scene();
	const camera = new OrthographicCamera( - 5, 5, 5, - 5, 0.1, 100 );
	camera.position.set( 0, 0, 10 );

	const material = new MeshStandardMaterial( { color: 0xb0c0d0, roughness: 0.35, metalness: 0.25 } );
	const plane = new Mesh( new PlaneGeometry( 20, 20 ), material );
	const sphere = new Mesh( new SphereGeometry( 0.8, 24, 12 ), material );
	sphere.position.set( 0.5, - 0.5, 1 );
	scene.add( plane, sphere );

	const point = new PointLight( 0xff7040, 12, 5, 1.3 );
	point.position.set( - 1.5, 0.3, 2 );
	point.layers.enable( 1 );
	scene.add( point );

	const spot = new SpotLight( 0x5080ff, 18, 8, Math.PI / 5, 0.4, 0.7 );
	spot.position.set( 2, 2, 4 );
	spot.target.position.set( 0, - 0.5, 0 );
	scene.add( spot, spot.target );

	// Independently transformed parents exercise world-space target directions.
	const lightParent = new Group();
	lightParent.position.set( 0.4, - 0.3, 0.2 );
	lightParent.rotation.set( 0, 0.35, 0.25 );
	const targetParent = new Group();
	targetParent.position.set( - 0.3, 0.4, 0.1 );
	targetParent.rotation.z = 0.3;
	const sharpSpot = new SpotLight( 0x80ff60, 30, 7, Math.PI / 7, 0, 2.6 );
	sharpSpot.position.set( - 2, 1, 3 );
	sharpSpot.target.position.set( - 1, - 1, 0 );
	lightParent.add( sharpSpot );
	targetParent.add( sharpSpot.target );
	scene.add( lightParent, targetParent );

	const lights = [ point, spot, sharpSpot ];
	for ( const light of lights ) light.static = isStatic;

	return {
		scene, camera, lights, point, spot, sharpSpot, sphere, plane,
		dispose() {

			plane.geometry.dispose();
			sphere.geometry.dispose();
			material.dispose();

		}
	};

}

function assertPixelsEqual( assert, actual, expected, label ) {

	let maximumError = 0;
	let maximumValue = 0;
	let finite = true;

	for ( let i = 0; i < actual.length; i ++ ) {

		finite = finite && Number.isFinite( actual[ i ] ) && Number.isFinite( expected[ i ] );
		maximumError = Math.max( maximumError, Math.abs( actual[ i ] - expected[ i ] ) );
		if ( i % 4 !== 3 ) maximumValue = Math.max( maximumValue, expected[ i ] );

	}

	assert.true( finite, label + ': all pixels are finite' );
	assert.true( maximumValue > 0.01, label + ': reference contains illuminated pixels' );
	assert.true( maximumError < 0.0001, label + ': maximum channel difference ' + maximumError );

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'StaticLightsNode', () => {

			QUnit.test.if( 'WebGPU rendering matches individual point and spot lights', typeof navigator !== 'undefined' && navigator.gpu !== undefined, async ( assert ) => {

				assert.timeout( 60000 );

				const adapter = await navigator.gpu.requestAdapter();

				if ( adapter === null ) {

					assert.true( true, 'WebGPU adapter unavailable; rendering comparison requires a WebGPU adapter' );
					return;

				}

				const renderer = new WebGPURenderer();
				await renderer.init();
				assert.true( renderer.backend.isWebGPUBackend, 'uses the WebGPU backend' );

				const errors = [];
				renderer.onError = ( error ) => errors.push( error.message );
				renderer.setSize( size, size );
				const target = new RenderTarget( size, size, { type: FloatType, colorSpace: LinearSRGBColorSpace } );
				renderer.setRenderTarget( target );

				const reference = createFixture( false );
				const batched = createFixture( true );

				const render = async ( fixture ) => {

					// Advance the node frame before rendering, including consecutive renders of one scene.
					await new Promise( resolve => requestAnimationFrame( resolve ) );
					renderer.render( fixture.scene, fixture.camera );
					return renderer.readRenderTargetPixelsAsync( target, 0, 0, size, size );

				};

				const compare = async ( label, configure = () => {} ) => {

					configure( reference );
					configure( batched );
					const expected = await render( reference );
					const actual = await render( batched );
					assertPixelsEqual( assert, actual, expected, label );

				};

				try {

					await compare( 'point lights and nondefault decay', ( fixture ) => {

						fixture.spot.visible = false;
						fixture.sharpSpot.visible = false;

					} );

					const lightsNode = renderer.lighting.getNode( batched.scene );
					assert.true( [ ...lightsNode._staticLightsNodes.values() ].some( node => node !== null && node.grid.data.length === 16 ), 'point lights use a storage-buffer batch' );

					await compare( 'sharp spotlight with zero penumbra', ( fixture ) => {

						fixture.point.visible = false;
						fixture.sharpSpot.visible = true;

					} );

					await compare( 'spot lights, penumbra and transformed targets', ( fixture ) => {

						fixture.point.visible = false;
						fixture.spot.visible = true;
						fixture.sharpSpot.visible = true;

					} );
					assert.true( [ ...lightsNode._staticLightsNodes.values() ].some( node => node !== null && node.grid.data.length === 32 ), 'spot lights use a storage-buffer batch' );

					await compare( 'mixed lights and a material shared by two meshes', ( fixture ) => {

						fixture.point.visible = true;

					} );
					assert.true( [ ...lightsNode._staticLightsNodes.values() ].some( node => node !== null && node.grid.data.length === 48 ), 'mixed lights use a storage-buffer batch' );
					const cachedNodes = [ ...lightsNode._staticLightsNodes.values() ];

					await compare( 'moving camera reuses the world-space grid', ( fixture ) => {

						fixture.camera.position.set( 2, 1, 9 );
						fixture.camera.lookAt( 0, 0, 0 );

					} );
					assert.deepEqual( [ ...lightsNode._staticLightsNodes.values() ], cachedNodes, 'camera movement reuses existing batches' );

					await compare( 'moving a receiving mesh keeps the lighting correct', ( fixture ) => {

						fixture.sphere.position.x -= 1;

					} );

					await compare( 'camera layers select the correct static-light set', ( fixture ) => {

						fixture.camera.layers.set( 1 );
						fixture.plane.layers.enable( 1 );
						fixture.sphere.layers.enable( 1 );

					} );

					await compare( 'returning to an earlier light set', ( fixture ) => {

						fixture.camera.layers.set( 0 );

					} );

					await compare( 'removing a static light', ( fixture ) => {

						fixture.scene.remove( fixture.spot );

					} );

					await compare( 'adding a static light again', ( fixture ) => {

						fixture.scene.add( fixture.spot );

					} );

					// Resetting static permits an edit, and the next static render must capture it.
					batched.point.static = false;
					await compare( 'mixing static and dynamic lights', ( fixture ) => {

						fixture.point.position.x += 0.75;

					} );
					batched.point.static = true;
					await compare( 're-entering static mode captures the updated position' );
					assert.true( [ ...lightsNode._staticLightsNodes.values() ].some( node => node !== null && node.grid.data.length === 48 && node.grid.data[ 0 ] === - 0.75 ), 'the edited point light enters a new storage-buffer batch' );

					await renderer.backend.device.queue.onSubmittedWorkDone();
					assert.deepEqual( errors, [], 'no GPU validation errors' );

				} finally {

					reference.dispose();
					batched.dispose();
					target.dispose();
					await renderer.dispose();

				}

			} );

		} );

	} );

} );
