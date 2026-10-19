import { ArrayCamera } from '../../../../../src/cameras/ArrayCamera.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { RectAreaLight } from '../../../../../src/lights/RectAreaLight.js';
import { Matrix4 } from '../../../../../src/math/Matrix4.js';
import RectAreaLightNode from '../../../../../src/nodes/lighting/RectAreaLightNode.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'RectAreaLightNode', () => {

			QUnit.test( 'update', ( assert ) => {

				const light = new RectAreaLight( 0xffffff, 1, 6, 2 );
				light.rotation.set( 0.3, 0.7, - 0.2 );
				light.scale.set( 2, 3, 4 );
				light.updateMatrixWorld();

				const node = new RectAreaLightNode( light );

				// ArrayCamera: axes are shared by all sub-cameras, so they must stay in world space.

				const arrayCamera = new ArrayCamera();
				arrayCamera.position.set( 7, 2, - 3 );
				arrayCamera.rotation.set( 0.2, 0.4, 0.1 );
				arrayCamera.updateMatrixWorld();

				node.update( { camera: arrayCamera } );
				const halfWidth = node.halfWidth.value.clone();
				const halfHeight = node.halfHeight.value.clone();

				// Rotating the world-space axes into each sub-camera's view must match an ordinary camera.

				for ( let i = 0; i < 6; i ++ ) {

					const camera = new PerspectiveCamera();
					camera.position.copy( arrayCamera.position );
					camera.rotation.set( i * 0.4, i * 0.7, i * 0.2 );
					camera.updateMatrixWorld();

					node.update( { camera } );
					const rotation = new Matrix4().extractRotation( camera.matrixWorldInverse );

					assert.ok( halfWidth.clone().applyMatrix4( rotation ).distanceTo( node.halfWidth.value ) < 1e-12, 'view ' + i + ' halfWidth matches' );
					assert.ok( halfHeight.clone().applyMatrix4( rotation ).distanceTo( node.halfHeight.value ) < 1e-12, 'view ' + i + ' halfHeight matches' );

				}

			} );

		} );

	} );

} );
