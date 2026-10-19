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

			QUnit.test( 'update', ( assert ) => {

				const root = new ClippingContext();
				root.updateGlobal( new Scene() );

				const parent = new ClippingGroup();
				parent.clippingPlanes = [ new Plane( new Vector3( 1, 2, 3 ).normalize(), - 2 ) ];

				const child = new ClippingGroup();
				child.clipIntersection = true;
				child.clippingPlanes = [ new Plane( new Vector3( - 2, 1, 1 ).normalize(), 3 ) ];

				const context = root.getGroupContext( parent ).getGroupContext( child );
				const point = new Vector3( 4, - 1, 2 );

				// Planes stay in world space, so they are independent of the camera.

				assert.ok( Math.abs( distance( point, context.unionPlanes[ 0 ] ) + parent.clippingPlanes[ 0 ].distanceToPoint( point ) ) < 1e-12, 'union planes are in world space' );
				assert.ok( Math.abs( distance( point, context.intersectionPlanes[ 0 ] ) + child.clippingPlanes[ 0 ].distanceToPoint( point ) ) < 1e-12, 'intersection planes are in world space' );

			} );

		} );

	} );

} );
