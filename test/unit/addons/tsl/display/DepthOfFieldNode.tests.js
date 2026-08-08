import { Texture } from 'three';
import { float, texture } from 'three/tsl';
import { dof } from '../../../../../examples/jsm/tsl/display/DepthOfFieldNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'Display', () => {

			QUnit.module( 'DepthOfFieldNode', () => {

				QUnit.test( 'reuses and disposes its Gaussian blur node', ( assert ) => {

					const node = dof( texture( new Texture() ), float( - 1 ) );
					const builder = { getSharedContext: () => ( {} ) };

					node.setup( builder );

					const blurNode = node._CoCBlurredMaterial.colorNode;
					let disposeCount = 0;

					blurNode._horizontalRT.addEventListener( 'dispose', () => disposeCount ++ );
					blurNode._verticalRT.addEventListener( 'dispose', () => disposeCount ++ );

					node.setup( builder );

					assert.strictEqual( node._CoCBlurredMaterial.colorNode, blurNode, 'reuses the blur node during setup' );

					node.dispose();

					assert.strictEqual( disposeCount, 2, 'disposes both blur render targets' );

				} );

			} );

		} );

	} );

} );
