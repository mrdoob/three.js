import { Color, SRGBColorSpace } from 'three';
import { ColorConverter } from '../../../../examples/jsm/math/ColorConverter.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorConverter', () => {

		QUnit.test( 'setHSV achromatic colors', ( assert ) => {

			const color = new Color();

			assert.strictEqual( ColorConverter.setHSV( color, 0, 0, 0 ), color, 'Returns the supplied color' );
			assert.deepEqual( color.toArray(), [ 0, 0, 0 ], 'Black with zero saturation' );
			assert.deepEqual( ColorConverter.setHSV( color, 0.5, 1, 0 ).toArray(), [ 0, 0, 0 ], 'Black with full saturation' );
			assert.deepEqual( ColorConverter.setHSV( color, 0.5, 0, 1 ).toArray(), [ 1, 1, 1 ], 'White' );
			assert.deepEqual( ColorConverter.setHSV( color, 0.5, 0, 0.5 ).toArray(), [ 0.5, 0.5, 0.5 ], 'Gray' );

		} );

		QUnit.test( 'getHSV achromatic colors', ( assert ) => {

			const target = {};

			assert.strictEqual( ColorConverter.getHSV( new Color( 0, 0, 0 ), target ), target, 'Returns the supplied target' );
			assert.deepEqual( target, { h: 0, s: 0, v: 0 }, 'Black has zero saturation and value' );
			assert.deepEqual( ColorConverter.getHSV( new Color( 1, 1, 1 ), target ), { h: 0, s: 0, v: 1 }, 'White' );
			assert.deepEqual( ColorConverter.getHSV( new Color( 0.5, 0.5, 0.5 ), target ), { h: 0, s: 0, v: 0.5 }, 'Gray' );

		} );

		QUnit.test( 'primary colors', ( assert ) => {

			const colors = [ new Color( 1, 0, 0 ), new Color( 0, 1, 0 ), new Color( 0, 0, 1 ) ];

			for ( let i = 0; i < colors.length; i ++ ) {

				const color = ColorConverter.setHSV( new Color(), i / 3, 1, 1 );
				assert.ok( Math.abs( color.r - colors[ i ].r ) < 1e-12, 'Red channel' );
				assert.ok( Math.abs( color.g - colors[ i ].g ) < 1e-12, 'Green channel' );
				assert.ok( Math.abs( color.b - colors[ i ].b ) < 1e-12, 'Blue channel' );
				assert.deepEqual( ColorConverter.getHSV( colors[ i ], {} ), { h: i / 3, s: 1, v: 1 }, 'HSV primary' );

			}

		} );

		QUnit.test( 'clamping and hue wrapping', ( assert ) => {

			const color = new Color();

			assert.deepEqual( ColorConverter.setHSV( color, 0.5, 1, - 1 ).toArray(), [ 0, 0, 0 ], 'Value clamps to black' );
			assert.deepEqual( ColorConverter.setHSV( color, 0.5, - 1, 2 ).toArray(), [ 1, 1, 1 ], 'Saturation and value clamp to white' );
			assert.deepEqual( ColorConverter.setHSV( color, 0, 2, 2 ).toArray(), [ 1, 0, 0 ], 'Saturation and value clamp to red' );
			const expected = ColorConverter.setHSV( new Color(), 0.25, 0.5, 0.75 );
			assert.ok( ColorConverter.setHSV( color, 1.25, 0.5, 0.75 ).equals( expected ), 'Hue wraps above one' );
			assert.ok( ColorConverter.setHSV( color, - 0.75, 0.5, 0.75 ).equals( expected ), 'Hue wraps below zero' );

		} );

		QUnit.test( 'round trip', ( assert ) => {

			for ( const hsv of [ { h: 0.1, s: 0.5, v: 0.75 }, { h: 0.6, s: 0.8, v: 0.2 } ] ) {

				const color = ColorConverter.setHSV( new Color(), hsv.h, hsv.s, hsv.v );
				const result = ColorConverter.getHSV( color, {} );
				assert.ok( Math.abs( result.h - hsv.h ) < 1e-12, 'Hue' );
				assert.ok( Math.abs( result.s - hsv.s ) < 1e-12, 'Saturation' );
				assert.ok( Math.abs( result.v - hsv.v ) < 1e-12, 'Value' );

			}

		} );

		QUnit.test( 'working color space', ( assert ) => {

			const color = new Color().setRGB( 0.5, 0.5, 0.5, SRGBColorSpace );
			const hsv = ColorConverter.getHSV( color, {} );
			assert.ok( Math.abs( hsv.v - 0.21404114048223255 ) < 1e-10, 'HSV uses the linear working color space' );
			assert.ok( Math.abs( ColorConverter.setHSV( new Color(), hsv.h, hsv.s, hsv.v ).r - color.r ) < 1e-12, 'Restores the linear red channel' );
			assert.deepEqual( ColorConverter.setHSV( color, 0, 0, 0.5 ).toArray(), [ 0.5, 0.5, 0.5 ], 'HSV gray is already in the working color space' );

		} );

	} );

} );
