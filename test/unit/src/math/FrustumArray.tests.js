import { ArrayCamera } from '../../../../src/cameras/ArrayCamera.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../../../../src/constants.js';
import { FrustumArray } from '../../../../src/math/FrustumArray.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'FrustumArray', () => {

		QUnit.test( 'getFrustum and pool reuse', ( assert ) => {

			const left = new PerspectiveCamera( 45, 1, 0.1, 100 );
			const right = new PerspectiveCamera( 45, 1, 0.1, 100 );
			right.position.x = 100;
			right.updateMatrixWorld();
			const camera = new ArrayCamera( [ left, right ] );
			const frustums = new FrustumArray();
			assert.strictEqual( frustums.getFrustum( 0 ), undefined, 'No frustum before initialization' );
			frustums.setFromArrayCamera( camera );
			const first = frustums.getFrustum( 0 );
			const second = frustums.getFrustum( 1 );
			const point = new Vector3( 100, 0, - 5 );
			assert.notOk( first.containsPoint( point ), 'Point is outside the first view' );
			assert.ok( second.containsPoint( point ), 'Point is inside the second view' );
			assert.ok( frustums.containsPoint( point ), 'Union includes the second view' );

			camera.cameras.length = 1;
			frustums.setFromArrayCamera( camera );
			assert.strictEqual( frustums.getFrustum( 1 ), undefined, 'Inactive pooled frustum is not exposed' );
			assert.notOk( frustums.containsPoint( point ), 'Inactive view is excluded from the union' );

			camera.cameras.push( right );
			right.position.x = 200;
			right.updateMatrixWorld();
			frustums.setFromArrayCamera( camera );
			assert.strictEqual( frustums.getFrustum( 0 ), first, 'First frustum is reused' );
			assert.strictEqual( frustums.getFrustum( 1 ), second, 'Surplus frustum is reused after growing' );
			assert.notOk( second.containsPoint( point ), 'Reused frustum follows the updated camera' );
			assert.ok( second.containsPoint( new Vector3( 200, 0, - 5 ) ), 'Updated camera sees its new position' );

		} );

		QUnit.test( 'Sub-camera coordinate systems and reversed depth', ( assert ) => {

			for ( const coordinateSystem of [ WebGLCoordinateSystem, WebGPUCoordinateSystem ] ) {

				for ( const reversedDepth of [ false, true ] ) {

					const camera = new PerspectiveCamera( 45, 1, 1, 10 );
					camera.coordinateSystem = coordinateSystem;
					camera._reversedDepth = reversedDepth;
					camera.updateProjectionMatrix();
					const frustums = new FrustumArray().setFromArrayCamera( new ArrayCamera( [ camera ] ) );
					const frustum = frustums.getFrustum( 0 );
					assert.ok( frustum.containsPoint( new Vector3( 0, 0, - 5 ) ), 'Visible point is included' );
					assert.notOk( frustum.containsPoint( new Vector3( 0, 0, - 0.5 ) ), 'Point before the near plane is excluded' );
					assert.notOk( frustum.containsPoint( new Vector3( 0, 0, - 20 ) ), 'Point beyond the far plane is excluded' );
					assert.notOk( frustum.containsPoint( new Vector3( 100, 0, - 5 ) ), 'Point outside a side plane is excluded' );

				}

			}

		} );

	} );

} );
