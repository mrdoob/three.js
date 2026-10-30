import { OBJLoader } from '../../../../examples/jsm/loaders/OBJLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'OBJLoader', () => {

			QUnit.test( 'parse - trailing comments', ( assert ) => {

				const text = [
					'o triangle',
					'v 0 0 0 # first corner',
					'v 1 0 0',
					'v 0 1 0#no space',
					'vt 0 0 # uv',
					'vt 1 0',
					'vt 0 1',
					'f 1/1 2/2 3/3 # a triangle',
					'o line',
					'l 1 2 # a line',
					'o point',
					'p 3 # a point'
				].join( '\n' );

				const object = new OBJLoader().parse( text );

				const mesh = object.children[ 0 ];
				const position = mesh.geometry.attributes.position;

				assert.strictEqual( position.count, 3, 'the face has one triangle' );
				assert.deepEqual( Array.from( position.array ), [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 'the face has the right positions' );
				assert.notOk( 'color' in mesh.geometry.attributes, 'a comment is not read as a vertex color' );
				assert.deepEqual( Array.from( mesh.geometry.attributes.uv.array ), [ 0, 0, 1, 0, 0, 1 ], 'the face has the right uvs' );

				const line = object.children[ 1 ];
				assert.deepEqual( Array.from( line.geometry.attributes.position.array ), [ 0, 0, 0, 1, 0, 0 ], 'the line has the right positions' );

				const points = object.children[ 2 ];
				assert.deepEqual( Array.from( points.geometry.attributes.position.array ), [ 0, 1, 0 ], 'the point has the right position' );

			} );

			QUnit.test( 'parse - names can contain #', ( assert ) => {

				const text = [
					'o part#1',
					'v 0 0 0',
					'v 1 0 0',
					'v 0 1 0',
					'usemtl red#2',
					'f 1 2 3'
				].join( '\n' );

				const mesh = new OBJLoader().parse( text ).children[ 0 ];

				assert.strictEqual( mesh.name, 'part#1', 'object name is kept' );
				assert.strictEqual( mesh.material.name, 'red#2', 'material name is kept' );

			} );

		} );

	} );

} );
