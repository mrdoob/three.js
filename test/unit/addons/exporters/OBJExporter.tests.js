import { assert, describe, test } from 'vitest';

import { BufferGeometry, Float32BufferAttribute, Line, LineSegments } from 'three';
import { OBJExporter } from '../../../../examples/jsm/exporters/OBJExporter.js';

function createSquare( index ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0 ], 3 ) );
	geometry.setIndex( index );

	return geometry;

}

describe( 'Addons', () => {

	describe( 'Exporters', () => {

		describe( 'OBJExporter', () => {

			test( 'indexed line segments', () => {

				const object = new LineSegments( createSquare( [ 0, 1, 1, 2, 2, 3, 3, 0 ] ) );
				const result = new OBJExporter().parse( object );

				assert.deepEqual( result.match( /^l .*$/gm ), [ 'l 1 2', 'l 2 3', 'l 3 4', 'l 4 1' ], 'line elements follow the index' );

			} );

			test( 'indexed line', () => {

				const object = new Line( createSquare( [ 0, 1, 2, 3, 0 ] ) );
				const result = new OBJExporter().parse( object );

				assert.deepEqual( result.match( /^l .*$/gm ), [ 'l 1 2 3 4 1 ' ], 'line element follows the index' );

			} );

		} );

	} );

} );
