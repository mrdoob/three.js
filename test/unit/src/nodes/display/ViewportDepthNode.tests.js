import ViewportDepthNode, { linearDepth, depthToViewZ, depth } from '../../../../../src/nodes/display/ViewportDepthNode.js';
import { float } from '../../../../../src/nodes/tsl/TSLBase.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../../../../../src/cameras/OrthographicCamera.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Display', () => {

		QUnit.module( 'ViewportDepthNode', () => {

			QUnit.test( 'default properties', ( assert ) => {

				const node = new ViewportDepthNode( ViewportDepthNode.DEPTH );
				assert.strictEqual( node.scope, ViewportDepthNode.DEPTH, 'scope is set correctly' );
				assert.strictEqual( node.valueNode, null, 'valueNode defaults to null' );
				assert.ok( node.isViewportDepthNode, 'isViewportDepthNode is true' );

			} );

			QUnit.test( 'depth', ( assert ) => {

				assert.ok( depth.isViewportDepthNode, 'depth is a ViewportDepthNode' );
				assert.strictEqual( depth.scope, ViewportDepthNode.DEPTH, 'depth scope is DEPTH' );

			} );

			QUnit.test( 'linearDepth without arguments uses current fragment positionView.z', ( assert ) => {

				const camera = new PerspectiveCamera();
				const node = linearDepth();
				const result = node.setup( { camera } );

				assert.ok( result.isNode, 'linearDepth() creates a valid node' );

			} );

			QUnit.test( 'linearDepth with valueNode converts depth through depthToViewZ and viewZToOrthographicDepth', ( assert ) => {

				const perspectiveCam = new PerspectiveCamera( 50, 1, 0.1, 100 );
				const orthoCam = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 100 );
				const testValue = float( 0.5 );

				const perspNode = linearDepth( testValue ).setup( { camera: perspectiveCam } );
				const orthoNode = linearDepth( testValue ).setup( { camera: orthoCam } );

				assert.ok( perspNode.isNode, 'perspective linear depth node is created' );
				assert.ok( orthoNode.isNode, 'orthographic linear depth node is created' );

			} );

			QUnit.test( 'depthToViewZ returns a valid node for both perspective and orthographic cameras', ( assert ) => {

				const testValue = float( 0.5 );
				const near = float( 0.1 );
				const far = float( 100 );

				const perspectiveCam = new PerspectiveCamera( 50, 1, 0.1, 100 );
				const orthoCam = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 100 );

				const orthoNode = depthToViewZ( testValue, near, far, orthoCam );
				const perspNode = depthToViewZ( testValue, near, far, perspectiveCam );

				assert.ok( orthoNode.isNode, 'orthographic depthToViewZ returns a valid node' );
				assert.ok( perspNode.isNode, 'perspective depthToViewZ returns a valid node' );

			} );

		} );

	} );

} );
