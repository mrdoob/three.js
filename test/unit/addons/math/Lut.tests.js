import { LinearSRGBColorSpace } from 'three';
import { Lut, ColorMapKeywords } from '../../../../examples/jsm/math/Lut.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Math', () => {

		QUnit.module( 'Lut', () => {

			QUnit.test( 'reads the end colors of a color map like the colors between them', ( assert ) => {

				for ( const [ name, map ] of Object.entries( ColorMapKeywords ) ) {

					const lut = new Lut( name, 32 );

					assert.strictEqual( lut.getColor( lut.minV ).getHex( LinearSRGBColorSpace ), map[ 0 ][ 1 ], `${ name } at min` );
					assert.strictEqual( lut.getColor( lut.maxV ).getHex( LinearSRGBColorSpace ), map[ map.length - 1 ][ 1 ], `${ name } at max` );

				}

			} );

		} );

	} );

} );
