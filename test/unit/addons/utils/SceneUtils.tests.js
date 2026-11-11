import { BoxGeometry, Color, InstancedBufferAttribute, InstancedMesh, Matrix4 } from 'three';
import { sortInstancedMesh } from '../../../../examples/jsm/utils/SceneUtils.js';

const color = new Color();
const matrix = new Matrix4();

export default QUnit.module( 'Utils', () => {

	QUnit.module( 'SceneUtils', () => {

		QUnit.test( 'sortInstancedMesh()', ( assert ) => {

			const valueA = new InstancedBufferAttribute( new Uint8Array( [ 2, 7, 1 ] ), 1 );
			const valueB = new InstancedBufferAttribute( new Float32Array( [ 1, 1, 1, 2, 2, 2, 3, 3, 3 ] ), 3 );

			const geometry = new BoxGeometry()
				.setAttribute( 'instanceValueA', valueA )
				.setAttribute( 'instanceValueB', valueB );

			const mesh = new InstancedMesh( geometry, undefined, 3 );

			mesh.setMatrixAt( 0, matrix.makeTranslation( 10, 0, 0 ) );
			mesh.setMatrixAt( 1, matrix.makeTranslation( 0, 10, 0 ) );
			mesh.setMatrixAt( 2, matrix.makeTranslation( 0, 0, 10 ) );

			mesh.setColorAt( 0, color.setRGB( 1, 0, 0 ) );
			mesh.setColorAt( 1, color.setRGB( 0, 1, 0 ) );
			mesh.setColorAt( 2, color.setRGB( 0, 0, 1 ) );

			const matrixVersion = mesh.instanceMatrix.version;
			const colorVersion = mesh.instanceColor.version;
			const valueAVersion = valueA.version;
			const valueBVersion = valueB.version;

			sortInstancedMesh( mesh, ( a, b ) => valueA.getX( a ) - valueA.getX( b ) );

			assert.deepEqual( Array.from( mesh.instanceMatrix.array ), [

				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 10, 1,

				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				10, 0, 0, 1,

				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 10, 0, 1

			], 'sorted instanceMatrix' );

			assert.deepEqual( Array.from( mesh.instanceColor.array ), [

				0, 0, 1,
				1, 0, 0,
				0, 1, 0

			], 'sorted instanceColor' );

			assert.deepEqual( Array.from( valueA.array ), [ 1, 2, 7 ], 'sorted instanceValueA' );
			assert.deepEqual( Array.from( valueB.array ), [ 3, 3, 3, 1, 1, 1, 2, 2, 2 ], 'sorted instanceValueB' );

			assert.strictEqual( mesh.instanceMatrix.version, matrixVersion + 1, 'instanceMatrix.needsUpdate was set' );
			assert.strictEqual( mesh.instanceColor.version, colorVersion + 1, 'instanceColor.needsUpdate was set' );
			assert.strictEqual( valueA.version, valueAVersion + 1, 'instanceValueA.needsUpdate was set' );
			assert.strictEqual( valueB.version, valueBVersion + 1, 'instanceValueB.needsUpdate was set' );

		} );

	} );

} );
