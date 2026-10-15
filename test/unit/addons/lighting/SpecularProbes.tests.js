import { Box3, CubeTexture, Scene, Vector3, WebGPUCoordinateSystem } from 'three/webgpu';
import { SpecularProbe } from '../../../../examples/jsm/lighting/SpecularProbe.js';
import { SpecularProbes } from '../../../../examples/jsm/lighting/SpecularProbes.js';

function makeProbe( minX, maxX, blendDistance = 2 ) {

	return new SpecularProbe( {
		influenceBox: new Box3( new Vector3( minX, - 10, - 10 ), new Vector3( maxX, 10, 10 ) ),
		blendDistance,
		texture: new CubeTexture()
	} );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'SpecularProbes', () => {

			QUnit.test( 'face fades and continuous two-volume transitions', ( assert ) => {

				const left = makeProbe( - 4, 2 );
				const right = makeProbe( 0, 6 );
				const system = new SpecularProbes( [ left, right ], new CubeTexture() );
				const position = new Vector3();
				assert.strictEqual( left.getWeight( position.set( - 5, 0, 0 ) ), 0, 'outside' );
				assert.strictEqual( left.getWeight( position.set( - 4, 0, 0 ) ), 0, 'boundary fades to zero' );
				assert.strictEqual( left.getWeight( position.set( - 3, 0, 0 ) ), 0.5, 'halfway through fade' );
				assert.strictEqual( left.getWeight( position.set( 0, 9, 0 ) ), 0.5, 'all six faces affect influence' );

				for ( let x = 0; x <= 2; x += 0.125 ) {

					system.update( position.set( x, 0, 0 ) );
					const weight = ( probe ) => system.slots.find( ( slot ) => slot.probe === probe )?.weight || 0;
					assert.strictEqual( weight( left ), 1 - x / 2, `left weight at ${ x }` );
					assert.strictEqual( weight( right ), x / 2, `right weight at ${ x }` );
					assert.strictEqual( system.fallbackWeight, 0, 'no sky leaks into complementary overlap' );

				}

			} );

			QUnit.test( 'normalization, fallback, and missing captures', ( assert ) => {

				const first = makeProbe( - 4, 4 );
				const second = makeProbe( - 4, 4 );
				const system = new SpecularProbes( [ first, second ], new CubeTexture() );
				system.update( new Vector3() );
				assert.deepEqual( system.slots.map( ( slot ) => slot.weight ), [ 0.5, 0.5 ], 'overlap greater than one is normalized' );
				second.texture = null;
				system.update( new Vector3( - 3, 0, 0 ) );
				assert.strictEqual( system.slots[ 0 ].weight, 0.5, 'unavailable probe is ignored' );
				assert.strictEqual( system.fallbackWeight, 0.5, 'uncovered influence uses global environment' );
				system.update( new Vector3( 20, 0, 0 ) );
				assert.strictEqual( system.fallbackWeight, 1, 'outside all volumes' );
				assert.ok( system.slots.every( ( slot ) => slot.probe === null && slot.weight === 0 ), 'no stale selection' );

			} );

			QUnit.test( 'round-robin capture is opt-in and interval limited', ( assert ) => {

				const probes = [ makeProbe( - 4, 4 ), makeProbe( - 4, 4 ), makeProbe( - 4, 4 ) ];
				const captured = [];
				for ( const probe of probes ) probe.capture = () => captured.push( probe );
				const system = new SpecularProbes( probes, new CubeTexture() );
				assert.strictEqual( system.updateCapture( null, null, 0 ), null, 'capture once is the default' );
				probes[ 0 ].realtime = probes[ 2 ].realtime = true;
				assert.strictEqual( system.updateCapture( null, null, 0 ), probes[ 0 ], 'first realtime probe' );
				assert.strictEqual( system.updateCapture( null, null, 0.9 ), null, 'no update inside interval' );
				assert.strictEqual( system.updateCapture( null, null, 1 ), probes[ 2 ], 'skip loaded/static probe' );
				assert.strictEqual( system.updateCapture( null, null, 2 ), probes[ 0 ], 'wrap around' );
				assert.deepEqual( captured, [ probes[ 0 ], probes[ 2 ], probes[ 0 ] ], 'one whole capture per update' );

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
