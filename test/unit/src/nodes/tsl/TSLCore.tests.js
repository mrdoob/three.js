import { float, int } from '../../../../../src/Three.TSL.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'TSLCore', () => {

			QUnit.test( 'Scalar constant caching', ( assert ) => {

				for ( const value of [ 0, 1, 2, 3, - 1, - 2 ] ) {

					assert.true( int( value ).node === int( value ).node, `int(${ value }) reuses its constant` );
					assert.true( float( value ).node === float( value ).node, `float(${ value }) reuses its constant` );

				}

				assert.true( int( 1 ) !== int( 1 ), 'int() keeps separate variable intents' );
				assert.true( float( 1 ) !== float( 1 ), 'float() keeps separate variable intents' );

			} );

		} );

	} );

} );
