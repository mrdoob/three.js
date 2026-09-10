import { CubeTexture, CubeRefractionMapping, Mesh, MeshBasicNodeMaterial, OrthographicCamera, PlaneGeometry, RenderTarget, Scene } from 'three/webgpu';
import { cubeTexture, vec3 } from 'three/tsl';
import { getSharedRenderer } from './gpu-test-utils.js';

function createCubeTexture() {

	const colors = [ '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff' ];

	const texture = new CubeTexture( colors.map( ( color ) => {

		const canvas = document.createElement( 'canvas' );
		canvas.width = canvas.height = 4;
		const context = canvas.getContext( '2d' );
		context.fillStyle = color;
		context.fillRect( 0, 0, 4, 4 );
		return canvas;

	} ) );

	texture.needsUpdate = true;
	return texture;

}

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'cube texture environment rotation', () => {

		for ( const backend of [ 'webgpu', 'webgl' ] ) {

			QUnit.test( `only environment sampling follows envMapRotation [${ backend }]`, async ( assert ) => {

				const renderer = await getSharedRenderer( backend );

				if ( renderer === null ) {

					assert.ok( true, `SKIPPED: "${ backend }" backend is not available in this environment.` );
					return;

				}

				const environment = createCubeTexture();
				const custom = createCubeTexture();
				const target = new RenderTarget( 8, 8 );
				const scene = new Scene();
				const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
				camera.position.z = 2;
				const geometry = new PlaneGeometry( 2, 2 );
				let material = new MeshBasicNodeMaterial( { envMap: environment } );
				const mesh = new Mesh( geometry, material );
				scene.add( mesh );
				const previousTarget = renderer.getRenderTarget();

				try {

					renderer.setRenderTarget( target );

					const sample = async ( angle ) => {

						material.envMapRotation.y = angle;
						renderer.render( scene, camera );
						return Array.from( await renderer.readRenderTargetPixelsAsync( target, 4, 4, 1, 1 ) );

					};

					material.reflectivity = 0;
					material.colorNode = cubeTexture( custom, vec3( 1, 0, 0 ) ).rgb;
					const explicit = await sample( 0 );
					assert.deepEqual( explicit, [ 0, 255, 0, 255 ], 'the fixed direction samples the green cube face' );
					assert.deepEqual( await sample( Math.PI / 2 ), explicit, 'an unrelated cube texture with explicit coordinates does not rotate' );

					material.colorNode = cubeTexture( custom ).rgb;
					material.needsUpdate = true;
					const implicit = await sample( 0 );
					assert.deepEqual( await sample( Math.PI / 2 ), implicit, 'an unrelated cube texture with default coordinates does not rotate' );

					material.colorNode = null;
					material.reflectivity = 1;
					material.needsUpdate = true;
					const reflection = await sample( 0 );
					assert.notDeepEqual( await sample( Math.PI / 2 ), reflection, 'the material environment reflection still rotates' );

					environment.mapping = CubeRefractionMapping;
					material.dispose();
					material = new MeshBasicNodeMaterial( { envMap: environment, reflectivity: 1 } );
					mesh.material = material;
					const refraction = await sample( 0 );
					assert.notDeepEqual( await sample( Math.PI / 2 ), refraction, 'the material environment refraction still rotates' );

				} finally {

					renderer.setRenderTarget( previousTarget );
					geometry.dispose();
					material.dispose();
					target.dispose();
					custom.dispose();
					environment.dispose();

				}

			} );

		}

	} );

} );
