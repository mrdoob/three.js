import {
	DataTexture, EquirectangularReflectionMapping, LinearSRGBColorSpace,
	Mesh, MeshStandardMaterial, MeshPhysicalMaterial, OrthographicCamera,
	RenderTarget, Scene, SphereGeometry
} from '../../../../../src/Three.Core.js';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { texture } from 'three/tsl';
import { getSharedRenderer } from '../tsl/gpu-test-utils.js';

function createEnvironment( red, blue, width ) {

	const height = width / 2;
	const data = new Uint8Array( width * height * 4 );

	for ( let i = 0; i < data.length; i += 4 ) {

		data[ i ] = red;
		data[ i + 2 ] = blue;
		data[ i + 3 ] = 255;

	}

	const texture = new DataTexture( data, width, height );
	texture.mapping = EquirectangularReflectionMapping;
	texture.needsUpdate = true;

	return texture;

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'EnvironmentNode', () => {

			for ( const backend of [ 'webgpu', 'webgl' ] ) {

				for ( const Material of [ MeshStandardMaterial, MeshPhysicalMaterial ] ) {

					QUnit.test( `${ Material.name } follows each material's envMap (${ backend })`, async ( assert ) => {

						const renderer = await getSharedRenderer( backend );

						if ( renderer === null ) {

							assert.ok( true, `SKIPPED: "${ backend }" backend is not available in this environment.` );
							return;

						}

						const red = createEnvironment( 255, 0, 32 );
						const blue = createEnvironment( 0, 255, 64 );
						const geometry = new SphereGeometry( 0.8, 16, 8 );
						const scene = new Scene();
						const camera = new OrthographicCamera( - 3, 3, 1, - 1, 0.1, 10 );
						camera.position.z = 5;

						const materials = [ red, blue, red ].map( ( envMap ) => new Material( { envMap, metalness: 1, roughness: 0.15 } ) );

						for ( let i = 0; i < materials.length; i ++ ) {

							const mesh = new Mesh( geometry, materials[ i ] );
							mesh.position.x = ( i - 1 ) * 2;
							scene.add( mesh );

						}

						const target = new RenderTarget( 96, 32 );
						target.texture.colorSpace = LinearSRGBColorSpace;
						const previousTarget = renderer.getRenderTarget();

						async function checkColors( channels ) {

							renderer.setRenderTarget( target );
							renderer.render( scene, camera );

							for ( let i = 0; i < channels.length; i ++ ) {

								const pixel = await renderer.readRenderTargetPixelsAsync( target, 16 + i * 32, 16, 1, 1 );
								const channel = channels[ i ];
								assert.true( pixel[ channel ] > 50 && pixel[ 2 - channel ] < 5, `Sphere ${ i } reflects ${ channel === 0 ? 'red' : 'blue' }: ${ Array.from( pixel ) }` );

							}

						}

						try {

							await checkColors( [ 0, 2, 0 ] );

							const programs = renderer.info.memory.programs;

							materials[ 2 ].envMap = blue;
							await checkColors( [ 0, 2, 2 ] );

							materials[ 2 ].envMap = red;
							await checkColors( [ 0, 2, 0 ] );

							assert.strictEqual( renderer.info.memory.programs, programs, 'Switching environments reuses the existing shaders' );

							materials[ 2 ].envMap = null;
							renderer.render( scene, camera );
							assert.ok( true, 'Removing an envMap without needsUpdate does not throw' );

						} finally {

							renderer.setRenderTarget( previousTarget );
							for ( const material of materials ) material.dispose();
							geometry.dispose();
							target.dispose();
							red.dispose();
							blue.dispose();

						}

					} );

				}

				QUnit.test( `Follows changes of an environment texture node (${ backend })`, async ( assert ) => {

					const renderer = await getSharedRenderer( backend );

					if ( renderer === null ) {

						assert.ok( true, `SKIPPED: "${ backend }" backend is not available in this environment.` );
						return;

					}

					const red = createEnvironment( 255, 0, 32 );
					const blue = createEnvironment( 0, 255, 64 );
					const geometry = new SphereGeometry( 0.8, 16, 8 );
					const envNode = texture( red );
					const material = new MeshStandardNodeMaterial( { metalness: 1, roughness: 0.15 } );
					material.envNode = envNode;

					const scene = new Scene();
					scene.add( new Mesh( geometry, material ) );

					const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
					camera.position.z = 5;

					const target = new RenderTarget( 32, 32 );
					target.texture.colorSpace = LinearSRGBColorSpace;
					const previousTarget = renderer.getRenderTarget();

					async function checkColor( channel ) {

						renderer.setRenderTarget( target );
						renderer.render( scene, camera );

						const pixel = await renderer.readRenderTargetPixelsAsync( target, 16, 16, 1, 1 );
						assert.true( pixel[ channel ] > 50 && pixel[ 2 - channel ] < 5, `Sphere reflects ${ channel === 0 ? 'red' : 'blue' }: ${ Array.from( pixel ) }` );

					}

					try {

						await checkColor( 0 );

						envNode.value = blue;
						await checkColor( 2 );

					} finally {

						renderer.setRenderTarget( previousTarget );
						material.dispose();
						geometry.dispose();
						target.dispose();
						red.dispose();
						blue.dispose();

					}

				} );

			}

		} );

	} );

} );
