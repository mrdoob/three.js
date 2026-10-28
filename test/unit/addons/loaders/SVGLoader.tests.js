import { SVGLoader } from '../../../../examples/jsm/loaders/SVGLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'SVGLoader', () => {

			QUnit.test( 'parses the points attribute of polygon and polyline elements', ( assert ) => {

				const loader = new SVGLoader();

				const getPoints = ( element ) => {

					const data = loader.parse( `<svg xmlns="http://www.w3.org/2000/svg">${ element }</svg>` );
					return data.paths[ 0 ].subPaths[ 0 ].getPoints().map( ( p ) => [ p.x, p.y ] );

				};

				const polyline = [[ 10, 20 ], [ 30, 40 ], [ 50, 60 ]];
				const polygon = [ ...polyline, [ 10, 20 ]];

				assert.deepEqual( getPoints( '<polyline points="10,20 30,40 50,60"/>' ), polyline, 'Comma between coordinates.' );
				assert.deepEqual( getPoints( '<polyline points="10, 20, 30, 40, 50, 60"/>' ), polyline, 'Comma and space between coordinates.' );
				assert.deepEqual( getPoints( '<polyline points="10 , 20 30 , 40 50 , 60"/>' ), polyline, 'Spaces around commas.' );
				assert.deepEqual( getPoints( '<polyline points="10  20  30  40  50  60"/>' ), polyline, 'Multiple spaces between coordinates.' );
				assert.deepEqual( getPoints( '<polyline points="10-20-30-40"/>' ), [[ 10, - 20 ], [ - 30, - 40 ]], 'Sign as separator.' );
				assert.deepEqual( getPoints( '<polyline points=".5.5 1E1,1e1"/>' ), [[ 0.5, 0.5 ], [ 10, 10 ]], 'Compact decimals and exponents.' );
				assert.deepEqual( getPoints( '<polyline points="10,20 30,40 50"/>' ), [[ 10, 20 ], [ 30, 40 ]], 'An odd coordinate is ignored.' );
				assert.deepEqual( getPoints( '<polygon points="10, 20, 30, 40, 50, 60"/>' ), polygon, 'Polygons are closed.' );

			} );

		} );

	} );

} );
