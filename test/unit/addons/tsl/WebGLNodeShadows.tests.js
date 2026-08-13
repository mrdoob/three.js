import {
	BoxGeometry,
	Mesh,
	PerspectiveCamera,
	PointLight,
	Scene,
	WebGLRenderer,
} from 'three';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { WebGLNodesHandler } from '../../../../examples/jsm/tsl/WebGLNodesHandler.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'WebGL node shadows', () => {

			QUnit.test( 'compile prepares shadows without rendering them', ( assert ) => {

				const renderer = new WebGLRenderer();
				renderer.setNodesHandler( new WebGLNodesHandler() );
				renderer.shadowMap.enabled = true;
				renderer.shadowMap.autoUpdate = false;
				renderer.setSize( 16, 16, false );

				const scene = new Scene();
				const camera = new PerspectiveCamera( 50, 1, 0.1, 10 );
				camera.position.z = 3;

				const geometry = new BoxGeometry();
				const material = new MeshStandardNodeMaterial();
				const mesh = new Mesh( geometry, material );
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				mesh.frustumCulled = false;
				scene.add( mesh );

				const light = new PointLight();
				light.position.set( 2, 2, 2 );
				light.castShadow = true;
				light.shadow.mapSize.set( 16, 16 );
				scene.add( light );
				scene.updateMatrixWorld( true );
				camera.updateMatrixWorld();

				let shadowDraws = 0;
				const renderBufferDirect = renderer.renderBufferDirect;
				renderer.renderBufferDirect = function ( renderCamera, ...args ) {

					if ( renderCamera !== camera ) shadowDraws ++;
					return renderBufferDirect.call( this, renderCamera, ...args );

				};

				const materials = renderer.compile( scene, camera );

				assert.true( materials.has( material ), 'compiles the node material' );
				assert.notStrictEqual( light.shadow.map, null, 'allocates the shadow map required by the node shader' );
				assert.strictEqual( shadowDraws, 0, 'does not render shadow faces during compilation' );

				renderer.shadowMap.needsUpdate = true;
				renderer.render( scene, camera );

				assert.strictEqual( shadowDraws, 6, 'renders all point-light shadow faces on the first real render' );

				geometry.dispose();
				material.dispose();
				light.shadow.dispose();
				renderer.dispose();

			} );

		} );

	} );

} );
