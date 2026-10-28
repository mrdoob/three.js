import { Matrix3, Matrix4, Vector3 } from 'three';
import { OBB } from '../../../../examples/jsm/math/OBB.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'OBB', () => {

		QUnit.test( 'applyMatrix4 with a rotated OBB', ( assert ) => {

			const rotation = new Matrix4().makeRotationZ( Math.PI / 4 );
			const obb = new OBB( new Vector3(), new Vector3( 2, 1, 1 ), new Matrix3().setFromMatrix4( rotation ) );

			const matrix = new Matrix4().makeRotationX( Math.PI / 2 );
			obb.applyMatrix4( matrix );

			const expected = new Matrix3().setFromMatrix4( new Matrix4().multiplyMatrices( matrix, rotation ) );

			for ( let i = 0; i < 9; i ++ ) {

				assert.ok( Math.abs( obb.rotation.elements[ i ] - expected.elements[ i ] ) < 1e-6, `rotation element ${ i } is correct` );

			}

			const tip = new Vector3( 1.9, 0, 0 ).applyMatrix4( rotation ).applyMatrix4( matrix );
			assert.ok( obb.containsPoint( tip ), 'Contains the transformed tip of the box' );

		} );

		QUnit.test( 'applyMatrix4 with a negative determinant', ( assert ) => {

			const obb = new OBB( new Vector3(), new Vector3( 1, 2, 3 ) );
			obb.applyMatrix4( new Matrix4().makeScale( - 2, 1, 1 ) );

			assert.ok( obb.halfSize.equals( new Vector3( 2, 2, 3 ) ), 'Half size stays positive' );
			assert.ok( obb.containsPoint( new Vector3() ), 'Contains its own center' );

		} );

	} );

} );
