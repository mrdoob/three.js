import {
	BoxGeometry,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from 'three';
import { color } from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';
import { WebGLNodesHandler } from '../../../../examples/jsm/tsl/WebGLNodesHandler.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'WebGLNodesHandler', () => {

			QUnit.test( 'compileAsync', async ( assert ) => {

				const renderer = new WebGLRenderer();
				const handler = new WebGLNodesHandler();
				renderer.setNodesHandler( handler );

				const material = new MeshStandardNodeMaterial();
				material.colorNode = color( 0x336699 );
				const mesh = new Mesh( new BoxGeometry(), material );
				const targetScene = new Scene();
				const camera = new PerspectiveCamera();

				const result = await renderer.compileAsync( mesh, camera, targetScene );

				assert.strictEqual( result, mesh, 'compiled the node material' );
				assert.strictEqual( handler.renderStack.length, 0, 'restored the node render stack' );

				mesh.geometry.dispose();
				material.dispose();
				renderer.dispose();

			} );

		} );

	} );

} );
