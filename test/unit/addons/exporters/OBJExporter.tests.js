import { BufferGeometry, Float32BufferAttribute, Line, LineSegments, Mesh } from 'three';
import { OBJExporter } from '../../../../examples/jsm/exporters/OBJExporter.js';

function createSquare( index ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0 ], 3 ) );
	geometry.setIndex( index );

	return geometry;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'OBJExporter', () => {

			QUnit.test( 'indexed line segments', ( assert ) => {

				const object = new LineSegments( createSquare( [ 0, 1, 1, 2, 2, 3, 3, 0 ] ) );
				const result = new OBJExporter().parse( object );

				assert.deepEqual( result.match( /^l .*$/gm ), [ 'l 1 2', 'l 2 3', 'l 3 4', 'l 4 1' ], 'line elements follow the index' );

			} );

			QUnit.test( 'indexed line', ( assert ) => {

				const object = new Line( createSquare( [ 0, 1, 2, 3, 0 ] ) );
				const result = new OBJExporter().parse( object );

				assert.deepEqual( result.match( /^l .*$/gm ), [ 'l 1 2 3 4 1 ' ], 'line element follows the index' );

			} );

			QUnit.test( 'mirrored mesh', ( assert ) => {

				const triangle = new BufferGeometry();
				triangle.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 3 ) );

				for ( const mesh of [ new Mesh( triangle ), new Mesh( triangle.clone().setIndex( [ 0, 1, 2 ] ) ) ] ) {

					assert.deepEqual( new OBJExporter().parse( mesh ).match( /^f .*$/gm )[ 0 ], 'f 1 2 3', 'the winding is kept' );

					mesh.scale.x = - 1;
					mesh.updateMatrixWorld();

					assert.deepEqual( new OBJExporter().parse( mesh ).match( /^f .*$/gm )[ 0 ], 'f 1 3 2', 'a mirrored triangle is written the other way round' );

				}

			} );

		} );

	} );

} );
