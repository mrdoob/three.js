import { PLYLoader } from '../../../../examples/jsm/loaders/PLYLoader.js';

function createPLY( faces, faceProperties = [] ) {

	return [
		'ply',
		'format ascii 1.0',
		'element vertex 5',
		'property float x',
		'property float y',
		'property float z',
		`element face ${ faces.length }`,
		'property list uchar int vertex_indices',
		...faceProperties,
		'end_header',
		'0 0 0',
		'1 0 0',
		'1 1 0',
		'0 1 0',
		'1.5 0.5 0',
		...faces,
		''
	].join( '\n' );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'PLYLoader', () => {

			QUnit.test( 'triangulates quads and polygons', ( assert ) => {

				const loader = new PLYLoader();

				const quad = loader.parse( createPLY( [ '4 0 1 2 3' ] ) );
				assert.deepEqual( Array.from( quad.index.array ), [ 0, 1, 3, 1, 2, 3 ], 'quad' );

				const pentagon = loader.parse( createPLY( [ '3 0 1 2', '5 0 1 4 2 3' ] ) );
				assert.deepEqual( Array.from( pentagon.index.array ), [ 0, 1, 2, 0, 1, 3, 1, 4, 3, 4, 2, 3 ], 'triangle and pentagon' );

			} );

			QUnit.test( 'expands face colors for every triangle of a face', ( assert ) => {

				const loader = new PLYLoader();
				const geometry = loader.parse( createPLY(
					[ '4 0 1 2 3 255 0 0', '3 1 4 2 0 255 0' ],
					[ 'property uchar red', 'property uchar green', 'property uchar blue' ]
				) );

				assert.strictEqual( geometry.getAttribute( 'position' ).count, 9, 'position count' );
				assert.deepEqual( Array.from( geometry.getAttribute( 'color' ).array ), [
					255, 0, 0, 255, 0, 0, 255, 0, 0,
					255, 0, 0, 255, 0, 0, 255, 0, 0,
					0, 255, 0, 0, 255, 0, 0, 255, 0
				], 'colors' );

			} );

			QUnit.test( 'expands face texcoords for every triangle of a face', ( assert ) => {

				const loader = new PLYLoader();
				const geometry = loader.parse( createPLY(
					[ '3 0 1 4 6 0 0 1 0 1 1', '4 0 1 2 3 8 0 0 1 0 1 1 0 1' ],
					[ 'property list uchar float texcoord' ]
				) );

				const position = geometry.getAttribute( 'position' );
				const uv = geometry.getAttribute( 'uv' );

				assert.strictEqual( position.count, 9, 'position count' );
				assert.strictEqual( uv.count, position.count, 'uv count matches position count' );
				assert.deepEqual( Array.from( uv.array ), [ 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1 ], 'uvs' );

			} );

		} );

	} );

} );
