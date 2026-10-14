import { OBJLoader } from '../../../../examples/jsm/loaders/OBJLoader.js';

const vertices = 'v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\n';

function getPositions( group ) {

	return Array.from( group.children[ 0 ].geometry.getAttribute( 'position' ).array );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'OBJLoader', () => {

			QUnit.test( 'converts line statements to line segments', ( assert ) => {

				const loader = new OBJLoader();

				const group = loader.parse( vertices + 'l 1 2 3\nl 3 4\n' );

				assert.ok( group.children[ 0 ].isLineSegments, 'creates line segments' );
				assert.deepEqual( getPositions( group ), [
					0, 0, 0, 1, 0, 0,
					1, 0, 0, 1, 1, 0,
					1, 1, 0, 0, 1, 0
				], 'polyline vertices are split into segments' );

			} );

			QUnit.test( 'parses line and point statements with arbitrary whitespace', ( assert ) => {

				const loader = new OBJLoader();

				assert.deepEqual( getPositions( loader.parse( vertices + 'l 1  2\n' ) ), [ 0, 0, 0, 1, 0, 0 ], 'line with multiple spaces' );
				assert.deepEqual( getPositions( loader.parse( vertices + 'l 1\t2\n' ) ), [ 0, 0, 0, 1, 0, 0 ], 'line with tab' );
				assert.deepEqual( getPositions( loader.parse( vertices + 'p 1  2\n' ) ), [ 0, 0, 0, 1, 0, 0 ], 'points with multiple spaces' );
				assert.deepEqual( getPositions( loader.parse( vertices + 'p 1\t2\n' ) ), [ 0, 0, 0, 1, 0, 0 ], 'points with tab' );

			} );

		} );

	} );

} );
