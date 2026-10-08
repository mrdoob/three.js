import {
	DataTexture, DirectionalLight, Mesh, MeshStandardMaterial, OrthographicCamera,
	PlaneGeometry, Scene, WebGLRenderer, WebGLRenderTarget
} from 'three';

export default QUnit.module( 'Postprocessing', () => {

	QUnit.test( 'screen-space radiance and AO compose inside the BRDF', assert => {

		const canvas = document.createElement( 'canvas' );
		const context = canvas.getContext( 'webgl2' );
		if ( context === null ) {

			assert.ok( true, 'SKIPPED: WebGL2 unavailable' );
			return;

		}

		const renderer = new WebGLRenderer( { canvas, context } );
		const target = new WebGLRenderTarget( 4, 4 );
		const scene = new Scene();
		const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
		camera.position.z = 2;
		const geometry = new PlaneGeometry( 2, 2 );
		const material = new MeshStandardMaterial( { metalness: 1, roughness: 0.5 } );
		scene.add( new Mesh( geometry, material ) );
		const radiance = new DataTexture( new Uint8Array( 4 * 4 * 4 ).fill( 255 ), 4, 4 );
		const visibility = new DataTexture( new Uint8Array( 4 * 4 * 4 ), 4, 4 );
		radiance.needsUpdate = visibility.needsUpdate = true;
		const pixel = new Uint8Array( 4 );
		const render = () => {

			renderer.setRenderTarget( target );
			renderer.render( scene, camera );
			renderer.readRenderTargetPixels( target, 2, 2, 1, 1, pixel );
			return pixel[ 0 ];

		};

		try {

			scene.indirectSpecularMap = radiance;
			const unoccluded = render();
			assert.ok( unoccluded > 10, 'Screen-space radiance lights the BRDF without an environment' );
			scene.ambientOcclusionMap = visibility;
			assert.strictEqual( render(), 0, 'Screen-space AO occludes the incoming specular radiance' );
			const light = new DirectionalLight( 0xffffff, 3 );
			light.position.set( 0, 0, 2 );
			scene.add( light );
			assert.ok( render() > 10, 'Direct lighting survives full ambient occlusion' );
			scene.ambientOcclusionMap = null;
			assert.ok( render() > unoccluded, 'Removing AO restores indirect lighting alongside direct lighting' );
			assert.strictEqual( context.getError(), context.NO_ERROR, 'No WebGL errors' );

		} finally {

			radiance.dispose();
			visibility.dispose();
			geometry.dispose();
			material.dispose();
			target.dispose();
			renderer.dispose();

		}

	} );

} );
