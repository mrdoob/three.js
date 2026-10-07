import { ColladaLoader } from '../../../../examples/jsm/loaders/ColladaLoader.js';
import { ColladaComposer } from '../../../../examples/jsm/loaders/collada/ColladaComposer.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'ColladaLoader', () => {

			QUnit.test( 'polygon attributes use the position contour at the VERTEX offset', ( assert ) => {

				const positions = [[ 0, 0, 0 ], [ 2, 0, 0 ], [ 3, 1, 0 ], [ 2, 2, 0 ], [ 0, 2, 0 ], [ - 1, 1, 0 ]];
				const normals = [[ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ], [ - 1, 0, 0 ], [ 0, - 1, 0 ], [ 0, 0, - 1 ]];
				const uvs = [[ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0.5, 0.25 ], [ 0.25, 0.5 ]];
				const normalIndices = [ 2, 5, 1, 4, 0, 3 ];
				const uvIndices = [ 4, 2, 5, 0, 3, 1 ];
				const sources = {
					position: { array: positions.flat(), stride: 3 },
					normal: { array: normals.flat(), stride: 3 },
					uv: { array: uvs.flat(), stride: 2 }
				};
				const primitive = {
					type: 'polylist', count: 1, stride: 3, vcount: [ 6 ],
					inputs: { NORMAL: { id: 'normal', offset: 0 }, VERTEX: { offset: 1 }, TEXCOORD: { id: 'uv', offset: 2 } },
					p: positions.flatMap( ( _, i ) => [ normalIndices[ i ], i, uvIndices[ i ] ] )
				};
				const { attributes } = new ColladaComposer().buildGeometryType( [ primitive ], sources, { POSITION: 'position' } ).data;

				assert.strictEqual( attributes.position.count, 12, 'polygon has four triangles' );
				assert.strictEqual( attributes.normal.count, 12, 'normals have four triangles' );
				assert.strictEqual( attributes.uv.count, 12, 'uvs have four triangles' );

				for ( let i = 0; i < attributes.position.count; i ++ ) {

					const position = Array.from( attributes.position.array.slice( i * 3, i * 3 + 3 ) );
					const corner = positions.findIndex( value => value.every( ( component, axis ) => component === position[ axis ] ) );

					assert.ok( corner !== - 1, 'position matches an original polygon corner' );
					assert.deepEqual( Array.from( attributes.normal.array.slice( i * 3, i * 3 + 3 ) ), normals[ normalIndices[ corner ] ], 'normal matches the position corner' );
					assert.deepEqual( Array.from( attributes.uv.array.slice( i * 2, i * 2 + 2 ) ), uvs[ uvIndices[ corner ] ], 'uv matches the position corner' );

				}

			} );

			QUnit.test( 'attributes of polygons with more than four vertices match positions', async ( assert ) => {

				const collada = await new ColladaLoader().loadAsync( '/examples/models/collada/skin_and_morph.dae' );
				const attributes = collada.scene.getObjectByProperty( 'isSkinnedMesh', true ).geometry.attributes;
				const count = attributes.position.count;

				assert.strictEqual( attributes.normal.count, count, 'normal count matches position count' );
				assert.strictEqual( attributes.uv.count, count, 'uv count matches position count' );
				assert.strictEqual( attributes.skinIndex.count, count, 'skinIndex count matches position count' );
				assert.strictEqual( attributes.skinWeight.count, count, 'skinWeight count matches position count' );

			} );

		} );

	} );

} );
