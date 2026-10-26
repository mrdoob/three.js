import { Object3D, PerspectiveCamera } from 'three';
import { velocity } from 'three/tsl';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'VelocityNode', () => {

			QUnit.test( 'previous transform is stable across passes', ( assert ) => {

				const node = new velocity.constructor();
				const object = new Object3D();
				const camera = new PerspectiveCamera();
				const frame = { object, camera, frameId: 1 };

				object.matrixWorld.makeTranslation( 7, 0, 0 );
				node.update( frame );
				assert.strictEqual( node.previousModelWorldMatrix.value.elements[ 12 ], 7, 'first render has no motion' );
				node.updateAfter( frame );

				frame.frameId = 2;
				object.matrixWorld.makeTranslation( 8, 0, 0 );
				node.update( frame );
				assert.strictEqual( node.previousModelWorldMatrix.value.elements[ 12 ], 7, 'first pass uses the previous frame' );
				node.updateAfter( frame );
				node.update( frame );
				assert.strictEqual( node.previousModelWorldMatrix.value.elements[ 12 ], 7, 'second pass retains object motion' );
				node.updateAfter( frame );

				frame.frameId = 5;
				object.matrixWorld.makeTranslation( 9, 0, 0 );
				node.update( frame );
				assert.strictEqual( node.previousModelWorldMatrix.value.elements[ 12 ], 8, 'a later frame uses the last rendered transform' );

			} );

			QUnit.test( 'velocity nodes share a stable previous transform', ( assert ) => {

				const first = new velocity.constructor();
				const second = new velocity.constructor();
				const object = new Object3D();
				const camera = new PerspectiveCamera();
				const frame = { object, camera, frameId: 1 };

				first.update( frame );
				first.updateAfter( frame );
				frame.frameId = 2;
				object.matrixWorld.makeTranslation( 1, 0, 0 );
				first.update( frame );
				first.updateAfter( frame );
				second.update( frame );
				assert.strictEqual( second.previousModelWorldMatrix.value.elements[ 12 ], 0, 'another node sees the same previous frame' );

			} );

		} );

	} );

} );
