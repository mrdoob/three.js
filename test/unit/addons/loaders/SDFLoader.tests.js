import { SDFLoader } from '../../../../examples/jsm/loaders/SDFLoader.js';
import { Group, Color } from 'three';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'SDFLoader', () => {

		// INSTANCING
		QUnit.test( 'constructor', ( assert ) => {

			assert.ok( new SDFLoader(), 'Can instantiate loader.' );

		} );

		QUnit.test( 'parse', ( assert ) => {

			const loader = new SDFLoader();

			const sdfContent =
`
  -ISIS-  08231509562D

  6  6  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -1.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  1  1  0  0  0  0
  4  5  1  0  0  0  0
  1  6  1  0  0  0  0
M  END`;

			const result = loader.parse( sdfContent );

			assert.ok( result instanceof Group, 'Parser returns a Group.' );
			assert.equal( result.children.length, 2, 'Group has correct number of children (atoms and bonds).' );

			const atomMesh = result.children[ 0 ];
			const bondMesh = result.children[ 1 ];

			assert.equal( atomMesh.count, 6, 'Correct number of atoms.' );
			assert.equal( bondMesh.count, 6, 'Correct number of bonds.' );

		} );

		QUnit.test( 'setElementData', ( assert ) => {

			const loader = new SDFLoader();
			const customColors = { H: 0x123456 };
			const customRadii = { H: 0.5 };

			loader.setElementData( customColors, customRadii );

			assert.equal( loader.elementColors.H, 0x123456, 'Custom colors are set.' );
			assert.equal( loader.elementRadii.H, 0.5, 'Custom radii are set.' );

		} );

	} );

} );
