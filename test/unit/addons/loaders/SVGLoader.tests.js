import { SVGLoader } from '../../../../examples/jsm/loaders/SVGLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'SVGLoader', () => {

			QUnit.test( 'use element with href', ( assert ) => {

				const svg = `<svg xmlns="http://www.w3.org/2000/svg">
					<defs><rect id="box" width="10" height="10"/></defs>
					<use href="#box" x="20" y="30"/>
				</svg>`;

				const { paths } = new SVGLoader().parse( svg );

				assert.strictEqual( paths.length, 1, 'referenced element is parsed' );
				assert.deepEqual( paths[ 0 ].subPaths[ 0 ].getPoints()[ 0 ].toArray(), [ 20, 30 ], 'use offset is applied' );

			} );

			QUnit.test( 'use element with xlink:href', ( assert ) => {

				const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<defs><rect id="box" width="10" height="10"/></defs>
					<use xlink:href="#box" x="20" y="30"/>
				</svg>`;

				const { paths } = new SVGLoader().parse( svg );

				assert.strictEqual( paths.length, 1, 'referenced element is parsed' );
				assert.deepEqual( paths[ 0 ].subPaths[ 0 ].getPoints()[ 0 ].toArray(), [ 20, 30 ], 'use offset is applied' );

			} );

		} );

	} );

} );
