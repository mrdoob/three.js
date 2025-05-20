import { parseSDF } from '../../../../examples/jsm/loaders/SDFParser.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'SDFParser', () => {

		QUnit.test( 'parse', ( assert ) => {

			const sdfContent =
`
  -ISIS-  08231509562D

  6  5  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.0000    1.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    2.0000    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -1.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  2  0  0  0  0
  4  5  1  0  0  0  0
  1  6  1  0  0  0  0
M  END`;

			const result = parseSDF( sdfContent );

			assert.ok( Array.isArray( result.atoms ), 'atoms array' );
			assert.ok( Array.isArray( result.bonds ), 'bonds array' );
			assert.equal( result.atoms.length, 6, 'correct atom count' );
			assert.equal( result.bonds.length, 5, 'correct bond count' );

		} );

	} );

} );
