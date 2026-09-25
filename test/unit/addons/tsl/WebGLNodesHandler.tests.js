import {
	AmbientLight,
	PerspectiveCamera,
	PointLight,
	Scene,
} from 'three';
import { WebGLNodesHandler } from '../../../../examples/jsm/tsl/WebGLNodesHandler.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'WebGLNodesHandler', () => {

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
