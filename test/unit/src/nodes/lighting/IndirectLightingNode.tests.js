import { FloatType, Mesh, MeshStandardNodeMaterial, NodeMaterial, OrthographicCamera, PlaneGeometry, RenderTarget, Scene } from 'three/webgpu';
import { context, float, indirectSpecular, uniform, vec3, vec4 } from 'three/tsl';
import { getSharedRenderer } from '../tsl/gpu-test-utils.js';

// These tests render and read back actual shader results. Do not accept a
// software adapter as evidence for lighting correctness.
async function hardwareRenderer( assert ) {

	const adapter = await navigator.gpu?.requestAdapter();
	const info = adapter?.info;
	if ( ! info || info.isFallbackAdapter || /swiftshader|llvmpipe|lavapipe|software/i.test( `${ info.vendor } ${ info.device } ${ info.description }` ) ) {

		assert.ok( true, 'SKIPPED: a hardware WebGPU adapter is required.' );
		return null;

	}

	return getSharedRenderer( 'webgpu' );

}

function fixture( renderer ) {

	const previousContext = renderer.contextNode;
	const previousTarget = renderer.getRenderTarget();
	const scene = new Scene();
	const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
	camera.position.z = 2;
	const geometry = new PlaneGeometry( 2, 2 );
	geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
	const mesh = new Mesh( geometry );
	scene.add( mesh );
	const target = new RenderTarget( 16, 16, { type: FloatType } );

	return {
		async draw( material, lighting = context() ) {

			mesh.material = material;
			renderer.contextNode = lighting;
			renderer.setRenderTarget( target );
			renderer.render( scene, camera );
			return Array.from( await renderer.readRenderTargetPixelsAsync( target, 8, 8, 1, 1 ) );

		},
		dispose() {

			renderer.contextNode = previousContext;
			renderer.setRenderTarget( previousTarget );
			geometry.dispose();
			target.dispose();

		}
	};

}

function close( assert, actual, expected, message ) {

	assert.ok( expected.every( ( value, i ) => Math.abs( value - actual[ i ] ) < 1e-4 ), `${ message }: ${ actual }` );

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'IndirectLightingNode', () => {

			QUnit.test( 'Coverage composition, darkness, missing data, nesting and specular queries', async assert => {

				const renderer = await hardwareRenderer( assert );
				if ( ! renderer ) return;
				const view = fixture( renderer );
				const material = new NodeMaterial();
				const query = { position: vec3( 0 ), normal: vec3( 0, 1, 0 ) };
				const cases = [
					[ 'Remaining coverage', indirectSpecular( [ () => vec4( 1, 0, 0, 0.8 ), () => vec4( 0, 1, 0, 0.5 ), () => vec4( 0, 0, 1, 1 ) ] ), [ 0.8, 0.1, 0.1, 1 ]],
					[ 'Valid black consumes coverage', indirectSpecular( [ () => vec4( 0, 0, 0, 1 ), () => vec4( 100, 100, 100, 1 ) ] ), [ 0, 0, 0, 1 ]],
					[ 'Missing data permits fallback', indirectSpecular( [ () => vec4( 100, 0, 0, 0 ), () => vec4( 0, 1, 0, 1 ) ] ), [ 0, 1, 0, 1 ]],
					[ 'Unresolved coverage remains black', indirectSpecular( [] ), [ 0, 0, 0, 0 ]],
					[ 'Coverage is clamped', indirectSpecular( [ () => vec4( 100, 0, 0, - 1 ), () => vec4( 0, 1, 0, 2 ) ] ), [ 0, 1, 0, 1 ]],
					[ 'Nested coverage is applied once', indirectSpecular( [ indirectSpecular( [ () => vec4( 1, 0, 0, 0.5 ) ] ).asProvider(), () => vec4( 0, 0, 1, 1 ) ] ), [ 0.5, 0, 0.5, 1 ]]
				];

				try {

					for ( const [ name, chain, expected ] of cases ) {

						material.fragmentNode = chain.sample( query );
						material.needsUpdate = true;
						close( assert, await view.draw( material ), expected, name );

					}

					const specular = indirectSpecular( [ q => vec4( q.direction.mul( q.roughness ), 1 ) ] );
					material.fragmentNode = specular.sample( { ...query, viewDirection: vec3( 0, 1, 0 ), roughness: float( 0.5 ) } );
					material.needsUpdate = true;
					close( assert, await view.draw( material ), [ 0, 0.5, 0, 1 ], 'Specular query uses view direction and roughness' );

				} finally {

					material.dispose();
					view.dispose();

				}

			} );

			QUnit.test( 'Physical materials resolve once without a scene environment and observe uniform changes', async assert => {

				const renderer = await hardwareRenderer( assert );
				if ( ! renderer ) return;
				const view = fixture( renderer );
				const material = new MeshStandardNodeMaterial( { metalness: 1, roughness: 0.35 } );
				const coverage = uniform( 1 );
				const intensity = uniform( 2 );
				const chain = indirectSpecular( [ () => vec4( vec3( intensity, 0, 0 ), coverage ), () => vec4( 0, 0, 2, 1 ) ] );
				const lighting = context( { indirectSpecularNode: chain } );

				try {

					const red = await view.draw( material, lighting );
					assert.ok( red[ 0 ] > 1 && red[ 2 ] === 0, 'HDR provider lights a metal without scene.environment' );
					coverage.value = 0;
					const blue = await view.draw( material, lighting );
					assert.ok( blue[ 2 ] > 1 && blue[ 0 ] === 0, 'Zero coverage falls back' );
					coverage.value = 0.5;
					const partial = await view.draw( material, lighting );
					assert.ok( Math.abs( partial[ 0 ] - red[ 0 ] * 0.5 ) < 1e-4 && Math.abs( partial[ 2 ] - blue[ 2 ] * 0.5 ) < 1e-4, 'Fractional coverage replaces the remaining lighting exactly once' );
					intensity.value = 0;
					coverage.value = 1;
					close( assert, await view.draw( material, lighting ), [ 0, 0, 0, 1 ], 'Zero intensity retains coverage and blocks fallback' );

				} finally {

					material.dispose();
					view.dispose();

				}

			} );

		} );

	} );

} );
