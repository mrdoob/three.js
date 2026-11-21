import {
	BoxGeometry,
	BufferAttribute,
	Color,
	InstancedBufferAttribute,
	InstancedMesh,
	Matrix4,
	Mesh,
	MeshBasicMaterial
} from 'three';
import * as SceneUtils from '../../../../examples/jsm/utils/SceneUtils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'SceneUtils', () => {

			QUnit.test( 'sortInstancedMesh', ( assert ) => {

				const geometry = new BoxGeometry();
				geometry.morphAttributes.position = [
					new BufferAttribute( new Float32Array( geometry.attributes.position.count * 3 ), 3 ),
					new BufferAttribute( new Float32Array( geometry.attributes.position.count * 3 ), 3 )
				];

				const customAttribute = new InstancedBufferAttribute( new Float32Array( [ 10, 20, 30 ] ), 1 );
				geometry.setAttribute( 'customAttr', customAttribute );

				const material = new MeshBasicMaterial();
				const count = 3;
				const instancedMesh = new InstancedMesh( geometry, material, count );

				const xCoords = [ 100, 200, 50 ];
				const colors = [ new Color( 0xff0000 ), new Color( 0x00ff00 ), new Color( 0x0000ff ) ];
				const morphs = [
					[ 0.1, 0.9 ],
					[ 0.5, 0.5 ],
					[ 0.8, 0.2 ]
				];

				for ( let i = 0; i < count; i ++ ) {

					instancedMesh.setMatrixAt( i, new Matrix4().makeTranslation( xCoords[ i ], 0, 0 ) );
					instancedMesh.setColorAt( i, colors[ i ] );

					const dummy = new Mesh( geometry, material );
					dummy.morphTargetInfluences = morphs[ i ].slice();
					instancedMesh.setMorphAt( i, dummy );

				}

				const initialMatrixVersion = instancedMesh.instanceMatrix.version;
				const initialColorVersion = instancedMesh.instanceColor.version;
				const initialTextureVersion = instancedMesh.morphTexture.version;
				const initialCustomAttrVersion = customAttribute.version;

				// Sort ascending by x translation:
				// Expected slot order: old index 2 (x=50), old index 0 (x=100), old index 1 (x=200)
				SceneUtils.sortInstancedMesh( instancedMesh, ( a, b ) => {

					const matrixA = new Matrix4();
					const matrixB = new Matrix4();
					instancedMesh.getMatrixAt( a, matrixA );
					instancedMesh.getMatrixAt( b, matrixB );
					return matrixA.elements[ 12 ] - matrixB.elements[ 12 ];

				} );

				assert.strictEqual( instancedMesh.instanceMatrix.version, initialMatrixVersion + 1, 'instanceMatrix.version is incremented' );
				assert.strictEqual( instancedMesh.instanceColor.version, initialColorVersion + 1, 'instanceColor.version is incremented' );
				assert.strictEqual( instancedMesh.morphTexture.version, initialTextureVersion + 1, 'morphTexture.version is incremented' );
				assert.strictEqual( customAttribute.version, initialCustomAttrVersion + 1, 'customAttribute.version is incremented' );

				const expectedIndices = [ 2, 0, 1 ];
				const matrix = new Matrix4();
				const color = new Color();
				const dummy = new Mesh( geometry, material );

				for ( let i = 0; i < count; i ++ ) {

					const origIndex = expectedIndices[ i ];

					instancedMesh.getMatrixAt( i, matrix );
					assert.strictEqual( matrix.elements[ 12 ], xCoords[ origIndex ], `Instance ${ i } has correct position from old index ${ origIndex }` );

					instancedMesh.getColorAt( i, color );
					assert.strictEqual( color.getHex(), colors[ origIndex ].getHex(), `Instance ${ i } has correct color from old index ${ origIndex }` );

					instancedMesh.getMorphAt( i, dummy );
					assert.closeTo( dummy.morphTargetInfluences[ 0 ], morphs[ origIndex ][ 0 ], 0.0001, `Instance ${ i } has correct morph 0 from old index ${ origIndex }` );
					assert.closeTo( dummy.morphTargetInfluences[ 1 ], morphs[ origIndex ][ 1 ], 0.0001, `Instance ${ i } has correct morph 1 from old index ${ origIndex }` );

					assert.strictEqual( customAttribute.getX( i ), ( origIndex + 1 ) * 10, `Instance ${ i } has correct customAttribute from old index ${ origIndex }` );

				}

			} );

		} );

	} );

} );
