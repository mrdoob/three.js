import { STLLoader } from '../../../../examples/jsm/loaders/STLLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'STLLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new STLLoader();

				assert.ok( loader instanceof STLLoader, 'Can instantiate an STLLoader.' );

			} );

			QUnit.test( 'parses an ASCII STL shorter than a binary header', ( assert ) => {

				// Regression: isBinary() read the face count at byte 80 before checking the
				// length, so an ASCII solid with no facets, which is 15 bytes, threw a
				// DataView RangeError instead of parsing.
				const data = new TextEncoder().encode( 'solid\nendsolid\n' ).buffer;

				const geometry = new STLLoader().parse( data );

				assert.ok( geometry.isBufferGeometry, 'Returns a BufferGeometry.' );
				assert.equal( geometry.attributes.position.count, 0, 'No vertices for a solid with no facets.' );

			} );

			QUnit.test( 'parses an ASCII STL with a single facet', ( assert ) => {

				const source = [
					'solid single',
					'facet normal 0 0 1',
					'outer loop',
					'vertex 0 0 0',
					'vertex 1 0 0',
					'vertex 0 1 0',
					'endloop',
					'endfacet',
					'endsolid single'
				].join( '\n' );

				const geometry = new STLLoader().parse( new TextEncoder().encode( source ).buffer );

				assert.equal( geometry.attributes.position.count, 3, 'Three vertices for one facet.' );
				assert.deepEqual( Array.from( geometry.attributes.normal.array.slice( 0, 3 ) ), [ 0, 0, 1 ], 'Reads the facet normal.' );

			} );

		} );

	} );

} );
