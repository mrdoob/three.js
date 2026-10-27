import VelocityNode from '../../../../../src/nodes/accessors/VelocityNode.js';
import { Object3D } from '../../../../../src/core/Object3D.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'VelocityNode', () => {

			QUnit.test( 'previous object transform is stable across passes', ( assert ) => {

				const node = new VelocityNode();
				const camera = new PerspectiveCamera();
				const object = new Object3D();
				const frame = { frameId: 1, camera, object };
				const previousX = () => node.previousModelWorldMatrix.value.elements[ 12 ];

				object.matrixWorld.makeTranslation( 3, 0, 0 );
				node.update( frame );
				assert.strictEqual( previousX(), 3, 'first appearance uses the current transform' );
				node.updateAfter( frame );

				frame.frameId ++;
				object.matrixWorld.makeTranslation( 5, 0, 0 );
				node.update( frame );
				assert.strictEqual( previousX(), 3, 'first pass retains the last frame transform' );
				node.updateAfter( frame );
				node.update( frame );
				assert.strictEqual( previousX(), 3, 'second pass retains the same last frame transform' );
				node.updateAfter( frame );

				frame.frameId ++;
				object.matrixWorld.makeTranslation( 8, 0, 0 );
				node.update( frame );
				assert.strictEqual( previousX(), 5, 'the next frame advances the saved transform' );
				node.updateAfter( frame );

				frame.frameId += 2;
				node.update( frame );
				assert.strictEqual( previousX(), 8, 'a stationary object and skipped frames retain the last rendered transform' );

			} );

		} );

	} );

} );
