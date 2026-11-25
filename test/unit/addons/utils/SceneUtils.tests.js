import { BoxGeometry, InstancedBufferAttribute, InstancedInterleavedBuffer, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, MeshBasicMaterial } from 'three';
import * as SceneUtils from '../../../../examples/jsm/utils/SceneUtils.js';

const getInstancedMesh = ( count = 3 ) => {

	const mesh = new InstancedMesh( new BoxGeometry(), new MeshBasicMaterial(), count );

	for ( let i = 0; i < count; i ++ ) {

		mesh.setMatrixAt( i, new Matrix4().makeTranslation( i, 0, 0 ) );

	}

	return mesh;

};

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'SceneUtils', () => {

			QUnit.module( 'sortInstancedMesh', () => {

				QUnit.test( 'sorts interleaved instanced attributes with their instances', ( assert ) => {

					const mesh = getInstancedMesh();

					mesh.geometry.setAttribute( 'markerPlain', new InstancedBufferAttribute( new Float32Array( [ 100, 101, 102 ] ), 1 ) );

					const instanceBuffer = new InstancedInterleavedBuffer( new Float32Array( [ 200, 201, 202 ] ), 1, 1 );
					mesh.geometry.setAttribute( 'markerInterleaved', new InterleavedBufferAttribute( instanceBuffer, 1, 0 ) );

					SceneUtils.sortInstancedMesh( mesh, ( a, b ) => b - a );

					const matrix = new Matrix4();
					const plain = mesh.geometry.getAttribute( 'markerPlain' );
					const interleaved = mesh.geometry.getAttribute( 'markerInterleaved' );

					for ( let i = 0; i < mesh.count; i ++ ) {

						const sourceIndex = mesh.count - 1 - i;

						mesh.getMatrixAt( i, matrix );
						assert.strictEqual( matrix.elements[ 12 ], sourceIndex, `slot ${ i } holds the matrix of instance ${ sourceIndex }` );
						assert.strictEqual( plain.getX( i ), 100 + sourceIndex, `slot ${ i } holds the plain attribute of instance ${ sourceIndex }` );
						assert.strictEqual( interleaved.getX( i ), 200 + sourceIndex, `slot ${ i } holds the interleaved attribute of instance ${ sourceIndex }` );

					}

					assert.ok( instanceBuffer.version > 0, 'instanced interleaved buffer is flagged for update' );

				} );

				QUnit.test( 'sorts attributes sharing an instanced interleaved buffer', ( assert ) => {

					const mesh = getInstancedMesh();

					const instanceBuffer = new InstancedInterleavedBuffer( new Float32Array( [
						0, 0, 0, 10, 10, 10,
						1, 1, 1, 11, 11, 11,
						2, 2, 2, 12, 12, 12
					] ), 6, 1 );
					mesh.geometry.setAttribute( 'instanceStart', new InterleavedBufferAttribute( instanceBuffer, 3, 0 ) );
					mesh.geometry.setAttribute( 'instanceEnd', new InterleavedBufferAttribute( instanceBuffer, 3, 3 ) );

					SceneUtils.sortInstancedMesh( mesh, ( a, b ) => b - a );

					const start = mesh.geometry.getAttribute( 'instanceStart' );
					const end = mesh.geometry.getAttribute( 'instanceEnd' );

					for ( let i = 0; i < mesh.count; i ++ ) {

						const sourceIndex = mesh.count - 1 - i;

						assert.strictEqual( start.getX( i ), sourceIndex, `slot ${ i } holds the start of instance ${ sourceIndex }` );
						assert.strictEqual( end.getX( i ), 10 + sourceIndex, `slot ${ i } holds the end of instance ${ sourceIndex }` );

					}

				} );

				QUnit.test( 'does not sort per-vertex interleaved attributes', ( assert ) => {

					const mesh = getInstancedMesh();

					const vertexData = new Float32Array( [ 7, 8, 9 ] );
					const vertexBuffer = new InterleavedBuffer( vertexData, 1 );
					mesh.geometry.setAttribute( 'vertexMarker', new InterleavedBufferAttribute( vertexBuffer, 1, 0 ) );

					SceneUtils.sortInstancedMesh( mesh, ( a, b ) => b - a );

					assert.deepEqual( Array.from( vertexData ), [ 7, 8, 9 ], 'per-vertex interleaved data is left untouched' );

				} );

			} );

		} );

	} );

} );
