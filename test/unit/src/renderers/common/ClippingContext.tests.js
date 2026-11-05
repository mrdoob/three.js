import { ArrayCamera } from '../../../../../src/cameras/ArrayCamera.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { Plane } from '../../../../../src/math/Plane.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import { ClippingGroup } from '../../../../../src/objects/ClippingGroup.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import ClippingContext from '../../../../../src/renderers/common/ClippingContext.js';

function distance( point, plane ) {

	return point.x * plane.x + point.y * plane.y + point.z * plane.z - plane.w;

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'ClippingContext', () => {

			QUnit.test( 'updateGlobal', ( assert ) => {

				const scene = new Scene();
				const root = new ClippingContext();

				const parent = new ClippingGroup();
				parent.clippingPlanes = [ new Plane( new Vector3( 1, 2, 3 ).normalize(), - 2 ) ];

				const child = new ClippingGroup();
				child.clipIntersection = true;
				child.clippingPlanes = [ new Plane( new Vector3( - 2, 1, 1 ).normalize(), 3 ) ];

				const worldPoint = new Vector3( 4, - 1, 2 );

				// ArrayCamera: planes are shared by all sub-cameras, so they must stay in world space.

				const arrayCamera = new ArrayCamera();
				arrayCamera.position.set( 8, - 4, 3 );
				arrayCamera.rotation.set( 0.4, 0.7, - 0.2 );
				arrayCamera.updateMatrixWorld();

				root.updateGlobal( scene, arrayCamera );
				const context = root.getGroupContext( parent ).getGroupContext( child );

				assert.ok( Math.abs( distance( worldPoint, context.unionPlanes[ 0 ] ) + parent.clippingPlanes[ 0 ].distanceToPoint( worldPoint ) ) < 1e-12, 'ArrayCamera union planes are in world space' );
				assert.ok( Math.abs( distance( worldPoint, context.intersectionPlanes[ 0 ] ) + child.clippingPlanes[ 0 ].distanceToPoint( worldPoint ) ) < 1e-12, 'ArrayCamera intersection planes are in world space' );

				// Ordinary camera: planes are in view space.

				const camera = new PerspectiveCamera();
				camera.position.set( - 3, 7, 5 );
				camera.rotation.set( 0.5, - 0.6, 0.2 );
				camera.updateMatrixWorld();

				root.updateGlobal( scene, camera );
				const viewPoint = worldPoint.clone().applyMatrix4( camera.matrixWorldInverse );

				assert.strictEqual( root.getGroupContext( parent ).getGroupContext( child ), context, 'group contexts are reused when switching cameras' );
				assert.ok( Math.abs( distance( viewPoint, context.unionPlanes[ 0 ] ) + parent.clippingPlanes[ 0 ].distanceToPoint( worldPoint ) ) < 1e-12, 'union planes are in view space' );
				assert.ok( Math.abs( distance( viewPoint, context.intersectionPlanes[ 0 ] ) + child.clippingPlanes[ 0 ].distanceToPoint( worldPoint ) ) < 1e-12, 'intersection planes are in view space' );

			} );

		} );

	} );

} );
