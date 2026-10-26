import { DataTexture, FloatType, NodeMaterial, PerspectiveCamera, QuadMesh, RenderTarget, RendererUtils, Vector2, Vector3 } from 'three/webgpu';
import { context, float, reflect, sample, texture, vec3, vec4 } from 'three/tsl';
import { ao, specularOcclusion } from '../../../../examples/jsm/tsl/display/GTAONode.js';
import { getSharedRenderer } from '../../src/nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'GTAONode', () => {

			QUnit.test( 'half-resolution unoccluded geometry preserves grazing reflections on finer surface normals', async assert => {

				const renderer = await getSharedRenderer( 'webgpu' );
				if ( ! renderer ) {

					assert.ok( true, 'SKIPPED: WebGPU unavailable' );
					return;

				}

				const state = RendererUtils.saveRendererState( renderer );
				const oldContext = renderer.contextNode;
				const oldSize = renderer.getSize( new Vector2() );
				const oldRatio = renderer.getPixelRatio();
				const size = 32;
				const data = new Float32Array( size * size * 4 );
				for ( let i = 0; i < data.length; i += 4 ) data[ i ] = 0.5;
				const depth = new DataTexture( data, size, size );
				depth.type = FloatType;
				depth.needsUpdate = true;
				const camera = new PerspectiveCamera( 50, 1, 0.1, 100 );
				camera.coordinateSystem = renderer.coordinateSystem;
				camera.updateProjectionMatrix();
				camera.updateMatrixWorld();
				const node = ao( texture( depth ), sample( () => vec3( 0, 0, 1 ) ), camera );
				node.resolutionScale = 0.5;
				node.useTemporalFiltering = true;
				const target = new RenderTarget( size, size, { type: FloatType, depthBuffer: false } );
				const material = new NodeMaterial();
				const quad = new QuadMesh( material );
				try {

					renderer.setPixelRatio( 1 );
					renderer.setSize( size, size );
					renderer.contextNode = context();
					for ( const direction of [[ 0, 0, 1 ], [ 0.995, 0, 0.1 ], [ 0, 0.995, 0.1 ]] ) {

						// Fine normal-map details may be absent from the coarse AO grid.
						// An unoccluded guide must not replace the receiving surface normal.
						const normal = vec3( new Vector3( ...direction ).normalize() );
						const bentNormal = node.getBentNormalNode( undefined, normal );
						const visibility = specularOcclusion( node.getTextureNode().r, bentNormal, normal, reflect( vec3( 0, 0, - 1 ), normal ), float( 0.1 ) );
						material.fragmentNode = vec4( bentNormal.dot( normal ), visibility, node.getTextureNode().r, 1 );
						material.needsUpdate = true;
						for ( let frame = 0; frame < 4; frame ++ ) {

							await new Promise( resolve => requestAnimationFrame( resolve ) );
							renderer.setRenderTarget( target );
							quad.render( renderer );
							const values = await renderer.readRenderTargetPixelsAsync( target, size / 2, size / 2, 1, 1 );
							assert.ok( values.slice( 0, 3 ).every( value => Math.abs( value - 1 ) < 0.01 ), `Unoccluded surface keeps its normal, specular visibility and diffuse visibility: ${ Array.from( values ) }` );

						}

					}

					// A real foreground occluder must still bend the normal away from it.
					for ( let y = 0; y < size; y ++ ) {

						for ( let x = 0; x < size; x ++ ) data[ 4 * ( x + size * y ) ] = x < size / 2 ? 0.2 : 0.5;

					}

					depth.needsUpdate = true;
					material.fragmentNode = vec4( node.getBentNormalNode().mul( 0.5 ).add( 0.5 ), node.getTextureNode().r );
					material.needsUpdate = true;
					await new Promise( resolve => requestAnimationFrame( resolve ) );
					renderer.setRenderTarget( target );
					quad.render( renderer );
					const occluded = await renderer.readRenderTargetPixelsAsync( target, size / 2 + 2, size / 2, 1, 1 );
					assert.ok( occluded[ 3 ] < 0.99, `Foreground geometry still occludes diffuse lighting: ${ occluded[ 3 ] }` );
					assert.ok( occluded[ 0 ] > 0.51, `The reconstructed bent normal points away from the foreground occluder: ${ occluded[ 0 ] }` );

				} finally {

					node.dispose();
					depth.dispose();
					material.dispose();
					target.dispose();
					renderer.contextNode = oldContext;
					renderer.setPixelRatio( oldRatio );
					renderer.setSize( oldSize.x, oldSize.y );
					RendererUtils.restoreRendererState( renderer, state );

				}

			} );

		} );

	} );

} );
