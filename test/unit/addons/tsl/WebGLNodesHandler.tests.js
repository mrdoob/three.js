import {
	AmbientLight,
	ArrayCamera,
	PerspectiveCamera,
	PointLight,
	Scene,
} from 'three';
import { WebGLNodesHandler } from '../../../../examples/jsm/tsl/WebGLNodesHandler.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'WebGLNodesHandler', () => {

			QUnit.test( 'uses the camera for the current view', ( assert ) => {

				const handler = new WebGLNodesHandler();
				handler.setRenderer( {
					extensions: {},
					getContext: () => ( {} ),
				} );

				const scene = new Scene();
				const left = new PerspectiveCamera();
				const right = new PerspectiveCamera();
				const camera = new ArrayCamera( [ left, right ] );
				const nestedCamera = new PerspectiveCamera();
				const renderer = { info: { render: { frame: 0 } }, properties: new WeakMap() };
				const material = {};
				const object = { receiveShadow: false };

				handler.renderStart( scene, camera );
				assert.strictEqual( handler.nodeFrame.camera, left, 'uses a sub-camera before drawing' );

				handler.onBeforeRenderCallback.call( material, renderer, scene, right, null, object );
				assert.strictEqual( handler.nodeFrame.camera, right, 'updates nodes for the right view' );

				handler.renderStart( scene, nestedCamera );
				handler.renderEnd();
				assert.strictEqual( handler.nodeFrame.camera, right, 'restores the active view after a nested render' );

				handler.onBeforeRenderCallback.call( material, renderer, scene, left, null, object );
				assert.strictEqual( handler.nodeFrame.camera, left, 'updates nodes for the left view' );

				handler.renderEnd();

			} );


			QUnit.test( 'nested render lifecycle', ( assert ) => {

				const handler = new WebGLNodesHandler();
				handler.setRenderer( {
					extensions: {},
					getContext: () => ( {} ),
				} );
				assert.strictEqual( handler.nodeFrame.renderer, handler.renderer, 'initializes the renderer proxy' );

				const scene = new Scene();
				const outerCamera = new PerspectiveCamera();
				const nestedCamera = new PerspectiveCamera();
				const outerLight = new AmbientLight();
				const nestedLight = new PointLight();

				handler.renderStart( scene, outerCamera );
				handler.updateLights( [ outerLight ] );
				handler.renderStart( scene, nestedCamera );
				handler.updateLights( [ nestedLight ] );
				handler.renderEnd();

				const sceneContext = handler.renderStack[ 0 ].sceneContext;
				assert.deepEqual( sceneContext.lightsNode.getLights(), [ outerLight ], 'restores lights for the outer render' );
				assert.strictEqual( handler.nodeFrame.camera, outerCamera, 'restores the outer camera' );

				handler.renderEnd();
				assert.strictEqual( handler.renderStack.length, 0, 'balances the render stack' );

			} );

		} );

	} );

} );
