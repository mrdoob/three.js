import { DataTexture, DataUtils, FloatType, HalfFloatType, LinearFilter, Matrix4, NodeMaterial, PerspectiveCamera, QuadMesh, RenderTarget, RendererUtils, Vector2 } from 'three/webgpu';
import { context, indirectSpecular, texture, vec4 } from 'three/tsl';
import { coverageDenoise } from '../../../../examples/jsm/tsl/display/CoverageDenoiseNode.js';
import { getSharedRenderer } from '../../src/nodes/tsl/gpu-test-utils.js';

const size = 16;

async function fixture( assert, run ) {

	const renderer = await getSharedRenderer( 'webgpu' );
	if ( ! renderer ) {

		assert.ok( true, 'SKIPPED: WebGPU unavailable' );
		return;

	}

	const state = RendererUtils.saveRendererState( renderer );
	const oldContext = renderer.contextNode;
	const oldRatio = renderer.getPixelRatio();
	const oldSize = renderer.getSize( new Vector2() );
	const textures = [];
	const makeTexture = callback => {

		const data = new Float32Array( size * size * 4 );
		for ( let y = 0; y < size; y ++ ) {

			for ( let x = 0; x < size; x ++ ) data.set( callback( x, y ), 4 * ( x + size * y ) );

		}

		const result = new DataTexture( data, size, size );
		result.type = FloatType;
		result.needsUpdate = true;
		textures.push( result );
		return result;

	};

	const input = makeTexture( () => [ 0, 0, 0, 0 ] );
	const depth = makeTexture( () => [ 0.5, 0, 0, 0 ] );
	const normal = makeTexture( () => [ 0.5, 0.5, 1, 1 ] );
	const velocity = makeTexture( () => [ 0, 0, 0, 0 ] );
	const surfaceId = makeTexture( () => [ 1, 0, 0, 0 ] );
	const reactive = makeTexture( () => [ 0, 0, 0, 0 ] );
	const hitDistance = makeTexture( () => [ 1, 0, 0, 0 ] );
	const camera = new PerspectiveCamera( 50, 1, 0.1, 100 );
	camera.coordinateSystem = renderer.coordinateSystem;
	camera.updateProjectionMatrix();
	camera.updateMatrixWorld();
	const node = coverageDenoise( texture( input ), camera, { depth: texture( depth ), normal: texture( normal ), velocity: texture( velocity ), hitDistance: texture( hitDistance ), surfaceId: texture( surfaceId ).r, reactive: texture( reactive ).r } );
	node.radius.value = 1;
	const material = new NodeMaterial();
	material.fragmentNode = node;
	const quad = new QuadMesh( material );
	const update = callback => {

		for ( let y = 0; y < size; y ++ ) {

			for ( let x = 0; x < size; x ++ ) input.image.data.set( callback( x, y ), 4 * ( x + size * y ) );

		}

		input.needsUpdate = true;

	};

	const render = async () => {

		// Frame-updated nodes must run on distinct animation frames.
		await new Promise( resolve => requestAnimationFrame( resolve ) );
		renderer.setRenderTarget( null );
		quad.render( renderer );
		const target = node.getRenderTarget();
		const data = await renderer.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height );
		return Array.from( data, DataUtils.fromHalfFloat );

	};

	try {

		renderer.setPixelRatio( 1 );
		renderer.setSize( size, size );
		renderer.contextNode = context();
		const compose = async providers => {

			await new Promise( resolve => requestAnimationFrame( resolve ) );
			const target = new RenderTarget( size, size, { type: FloatType, depthBuffer: false } );
			const resolveMaterial = new NodeMaterial();
			resolveMaterial.fragmentNode = indirectSpecular( [ () => node, ...providers ] ).sample();
			try {

				renderer.setRenderTarget( target );
				new QuadMesh( resolveMaterial ).render( renderer );
				return Array.from( await renderer.readRenderTargetPixelsAsync( target, 8, 8, 1, 1 ) );

			} finally {

				renderer.setRenderTarget( null );
				resolveMaterial.dispose();
				target.dispose();

			}

		};

		await run( { node, renderer, input, depth, normal, velocity, hitDistance, surfaceId, reactive, camera, update, render, compose } );

	} finally {

		node.dispose();
		material.dispose();
		for ( const value of textures ) value.dispose();
		renderer.contextNode = oldContext;
		renderer.setPixelRatio( oldRatio );
		renderer.setSize( oldSize.x, oldSize.y );
		RendererUtils.restoreRendererState( renderer, state );

	}

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'CoverageDenoiseNode', () => {

			QUnit.test( 'roughness, surface identity and reactive reflected motion invalidate history', async assert => {

				await fixture( assert, async ( { node, renderer, normal, surfaceId, reactive, update, render } ) => {

					node.hitDistanceNode = null;
					update( () => [ 0, 0, 0, 1 ] );
					for ( let frame = 0; frame < 16; frame ++ ) await render();
					const age = async () => ( await renderer.readRenderTargetPixelsAsync( node.getRenderTarget(), 8, 8, 1, 1, 2 ) )[ 0 ];
					for ( let i = 3; i < normal.image.data.length; i += 4 ) normal.image.data[ i ] = 0.2;
					normal.needsUpdate = true;
					await render();
					assert.strictEqual( await age(), 1, 'Changed roughness rejects otherwise identical geometry' );
					await render();
					assert.ok( Math.abs( await age() - 2 ) < 0.01, 'Stable black reflections accumulate normally' );
					for ( let i = 0; i < surfaceId.image.data.length; i += 4 ) surfaceId.image.data[ i ] = 2;
					surfaceId.needsUpdate = true;
					await render();
					assert.strictEqual( await age(), 1, 'A different coplanar surface rejects history' );
					await render();
					for ( let i = 0; i < reactive.image.data.length; i += 4 ) reactive.image.data[ i ] = 1;
					reactive.needsUpdate = true;
					const result = await render();
					assert.strictEqual( await age(), 1, 'Moving reflected objects reject stale reflection history' );
					assert.ok( result.every( ( value, i ) => value === ( i % 4 === 3 ? 1 : 0 ) ), 'Motion rejection preserves valid black coverage' );

				} );

			} );

			QUnit.test( 'hit-distance edges preserve valid black reflections on a flat receiver', async assert => {

				await fixture( assert, async ( { node, hitDistance, update, render } ) => {

					node.maxFrames.value = 1;
					update( x => x < size / 2 ? [ 4, 2, 1, 1 ] : [ 0, 0, 0, 1 ] );
					for ( let y = 0; y < size; y ++ ) {

						for ( let x = 0; x < size; x ++ ) hitDistance.image.data[ 4 * ( x + size * y ) ] = x < size / 2 ? 1 : 8;

					}

					hitDistance.needsUpdate = true;
					const data = await render();
					const pixel = 4 * ( size / 2 + size * size / 2 );
					assert.ok( data[ pixel ] < 0.01, 'A distant bright reflection does not bleed into a black reflection on the same plane' );
					assert.strictEqual( data[ pixel + 3 ], 1, 'Black reflection retains full coverage' );

				} );

			} );

			for ( const enabled of [ true, false ] ) {

				QUnit.test( `anisotropic history magnification with stretch rejection ${ enabled ? 'enabled' : 'disabled' }`, async assert => {

					await fixture( assert, async ( { node, renderer, velocity, render } ) => {

						node.hitDistanceNode = null;
						node.useStretchRejection.value = enabled;
						for ( let frame = 0; frame < 16; frame ++ ) await render();
						for ( let y = 0; y < size; y ++ ) {

							for ( let x = 0; x < size; x ++ ) velocity.image.data[ 4 * ( x + size * y ) ] = ( 2 * ( x + 0.5 ) / size - 1 ) * 0.75;

						}

						velocity.needsUpdate = true;
						await render();
						const age = ( await renderer.readRenderTargetPixelsAsync( node.getRenderTarget(), 8, 8, 1, 1, 2 ) )[ 0 ];
						assert.ok( Math.abs( age - ( enabled ? 2 : 16 ) ) < 0.03, `Magnified history carries less evidence, independently of black lighting; age=${ age }` );

					} );

				} );

			}

			QUnit.test( 'a compiled consumer follows consecutive outputs without history copies', async assert => {

				await fixture( assert, async ( { node, renderer, update } ) => {

					node.maxFrames.value = 1;
					const target = new RenderTarget( size, size, { type: FloatType, depthBuffer: false } );
					const material = new NodeMaterial();
					material.fragmentNode = node.getTextureNode().sample();
					const quad = new QuadMesh( material );
					const copy = renderer.copyTextureToTexture;
					let copies = 0;
					renderer.copyTextureToTexture = function ( ...args ) {

						copies ++;
						return copy.apply( this, args );

					};

					try {

						for ( const value of [ 1, 2, 3, 4, 5 ] ) {

							update( () => [ value, value / 2, 0, 1 ] );
							await new Promise( resolve => requestAnimationFrame( resolve ) );
							renderer.setRenderTarget( target );
							quad.render( renderer );
							const data = await renderer.readRenderTargetPixelsAsync( target, 8, 8, 1, 1 );
							assert.ok( Math.abs( data[ 0 ] - value ) < 0.01 && Math.abs( data[ 1 ] - value / 2 ) < 0.01, `Consumer sees frame ${ value } rather than an older buffer` );

						}

						assert.strictEqual( copies, 0, 'Radiance, geometry and age history require no texture copies' );

					} finally {

						renderer.copyTextureToTexture = copy;
						renderer.setRenderTarget( null );
						material.dispose();
						target.dispose();

					}

				} );

			} );

			for ( const enabled of [ true, false ] ) {

				QUnit.test( `partial reprojection support discounts age with gather confidence ${ enabled ? 'enabled' : 'disabled' }`, async assert => {

					await fixture( assert, async ( { node, renderer, normal, velocity, render } ) => {

						node.hitDistanceNode = null;
						node.useGatherConfidence.value = enabled;
						for ( let y = 0; y < size; y ++ ) {

							for ( let x = 0; x < size; x ++ ) normal.image.data.set( [ 0.5, 0.5, x % 2 === 0 ? 1 : 0, 1 ], 4 * ( x + size * y ) );

						}

						normal.needsUpdate = true;
						for ( let frame = 0; frame < 16; frame ++ ) await render();
						for ( let i = 0; i < normal.image.data.length; i += 4 ) {

							normal.image.data.set( [ 0.5, 0.5, 1, 1 ], i );
							// A half-pixel UV displacement is one pixel divided by size in NDC.
							velocity.image.data[ i ] = 1 / size;

						}

						normal.needsUpdate = velocity.needsUpdate = true;
						const data = await render();
						const age = ( await renderer.readRenderTargetPixelsAsync( node.getRenderTarget(), 8, 8, 1, 1, 2 ) )[ 0 ];
						const expected = enabled ? 9 : 16;
						assert.ok( Math.abs( age - expected ) < 0.02, `Half the bilinear support carries half the previous age when enabled; actual=${ age }` );
						assert.ok( data.every( value => value === 0 ), 'Confidence changes age independently of zero lighting coverage' );

					} );

				} );

			}

			QUnit.test( 'sparse HDR hits retain radiance; invalid colored samples are ignored', async assert => {

				await fixture( assert, async ( { update, render } ) => {

					update( ( x, y ) => ( x + y ) % 2 === 0 ? [ 4, 2, 1, 1 ] : [ 100, 50, 25, 0 ] );
					const data = await render();
					let valid = true;
					let partial = 0;
					for ( let i = 0; i < data.length; i += 4 ) {

						valid &&= Math.abs( data[ i ] - 4 ) < 0.01 && Math.abs( data[ i + 1 ] - 2 ) < 0.01 && Math.abs( data[ i + 2 ] - 1 ) < 0.01;
						if ( data[ i + 3 ] > 0 && data[ i + 3 ] < 1 ) partial ++;

					}

					assert.ok( valid, 'Missing samples neither darken nor contaminate valid HDR radiance' );
					assert.strictEqual( partial, size * size, 'Coverage is reconstructed independently of brightness' );

				} );

			} );

			QUnit.test( 'half-resolution linear input filters coverage before radiance', async assert => {

				await fixture( assert, async ( { node, input, render } ) => {

					const half = size / 2;
					input.image = { width: half, height: half, data: new Uint16Array( half * half * 4 ) };
					input.type = HalfFloatType;
					input.minFilter = input.magFilter = LinearFilter;
					for ( let y = 0; y < half; y ++ ) {

						for ( let x = 0; x < half; x ++ ) {

							const value = ( x + y ) % 2 === 0 ? [ 4, 2, 1, 1 ] : [ 100, 50, 25, 0 ];
							input.image.data.set( value.map( DataUtils.toHalfFloat ), 4 * ( x + half * y ) );

						}

					}

					input.needsUpdate = true;
					node.radius.value = 1.5;
					const data = await render();
					assert.ok( data.every( ( value, i ) => i % 4 === 3 || Math.abs( value - ( data[ i - i % 4 + 3 ] > 0 ? [ 4, 2, 1 ][ i % 4 ] : 0 ) ) < 0.01 ), `Bright invalid source texels never enter reconstructed radiance through hardware interpolation; minR=${ Math.min( ...data.filter( ( _, i ) => i % 4 === 0 ) ) }, maxR=${ Math.max( ...data.filter( ( _, i ) => i % 4 === 0 ) ) }, zeroCoverage=${ data.filter( ( v, i ) => i % 4 === 3 && v === 0 ).length }` );
					assert.ok( data.some( ( value, i ) => i % 4 === 3 && value > 0 && value < 1 ), 'Sparse coverage is reconstructed at full resolution' );

				} );

			} );

			QUnit.test( 'disocclusion restarts per-pixel history age independently of coverage', async assert => {

				await fixture( assert, async ( { node, renderer, depth, update, render } ) => {

					node.hitDistanceNode = null;
					node.radius.value = 0;
					update( () => [ 4, 2, 1, 0 ] );
					for ( let frame = 0; frame < 16; frame ++ ) await render();
					const readAge = async () => {

						const values = await renderer.readRenderTargetPixelsAsync( node.getRenderTarget(), 8, 8, 1, 1, 2 );
						return values[ 0 ];

					};

					assert.strictEqual( await readAge(), 16, 'Valid geometry ages even when lighting coverage is zero' );
					for ( let i = 0; i < depth.image.data.length; i += 4 ) depth.image.data[ i ] = 0.8;
					depth.needsUpdate = true;
					update( x => [ 4, 2, 1, x % 2 ] );
					await render();
					assert.strictEqual( await readAge(), 1, 'A disoccluded pixel begins with one observation' );
					update( x => [ 4, 2, 1, 1 - x % 2 ] );
					const data = await render();
					assert.strictEqual( await readAge(), 2, 'Age follows the reprojected pixel rather than the global frame count' );
					assert.ok( data.every( ( value, i ) => Math.abs( value - [ 4, 2, 1, 0.5 ][ i % 4 ] ) < 0.01 ), 'The second observation receives half weight instead of the mature 1/16 weight' );

				} );

			} );

			QUnit.test( 'newly revealed lighting gives its second observation half weight', async assert => {

				await fixture( assert, async ( { node, depth, update, render } ) => {

					node.hitDistanceNode = null;
					node.radius.value = 0;
					update( () => [ 4, 2, 1, 0 ] );
					for ( let frame = 0; frame < 16; frame ++ ) await render();
					for ( let i = 0; i < depth.image.data.length; i += 4 ) depth.image.data[ i ] = 0.8;
					depth.needsUpdate = true;
					update( x => [ 4, 2, 1, x % 2 ] );
					await render();
					update( x => [ 4, 2, 1, 1 - x % 2 ] );
					const data = await render();
					assert.ok( data.every( ( value, i ) => Math.abs( value - [ 4, 2, 1, 0.5 ][ i % 4 ] ) < 0.01 ), 'Disocclusion recovery is correct without inspecting implementation-specific age storage' );

				} );

			} );

			QUnit.test( 'interpolated geometry cannot validate an entirely rejected history gather', async assert => {

				await fixture( assert, async ( { node, depth, velocity, update, render } ) => {

					node.hitDistanceNode = null;
					node.radius.value = 0;
					const deviceDepth = distance => 100 / 99.9 - 10 / ( 99.9 * distance );
					for ( let y = 0; y < size; y ++ ) {

						for ( let x = 0; x < size; x ++ ) depth.image.data[ 4 * ( x + size * y ) ] = deviceDepth( x % 2 === 0 ? 0.18 : 0.22 );

					}

					depth.needsUpdate = true;
					update( () => [ 4, 2, 1, 1 ] );
					await render();
					for ( let i = 0; i < depth.image.data.length; i += 4 ) {

						depth.image.data[ i ] = deviceDepth( 0.2 );
						velocity.image.data[ i ] = 0.5 / size;

					}

					depth.needsUpdate = velocity.needsUpdate = true;
					update( x => [ 4, 2, 1, x % 2 ] );
					const data = await render();
					assert.ok( data.every( ( value, i ) => {

						const coverage = Math.floor( i / 4 ) % size % 2;
						return Math.abs( value - ( i % 4 === 3 ? coverage : coverage * [ 4, 2, 1 ][ i % 4 ] ) ) < 0.01;

					} ), 'Neither tap belongs to the current surface, even though their interpolated depth matches it' );

				} );

			} );

			QUnit.test( 'spatial radius uses input texels at half resolution', async assert => {

				await fixture( assert, async ( { node, input, render } ) => {

					const half = size / 2;
					input.image = { width: half, height: half, data: new Float32Array( half * half * 4 ) };
					for ( let y = 0; y < half; y ++ ) {

						for ( let x = 0; x < half; x ++ ) input.image.data.set( [ 4, 2, 1, x === half / 2 ? 1 : 0 ], 4 * ( x + half * y ) );

					}

					input.needsUpdate = true;
					node.radius.value = 1;
					const data = await render();
					const i = 4 * ( size / 2 + size * size / 2 );
					const expected = 1 / ( 1 + 2 * Math.exp( - 0.5 ) );
					assert.ok( Math.abs( data[ i + 3 ] - expected ) < 0.002, 'Neighbors are one source texel away, rather than half a source texel' );
					assert.ok( Math.abs( data[ i ] - 4 ) < 0.01, 'Filtering coverage preserves unweighted radiance' );

				} );

			} );

			QUnit.test( 'half-resolution filtering reconstructs guides at their depth texel centers', async assert => {

				await fixture( assert, async ( { node, input, depth, normal, render } ) => {

					const half = size / 2;
					input.image = { width: half, height: half, data: new Float32Array( half * half * 4 ) };
					for ( let y = 0; y < half; y ++ ) {

						for ( let x = 0; x < half; x ++ ) input.image.data.set( [ 4, 2, 1, x === half / 2 ? 1 : 0 ], 4 * ( x + half * y ) );

					}

					// Exact tilted plane: n=(0.8,0,0.6), dot(n,p)=-0.6.
					// Sampling depth at one texel but reconstructing its position at an
					// adjacent coordinate falsely breaks this plane at half resolution.
					const tanHalfFov = Math.tan( 25 * Math.PI / 180 );
					for ( let y = 0; y < size; y ++ ) {

						for ( let x = 0; x < size; x ++ ) {

							const rayX = ( 2 * ( x + 0.5 ) / size - 1 ) * tanHalfFov;
							const distance = 0.6 / ( 0.6 - 0.8 * rayX );
							const i = 4 * ( x + size * y );
							depth.image.data[ i ] = 100 / 99.9 - 10 / ( 99.9 * distance );
							normal.image.data.set( [ 0.9, 0.5, 0.8, 1 ], i );

						}

					}

					input.needsUpdate = depth.needsUpdate = normal.needsUpdate = true;
					node.depthThreshold.value = 0.0001;
					const data = await render();
					const i = 4 * ( size / 2 + size * size / 2 );
					const expected = 1 / ( 1 + 2 * Math.exp( - 0.5 ) );
					assert.ok( Math.abs( data[ i + 3 ] - expected ) < 0.002, `A coplanar source neighborhood keeps the Gaussian coverage weights; actual=${ data[ i + 3 ] }, expected=${ expected }` );
					assert.ok( Math.abs( data[ i ] - 4 ) < 0.01, 'Tilted surfaces retain their valid source irradiance' );

				} );

			} );

			QUnit.test( 'grazing coplanar history survives fractional reprojection', async assert => {

				await fixture( assert, async ( { node, renderer, depth, normal, velocity, update, render } ) => {

					node.hitDistanceNode = null;
					node.radius.value = 0;
					const tanHalfFov = Math.tan( 25 * Math.PI / 180 );
					for ( let y = 0; y < size; y ++ ) {

						for ( let x = 0; x < size; x ++ ) {

							// All pixels lie on dot((0.8,0,0.6),p)=-0.6, but adjacent
							// depths differ by much more than the 1% history threshold.
							const rayX = ( 2 * ( x + 0.5 ) / size - 1 ) * tanHalfFov;
							const distance = 0.6 / ( 0.6 - 0.8 * rayX );
							const i = 4 * ( x + size * y );
							depth.image.data[ i ] = 100 / 99.9 - 10 / ( 99.9 * distance );
							normal.image.data.set( [ 0.9, 0.5, 0.8, 1 ], i );

						}

					}

					depth.needsUpdate = normal.needsUpdate = true;
					update( () => [ 4, 2, 1, 1 ] );
					for ( let frame = 0; frame < 16; frame ++ ) await render();
					for ( let i = 0; i < velocity.image.data.length; i += 4 ) velocity.image.data[ i ] = 1 / size;
					velocity.needsUpdate = true;
					await render();
					const data = await renderer.readRenderTargetPixelsAsync( node.getRenderTarget(), 8, 8, 1, 1, 2 );
					const age = data[ 0 ];
					assert.ok( Math.abs( age - 16 ) < 0.02, `Both coplanar history taps retain their evidence; actual age=${ age }` );

				} );

			} );

			QUnit.test( 'history clipping covers neighboring input texels at half resolution', async assert => {

				await fixture( assert, async ( { node, input, render } ) => {

					const half = size / 2;
					input.image = { width: half, height: half, data: new Float32Array( half * half * 4 ) };
					const updateStripe = column => {

						for ( let y = 0; y < half; y ++ ) {

							for ( let x = 0; x < half; x ++ ) input.image.data.set( [ 4, 2, 1, x === column ? 1 : 0 ], 4 * ( x + half * y ) );

						}

						input.needsUpdate = true;

					};

					node.radius.value = 0;
					updateStripe( half / 2 );
					await render();
					updateStripe( half / 2 + 1 );
					const data = await render();
					const i = 4 * ( size / 2 + size * size / 2 );
					assert.ok( Math.abs( data[ i + 3 ] - 0.5 ) < 0.002, 'A neighboring source hit allows valid history to accumulate instead of clipping it to zero' );
					assert.ok( Math.abs( data[ i ] - 4 ) < 0.01, 'Temporal filtering retains matching radiance and coverage weights' );

				} );

			} );

			QUnit.test( 'valid black and fractional coverage survive normalization', async assert => {

				await fixture( assert, async ( { update, render } ) => {

					update( () => [ 0, 0, 0, 0.25 ] );
					const black = await render();
					assert.ok( black.every( ( v, i ) => Math.abs( v - ( i % 4 === 3 ? 0.25 : 0 ) ) < 0.001 ), 'Black reflections consume their coverage' );
					update( () => [ 8, 4, 2, 0.25 ] );
					const hdr = await render();
					const expected = [ 8, 4, 2, 0.25 ];
					assert.ok( hdr.every( ( v, i ) => Math.abs( v - expected[ i % 4 ] ) < 0.01 ), 'Fractional coverage does not attenuate unweighted radiance' );

				} );

			} );

			QUnit.test( 'fallback resolves after filtering without contaminating SSR history', async assert => {

				await fixture( assert, async ( { node, update, render, compose } ) => {

					update( () => [ 0, 0, 0, 0.25 ] );
					const fallback = [ () => vec4( 0, 4, 0, 0.25 ), () => vec4( 0, 0, 2, 1 ) ];
					const resolved = await compose( fallback );
					assert.ok( resolved.every( ( v, i ) => Math.abs( v - [ 0, 0.75, 1.125, 1 ][ i ] ) < 0.001 ), 'Probe and environment consume only remaining coverage, once each' );
					const ssr = await render();
					assert.ok( ssr.every( ( v, i ) => Math.abs( v - ( i % 4 === 3 ? 0.25 : 0 ) ) < 0.001 ), 'Colored fallback never enters filtered SSR or its history' );
					update( () => [ 0, 0, 0, 1 ] );
					node.reset();
					assert.deepEqual( await compose( fallback ), [ 0, 0, 0, 1 ], 'Fully covered black prevents all fallback lighting' );
					update( () => [ 0, 0, 0, 0 ] );
					node.reset();
					const missed = await compose( fallback );
					assert.ok( missed.every( ( v, i ) => Math.abs( v - [ 0, 1, 1.5, 1 ][ i ] ) < 0.001 ), 'A complete miss falls through the ordered fallback chain' );

				} );

			} );

			QUnit.test( 'all misses stay finite and reset removes old reflections', async assert => {

				await fixture( assert, async ( { node, update, render } ) => {

					update( () => [ 4, 2, 1, 1 ] );
					await render();
					update( () => [ 100, 50, 25, 0 ] );
					node.reset();
					const data = await render();
					assert.ok( data.every( v => v === 0 ), 'No hit means zero radiance and coverage, including after a bright history' );

				} );

			} );

			QUnit.test( 'temporal filtering uses matching weights for radiance and coverage', async assert => {

				await fixture( assert, async ( { node, update, render } ) => {

					node.radius.value = 0;
					update( x => [ 4, 2, 1, x % 2 ] );
					await render();
					update( x => [ 4, 2, 1, 1 - x % 2 ] );
					const data = await render();
					assert.ok( data.every( ( v, i ) => Math.abs( v - [ 4, 2, 1, 0.5 ][ i % 4 ] ) < 0.01 ), 'Alternating hits converge to half coverage with unchanged lighting' );

				} );

			} );

			for ( const [ dx, dy ] of [[ 1, 0 ], [ - 1, 0 ], [ 0, 1 ], [ 0, - 1 ]] ) {

				QUnit.test( `NDC velocity reprojects history by (${ dx }, ${ dy }) UV pixels`, async assert => {

					await fixture( assert, async ( { node, velocity, update, render } ) => {

						node.radius.value = 0;
						// Exercise surface motion alone; specular virtual motion is a separate estimate.
						node.hitDistanceNode = null;
						const center = size / 2;
						const stripe = ( x, y, offset ) => ( dx !== 0 ? x === center + dx * offset : y === center + dy * offset );
						update( ( x, y ) => [ 4, 2, 1, stripe( x, y, - 1 ) ? 1 : 0 ] );
						await render();
						for ( let i = 0; i < velocity.image.data.length; i += 4 ) {

							velocity.image.data.set( [ 2 * dx / size, - 2 * dy / size, 0, 0 ], i );

						}

						velocity.needsUpdate = true;
						// A neighboring current hit keeps history inside the clipping bounds.
						update( ( x, y ) => [ 4, 2, 1, stripe( x, y, 1 ) ? 1 : 0 ] );
						const data = await render();
						const i = 4 * ( center + size * center );
						assert.ok( Math.abs( data[ i + 3 ] - 0.5 ) < 0.002, 'The previous hit moves exactly one pixel in the expected direction' );
						assert.ok( Math.abs( data[ i ] - 4 ) < 0.01, 'Reprojected radiance retains its coverage weighting' );

					} );

				} );

			}

			for ( const axis of [ 'x', 'y', 'jitter' ] ) {

				QUnit.test( `${ axis } reprojection uses the previous raster grid`, async assert => {

					await fixture( assert, async ( { node, camera, velocity, update, render } ) => {

						node.radius.value = 0;
						node.hitDistanceNode = null;
						const component = axis === 'y' ? 1 : 0;
						update( ( x, y ) => [ 4, 2, 1, ( component === 0 ? x : y ) % 3 === 1 ? 1 : 0 ] );
						await render();
						if ( axis === 'jitter' ) {

							// A one-pixel raster shift with zero physical motion. Lighting
							// history moves with jitter even though the AA history does not.
							node._velocityNode = { projectionMatrix: camera.projectionMatrix.clone() };
							camera.projectionMatrix.premultiply( new Matrix4().makeTranslation( 2 / size, 0, 0 ) );
							camera.projectionMatrixInverse.copy( camera.projectionMatrix ).invert();

						} else {

							for ( let i = 0; i < velocity.image.data.length; i += 4 ) velocity.image.data[ i + component ] = ( axis === 'y' ? - 2 : 2 ) / size;
							velocity.needsUpdate = true;

						}

						update( ( x, y ) => [ 4, 2, 1, x === 8 && y === 8 ? 0.25 : ( x + y ) % 2 ] );
						const data = await render();
						const i = 4 * ( 8 + size * 8 );
						assert.ok( Math.abs( data[ i + 3 ] - 0.625 ) < 0.002, 'Center blends current coverage 0.25 with previous texel coverage 1' );
						assert.ok( Math.abs( data[ i ] - 4 ) < 0.01, 'Radiance stays normalized during reprojection' );

					} );

				} );

			}

			for ( const guide of [ 'depth', 'normal', 'velocity' ] ) {

				QUnit.test( `${ guide } rejects disoccluded or off-screen history`, async assert => {

					await fixture( assert, async ( { node, depth, normal, velocity, update, render } ) => {

						node.radius.value = 0;
						update( x => [ 4, 2, 1, x % 2 ] );
						await render();
						const buffer = { depth, normal, velocity }[ guide ];
						const value = { depth: [ 0.8, 0, 0, 0 ], normal: [ 0.5, 0.5, 0, 1 ], velocity: [ 2, 0, 0, 0 ] }[ guide ];
						for ( let i = 0; i < buffer.image.data.length; i += 4 ) buffer.image.data.set( value, i );
						buffer.needsUpdate = true;
						update( x => [ 4, 2, 1, 1 - x % 2 ] );
						const data = await render();
						assert.ok( data.every( ( v, i ) => {

							const coverage = 1 - Math.floor( i / 4 ) % size % 2;
							return Math.abs( v - ( i % 4 === 3 ? coverage : coverage * [ 4, 2, 1 ][ i % 4 ] ) ) < 0.01;

						} ), 'Rejected history does not retain old coverage or radiance' );

					} );

				} );

			}

			QUnit.test( 'resize restarts temporal accumulation', async assert => {

				await fixture( assert, async ( { node, renderer, update, render } ) => {

					update( () => [ 8, 4, 2, 1 ] );
					await render();
					renderer.setSize( 8, 8 );
					update( () => [ 0, 0, 0, 0 ] );
					const data = await render();
					assert.strictEqual( node.getRenderTarget().width, 8, 'Output follows the drawing buffer' );
					assert.ok( data.every( v => v === 0 ), 'Resized buffers do not reuse stale reflections' );

				} );

			} );

			QUnit.test( 'normal boundaries prevent spatial color leaks', async assert => {

				await fixture( assert, async ( { node, normal, update, render } ) => {

					for ( let y = 0; y < size; y ++ ) {

						for ( let x = size / 2; x < size; x ++ ) normal.image.data.set( [ 1, 0.5, 0.5, 1 ], 4 * ( x + size * y ) );

					}

					normal.needsUpdate = true;
					update( x => x < size / 2 ? [ 4, 0, 0, 1 ] : [ 0, 0, 4, 1 ] );
					const data = await render();
					assert.ok( data.every( ( v, i ) => Math.abs( v - ( ( Math.floor( i / 4 ) % size < size / 2 ? [ 4, 0, 0, 1 ] : [ 0, 0, 4, 1 ] )[ i % 4 ] ) ) < 0.01 ), 'Perpendicular surfaces retain separate radiance' );
					node.reset();

				} );

			} );

		} );

	} );

} );
