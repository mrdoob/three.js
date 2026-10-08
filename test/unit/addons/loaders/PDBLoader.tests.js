import { PDBLoader } from '../../../../examples/jsm/loaders/PDBLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'PDBLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new PDBLoader();

				assert.ok( loader instanceof PDBLoader, 'Can instantiate a PDBLoader.' );

			} );

			QUnit.test( 'parses all digits of the coordinate fields', ( assert ) => {

				// https://github.com/mrdoob/three.js/issues/34879
				const text = 'ATOM      1  C           0      -2.561   1.251  -3.456  0.00  0.00           C+0\n';

				const result = new PDBLoader().parse( text );
				const atom = result.json.atoms[ 0 ];

				assert.strictEqual( atom[ 0 ], - 2.561, 'Correct x.' );
				assert.strictEqual( atom[ 1 ], 1.251, 'Correct y.' );
				assert.strictEqual( atom[ 2 ], - 3.456, 'Correct z.' );

			} );

		} );

	} );

} );
