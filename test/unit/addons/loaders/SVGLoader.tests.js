import { SVGLoader } from '../../../../examples/jsm/loaders/SVGLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'SVGLoader', () => {

			QUnit.test( 'reads points separated by a comma, white space or both', ( assert ) => {

				const loader = new SVGLoader();

				function getPoints( element ) {

					const data = loader.parse( `<svg xmlns="http://www.w3.org/2000/svg">${ element }</svg>` );
					return data.paths[ 0 ].subPaths[ 0 ].getPoints().map( ( point ) => [ point.x, point.y ] );

				}

				// each case is a shape written the usual way and in another valid way
				const cases = [
					[ '<polygon points="0,0 100,0 100,50"/>', '<polygon points="0, 0 100, 0 100, 50"/>' ],
					[ '<polygon points="0,0 100,0 100,50"/>', '<polygon points="0 , 0 , 100 , 0 , 100 , 50"/>' ],
					[ '<polyline points="0,0 100,0 100,50"/>', '<polyline points="0  0 100  0 100  50"/>' ],
					// from the logo of color.js
					[ '<polygon points="450.7,-522.887 125,-562.5 175.44,-157.89"/>', '<polygon points="450.7, -522.887 125, -562.5 175.44, -157.89"/>' ]
				];

				for ( const [ usual, other ] of cases ) {

					const expected = getPoints( usual );
					assert.ok( expected.length >= 3, `${ usual } has its points.` );
					assert.deepEqual( getPoints( other ), expected, `${ other } reads like ${ usual }.` );

				}

			} );

		} );

	} );

} );
