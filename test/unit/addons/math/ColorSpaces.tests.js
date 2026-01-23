import { Color } from '../../../../src/math/Color.js';
import { ColorManagement } from '../../../../src/math/ColorManagement.js';
import { LinearSRGBColorSpace } from '../../../../src/constants.js';
import {
	DisplayP3ColorSpace,
	DisplayP3ColorSpaceImpl,
	LinearDisplayP3ColorSpace,
	LinearDisplayP3ColorSpaceImpl,
	LinearRec2020ColorSpace,
	LinearRec2020ColorSpaceImpl
} from '../../../../examples/jsm/math/ColorSpaces.js';

// Reference: https://apps.colorjs.io/convert/

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorSpaces', () => {

		ColorManagement.define( {

			[ DisplayP3ColorSpace ]: DisplayP3ColorSpaceImpl,
			[ LinearDisplayP3ColorSpace ]: LinearDisplayP3ColorSpaceImpl,
			[ LinearRec2020ColorSpace ]: LinearRec2020ColorSpaceImpl

		} );

		QUnit.test( 'DisplayP3ColorSpace', ( assert ) => {

			const c = new Color().setRGB( 0.3, 0.5, 0.7 );

			ColorManagement.convert( c, LinearSRGBColorSpace, DisplayP3ColorSpace );

			assert.equal( c.r.toFixed( 3 ), 0.614, 'Red: ' + c.r + ' (display-p3, in gamut)' );
			assert.equal( c.g.toFixed( 3 ), 0.731, 'Green: ' + c.g + ' (display-p3, in gamut)' );
			assert.equal( c.b.toFixed( 3 ), 0.843, 'Blue: ' + c.b + ' (display-p3, in gamut)' );

			c.setRGB( 1.0, 0.5, 0.01, DisplayP3ColorSpace );

			assert.equal( c.r.toFixed( 3 ), 1.177, 'Red: ' + c.r + ' (srgb-linear, out of gamut)' );
			assert.equal( c.g.toFixed( 3 ), 0.181, 'Green: ' + c.g + ' (srgb-linear, out of gamut)' );
			assert.equal( c.b.toFixed( 3 ), - 0.036, 'Blue: ' + c.b + ' (srgb-linear, out of gamut)' );

			assert.equal( c.getStyle( DisplayP3ColorSpace ), 'color(display-p3 1.000 0.500 0.010)', 'style: display-p3' );

		} );

		QUnit.test( 'LinearDisplayP3ColorSpace', ( assert ) => {

			const c = new Color().setRGB( 0.3, 0.5, 0.7 );

			ColorManagement.convert( c, LinearSRGBColorSpace, LinearDisplayP3ColorSpace );

			assert.equal( c.r.toFixed( 3 ), 0.336, 'Red: ' + c.r + ' (display-p3-linear, in gamut)' );
			assert.equal( c.g.toFixed( 3 ), 0.493, 'Green: ' + c.g + ' (display-p3-linear, in gamut)' );
			assert.equal( c.b.toFixed( 3 ), 0.679, 'Blue: ' + c.b + ' (display-p3-linear, in gamut)' );

			c.setRGB( 1.0, 0.5, 0.01, LinearDisplayP3ColorSpace );

			assert.equal( c.r.toFixed( 3 ), 1.112, 'Red: ' + c.r + ' (srgb-linear, out of gamut)' );
			assert.equal( c.g.toFixed( 3 ), 0.479, 'Green: ' + c.g + ' (srgb-linear, out of gamut)' );
			assert.equal( c.b.toFixed( 3 ), - 0.048, 'Blue: ' + c.b + ' (srgb-linear, out of gamut)' );

			assert.equal( c.getStyle( LinearDisplayP3ColorSpace ), 'color(display-p3-linear 1.000 0.500 0.010)', 'style: display-p3-linear' );

		} );

		QUnit.test( 'LinearRec2020ColorSpace', ( assert ) => {

			const c = new Color().setRGB( 0.3, 0.5, 0.7 );

			ColorManagement.convert( c, LinearSRGBColorSpace, LinearRec2020ColorSpace );

			assert.equal( c.r.toFixed( 3 ), 0.383, 'Red: ' + c.r + ' (rec2020-linear, in gamut)' );
			assert.equal( c.g.toFixed( 3 ), 0.488, 'Green: ' + c.g + ' (rec2020-linear, in gamut)' );
			assert.equal( c.b.toFixed( 3 ), 0.676, 'Blue: ' + c.b + ' (rec2020-linear, in gamut)' );

			c.setRGB( 1.0, 0.5, 0.01, LinearRec2020ColorSpace );

			assert.equal( c.r.toFixed( 3 ), 1.366, 'Red: ' + c.r + ' (srgb-linear, out of gamut)' );
			assert.equal( c.g.toFixed( 3 ), 0.442, 'Green: ' + c.g + ' (srgb-linear, out of gamut)' );
			assert.equal( c.b.toFixed( 3 ), - 0.057, 'Blue: ' + c.b + ' (srgb-linear, out of gamut)' );

			assert.equal( c.getStyle( LinearRec2020ColorSpace ), 'color(rec2020-linear 1.000 0.500 0.010)', 'style: rec2020-linear' );

		} );

	} );

} );
