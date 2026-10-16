import { Box3, CubeTexture, Scene, Vector3, WebGPUCoordinateSystem } from 'three/webgpu';
import { SpecularProbe } from '../../../../examples/jsm/lighting/SpecularProbe.js';
import { SpecularProbes } from '../../../../examples/jsm/lighting/SpecularProbes.js';

function makeProbe( minX, maxX, blendDistance = 0.5 ) {

	return new SpecularProbe( {
		influenceBox: new Box3( new Vector3( minX, - 10, - 10 ), new Vector3( maxX, 10, 10 ) ),
		blendDistance,
		texture: new CubeTexture()
	} );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'SpecularProbes', () => {

			QUnit.test( 'flat core and inward fades from every face', ( assert ) => {

				const probe = makeProbe( - 4, 4 );
				const position = new Vector3();
				assert.strictEqual( probe.getWeight( position.set( - 5, 0, 0 ) ), 0, 'outside' );
				assert.strictEqual( probe.getWeight( position.set( - 4, 0, 0 ) ), 0, 'boundary fades to zero' );
				assert.strictEqual( probe.getWeight( position.set( - 3.75, 0, 0 ) ), 0.5, 'halfway through fade' );
				assert.strictEqual( probe.getWeight( position.set( - 3.5, 0, 0 ) ), 1, 'full influence after fade margin' );
				assert.strictEqual( probe.getWeight( position.set( 2, 0, 0 ) ), 1, 'flat core is not a center peak' );
				assert.strictEqual( probe.getWeight( position.set( 0, 9.75, 0 ) ), 0.5, 'top face' );
				assert.strictEqual( probe.getWeight( position.set( 0, - 9.75, 0 ) ), 0.5, 'bottom face' );
				assert.strictEqual( probe.getWeight( position.set( 0, 0, 9.75 ) ), 0.5, 'front face' );
				assert.strictEqual( probe.getWeight( position.set( 0, 0, - 9.75 ) ), 0.5, 'back face' );

			} );

			QUnit.test( 'priority fill overrides rather than averaging nested volumes', ( assert ) => {

				const large = makeProbe( - 4, 4 );
				const small = makeProbe( - 1, 1 );
				const system = new SpecularProbes( [ large, small ], new CubeTexture() );
				system.sortedProbes = [ small, large ];
				let result = system.getWeights( new Vector3() );
				assert.deepEqual( result.weights.map( slot => slot.weight ), [ 1, 0 ], 'small core takes all coverage' );
				assert.strictEqual( result.fallbackWeight, 0, 'large core covers the sky' );
				result = system.getWeights( new Vector3( 0.75, 0, 0 ) );
				assert.deepEqual( result.weights.map( slot => slot.weight ), [ 0.5, 0.5 ], 'small fade fills from the large core' );
				result = system.getWeights( new Vector3( 3.75, 0, 0 ) );
				assert.deepEqual( result.weights.map( slot => slot.weight ), [ 0, 0.5 ], 'outside small volume' );
				assert.strictEqual( result.fallbackWeight, 0.5, 'sky fills remaining coverage' );
				result = system.getWeights( new Vector3( 20, 0, 0 ) );
				assert.strictEqual( result.fallbackWeight, 1, 'outside all volumes' );

			} );

			QUnit.test( 'capture sorts by volume, respects loaded sources, and waits for GPU completion', async ( assert ) => {

				const large = makeProbe( - 4, 4 );
				const small = makeProbe( - 1, 1 );
				small.source = 'capture';
				const steps = [];
				small.capture = () => steps.push( 'capture' );
				large.capture = () => assert.ok( false, 'loaded texture must not be captured' );
				const system = new SpecularProbes( [ large, small ], new CubeTexture() );
				const renderer = { backend: { isWebGPUBackend: true, device: { queue: { onSubmittedWorkDone: async () => steps.push( 'complete' ) } } } };
				system.atlas.update = ( renderer, textures, options ) => {

					steps.push( 'filter' );
					assert.deepEqual( textures, [ small.texture, large.texture, system.fallbackTexture ], 'array order matches front-to-back priority, sky last' );
					assert.deepEqual( options, { resolution: 64 }, 'requested size forwarded' );

				};

				const elapsed = await system.capture( renderer, new Scene(), { resolution: 64 } );
				assert.deepEqual( steps, [ 'complete', 'capture', 'filter', 'complete' ], 'drain, capture, filter, then completion' );
				assert.deepEqual( system.sortedProbes, [ small, large ], 'publish sorted probes' );
				assert.strictEqual( small.resolution, 64, 'resize capture' );
				assert.ok( elapsed >= 0 && elapsed === system.lastCaptureTime, 'completed elapsed time published' );
				assert.false( system.capturing, 'capture guard released' );
				system.atlas.update = () => {

					throw new Error( 'filter failed' );

				};

				await assert.rejects( system.capture( renderer, new Scene() ), /filter failed/, 'propagate errors' );
				assert.false( system.capturing, 'capture guard released after failure' );

			} );

			QUnit.test( 'capture ownership and state restoration after failure', ( assert ) => {

				const probe = makeProbe( - 4, 4 );
				const loaded = probe.texture;
				let loadedDisposed = false;
				loaded.addEventListener( 'dispose', () => {

					loadedDisposed = true;

				} );
				probe.dispose();
				assert.false( loadedDisposed, 'dispose preserves loaded texture' );
				let target = { name: 'caller target' }, face = 3, mip = 2;
				const previousMRT = {};
				let mrt = previousMRT;
				const previousTarget = target;
				const renderer = {
					coordinateSystem: WebGPUCoordinateSystem,
					xr: { enabled: true },
					autoClear: false,
					autoClearColor: false,
					autoClearDepth: false,
					autoClearStencil: false,
					getMRT: () => mrt,
					setMRT: ( value ) => {

						mrt = value;

					},
					getRenderTarget: () => target,
					getActiveCubeFace: () => face,
					getActiveMipmapLevel: () => mip,
					setRenderTarget: ( value, nextFace, nextMip ) => {

						target = value; face = nextFace; mip = nextMip;

					},
					render: () => {

						throw new Error( 'capture failed' );

					}
				};
				assert.throws( () => probe.capture( renderer, new Scene() ), /capture failed/, 'propagates render failure' );
				assert.strictEqual( target, previousTarget, 'restore render target' );
				assert.strictEqual( face, 3, 'restore active face' );
				assert.strictEqual( mip, 2, 'restore mip level' );
				assert.true( renderer.xr.enabled, 'restore XR' );
				assert.false( renderer.autoClear, 'restore auto clearing' );
				assert.false( renderer.autoClearDepth, 'restore depth clearing' );
				assert.strictEqual( mrt, previousMRT, 'restore MRT' );
				assert.strictEqual( probe.texture, loaded, 'failed capture keeps previous source' );
				let count = 0;
				renderer.render = () => {

					count ++;
					assert.true( renderer.autoClear && renderer.autoClearColor && renderer.autoClearDepth && renderer.autoClearStencil, 'all cube faces clear stale capture data' );
					assert.strictEqual( mrt, null, 'capture is independent of caller MRT' );

				};

				probe.capture( renderer, new Scene() );
				assert.strictEqual( count, 6, 'complete all six faces before publishing' );
				const captured = probe.texture;
				let captureDisposed = false;
				captured.addEventListener( 'dispose', () => {

					captureDisposed = true;

				} );
				probe.texture = loaded;
				probe.dispose();
				assert.true( captureDisposed, 'owned capture is disposed even after source switch' );
				assert.false( loadedDisposed, 'loaded replacement stays caller-owned' );
				assert.strictEqual( probe.texture, loaded, 'loaded replacement remains usable' );

			} );

		} );

	} );

} );
