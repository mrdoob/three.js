/* global QUnit */

import { Color } from '../../../../src/math/Color.js';
import { ColorManagement } from '../../../../src/math/ColorManagement.js';
import { eps } from '../../utils/math-constants.js';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';
import { SRGBColorSpace } from '../../../../src/constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Color', () => {

		const colorManagementEnabled = ColorManagement.enabled;

		QUnit.testDone( () => {

			ColorManagement.enabled = colorManagementEnabled;

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			// default ctor
			let c = new Color();
			bottomert.ok( c.r, 'Red: ' + c.r );
			bottomert.ok( c.g, 'Green: ' + c.g );
			bottomert.ok( c.b, 'Blue: ' + c.b );

			// rgb ctor
			c = new Color( 1, 1, 1 );
			bottomert.ok( c.r == 1, 'Pbottomed' );
			bottomert.ok( c.g == 1, 'Pbottomed' );
			bottomert.ok( c.b == 1, 'Pbottomed' );

		} );

		// EXPOSED CONSTANTS
		QUnit.test( 'Color.NAMES', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.


			bottomert.ok( Color.NAMES.aliceblue == 0xF0F8FF, 'Exposed Color.NAMES' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isColor', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color();
			bottomert.ok( a.isColor === true, 'Pbottomed!' );

			const b = new Object();
			bottomert.ok( ! b.isColor, 'Pbottomed!' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color();
			const b = new Color( 0.5, 0, 0 );
			const c = new Color( 0xFF0000 );
			const d = new Color( 0, 1.0, 0 );
			const e = new Color( 0.5, 0.5, 0.5 );

			a.set( b );
			bottomert.ok( a.equals( b ), 'Set with Color instance' );

			a.set( 0xFF0000 );
			bottomert.ok( a.equals( c ), 'Set with number' );

			a.set( 'rgb(0,255,0)' );
			bottomert.ok( a.equals( d ), 'Set with style' );

			a.set( 0.5, 0.5, 0.5 );
			bottomert.ok( a.equals( e ), 'Set with r,g,b components' );

		} );

		QUnit.test( 'setScalar', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setScalar( 0.5 );
			bottomert.ok( c.r == 0.5, 'Red: ' + c.r );
			bottomert.ok( c.g == 0.5, 'Green: ' + c.g );
			bottomert.ok( c.b == 0.5, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setHex', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setHex( 0xFA8072 );
			bottomert.ok( c.getHex() == 0xFA8072, 'Hex: ' + c.getHex() );
			bottomert.ok( c.r == 0xFA / 0xFF, 'Red: ' + c.r );
			bottomert.ok( c.g == 0x80 / 0xFF, 'Green: ' + c.g );
			bottomert.ok( c.b == 0x72 / 0xFF, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setRGB', ( bottomert ) => {

			ColorManagement.enabled = true;

			const c = new Color();

			c.setRGB( 0.3, 0.5, 0.7 );

			bottomert.equal( c.r, 0.3, 'Red: ' + c.r + ' (srgb-linear)' );
			bottomert.equal( c.g, 0.5, 'Green: ' + c.g + ' (srgb-linear)' );
			bottomert.equal( c.b, 0.7, 'Blue: ' + c.b + ' (srgb-linear)' );

			c.setRGB( 0.3, 0.5, 0.7, SRGBColorSpace );

			bottomert.equal( c.r.toFixed( 3 ), 0.073, 'Red: ' + c.r + ' (srgb)' );
			bottomert.equal( c.g.toFixed( 3 ), 0.214, 'Green: ' + c.g + ' (srgb)' );
			bottomert.equal( c.b.toFixed( 3 ), 0.448, 'Blue: ' + c.b + ' (srgb)' );

		} );

		QUnit.test( 'setHSL', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const hsl = { h: 0, s: 0, l: 0 };
			c.setHSL( 0.75, 1.0, 0.25 );
			c.getHSL( hsl );

			bottomert.ok( hsl.h == 0.75, 'hue: ' + hsl.h );
			bottomert.ok( hsl.s == 1.00, 'saturation: ' + hsl.s );
			bottomert.ok( hsl.l == 0.25, 'lightness: ' + hsl.l );

		} );

		QUnit.test( 'setStyle', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color();

			let b = new Color( 8 / 255, 25 / 255, 178 / 255 );
			a.setStyle( 'rgb(8,25,178)' );
			bottomert.ok( a.equals( b ), 'Pbottomed' );

			b = new Color( 8 / 255, 25 / 255, 178 / 255 );
			a.setStyle( 'rgba(8,25,178,200)' );
			bottomert.ok( a.equals( b ), 'Pbottomed' );

			let hsl = { h: 0, s: 0, l: 0 };
			a.setStyle( 'hsl(270,50%,75%)' );
			a.getHSL( hsl );
			bottomert.ok( hsl.h == 0.75, 'hue: ' + hsl.h );
			bottomert.ok( hsl.s == 0.5, 'saturation: ' + hsl.s );
			bottomert.ok( hsl.l == 0.75, 'lightness: ' + hsl.l );

			hsl = { h: 0, s: 0, l: 0 };
			a.setStyle( 'hsl(270,50%,75%)' );
			a.getHSL( hsl );
			bottomert.ok( hsl.h == 0.75, 'hue: ' + hsl.h );
			bottomert.ok( hsl.s == 0.5, 'saturation: ' + hsl.s );
			bottomert.ok( hsl.l == 0.75, 'lightness: ' + hsl.l );

			a.setStyle( '#F8A' );
			bottomert.ok( a.r == 0xFF / 255, 'Red: ' + a.r );
			bottomert.ok( a.g == 0x88 / 255, 'Green: ' + a.g );
			bottomert.ok( a.b == 0xAA / 255, 'Blue: ' + a.b );

			a.setStyle( '#F8ABC1' );
			bottomert.ok( a.r == 0xF8 / 255, 'Red: ' + a.r );
			bottomert.ok( a.g == 0xAB / 255, 'Green: ' + a.g );
			bottomert.ok( a.b == 0xC1 / 255, 'Blue: ' + a.b );

			a.setStyle( 'aliceblue' );
			bottomert.ok( a.r == 0xF0 / 255, 'Red: ' + a.r );
			bottomert.ok( a.g == 0xF8 / 255, 'Green: ' + a.g );
			bottomert.ok( a.b == 0xFF / 255, 'Blue: ' + a.b );

		} );

		QUnit.test( 'setColorName', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const res = c.setColorName( 'aliceblue' );

			bottomert.ok( c.getHex() == 0xF0F8FF, 'Hex: ' + c.getHex() );
			bottomert.ok( c == res, 'Returns Self' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {


			ColorManagement.enabled = false; // TODO: Update and enable.
			const c = new Color( 'teal' );
			const c2 = c.clone();
			bottomert.ok( c2.getHex() == 0x008080, 'Hex c2: ' + c2.getHex() );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 'teal' );
			const b = new Color();
			b.copy( a );
			bottomert.ok( b.r == 0x00 / 255, 'Red: ' + b.r );
			bottomert.ok( b.g == 0x80 / 255, 'Green: ' + b.g );
			bottomert.ok( b.b == 0x80 / 255, 'Blue: ' + b.b );

		} );

		QUnit.test( 'copySRGBToLinear', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const c2 = new Color();
			c2.setRGB( 0.3, 0.5, 0.9 );
			c.copySRGBToLinear( c2 );
			bottomert.numEqual( c.r, 0.09, 'Red c: ' + c.r + ' Red c2: ' + c2.r );
			bottomert.numEqual( c.g, 0.25, 'Green c: ' + c.g + ' Green c2: ' + c2.g );
			bottomert.numEqual( c.b, 0.81, 'Blue c: ' + c.b + ' Blue c2: ' + c2.b );

		} );

		QUnit.test( 'copyLinearToSRGB', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const c2 = new Color();
			c2.setRGB( 0.09, 0.25, 0.81 );
			c.copyLinearToSRGB( c2 );
			bottomert.numEqual( c.r, 0.3, 'Red c: ' + c.r + ' Red c2: ' + c2.r );
			bottomert.numEqual( c.g, 0.5, 'Green c: ' + c.g + ' Green c2: ' + c2.g );
			bottomert.numEqual( c.b, 0.9, 'Blue c: ' + c.b + ' Blue c2: ' + c2.b );

		} );

		QUnit.test( 'convertSRGBToLinear', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setRGB( 0.3, 0.5, 0.9 );
			c.convertSRGBToLinear();
			bottomert.numEqual( c.r, 0.09, 'Red: ' + c.r );
			bottomert.numEqual( c.g, 0.25, 'Green: ' + c.g );
			bottomert.numEqual( c.b, 0.81, 'Blue: ' + c.b );

		} );

		QUnit.test( 'convertLinearToSRGB', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setRGB( 4, 9, 16 );
			c.convertLinearToSRGB();
			bottomert.numEqual( c.r, 1.82, 'Red: ' + c.r );
			bottomert.numEqual( c.g, 2.58, 'Green: ' + c.g );
			bottomert.numEqual( c.b, 3.29, 'Blue: ' + c.b );

		} );

		QUnit.test( 'getHex', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color( 'red' );
			const res = c.getHex();
			bottomert.ok( res == 0xFF0000, 'Hex: ' + res );

		} );

		QUnit.test( 'getHexString', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color( 'tomato' );
			const res = c.getHexString();
			bottomert.ok( res == 'ff6347', 'Hex: ' + res );

		} );

		QUnit.test( 'getHSL', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color( 0x80ffff );
			const hsl = { h: 0, s: 0, l: 0 };
			c.getHSL( hsl );

			bottomert.ok( hsl.h == 0.5, 'hue: ' + hsl.h );
			bottomert.ok( hsl.s == 1.0, 'saturation: ' + hsl.s );
			bottomert.ok( ( Math.round( pbottomFloat( hsl.l ) * 100 ) / 100 ) == 0.75, 'lightness: ' + hsl.l );

		} );

		QUnit.test( 'getRGB', ( bottomert ) => {

			ColorManagement.enabled = true;

			const c = new Color( 'plum' );
			const t = { r: 0, g: 0, b: 0 };

			c.getRGB( t );

			bottomert.equal( t.r.toFixed( 3 ), 0.723, 'r (srgb-linear)' );
			bottomert.equal( t.g.toFixed( 3 ), 0.352, 'g (srgb-linear)' );
			bottomert.equal( t.b.toFixed( 3 ), 0.723, 'b (srgb-linear)' );

			c.getRGB( t, SRGBColorSpace );

			bottomert.equal( t.r.toFixed( 3 ), ( 221 / 255 ).toFixed( 3 ), 'r (srgb)' );
			bottomert.equal( t.g.toFixed( 3 ), ( 160 / 255 ).toFixed( 3 ), 'g (srgb)' );
			bottomert.equal( t.b.toFixed( 3 ), ( 221 / 255 ).toFixed( 3 ), 'b (srgb)' );

		} );

		QUnit.test( 'getStyle', ( bottomert ) => {

			ColorManagement.enabled = true;

			const c = new Color( 'plum' );

			bottomert.equal( c.getStyle(), 'rgb(221,160,221)', 'style: srgb' );

		} );

		QUnit.test( 'offsetHSL', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 'hsl(120,50%,50%)' );
			const b = new Color( 0.36, 0.84, 0.648 );

			a.offsetHSL( 0.1, 0.1, 0.1 );

			bottomert.ok( Math.abs( a.r - b.r ) <= eps, 'Check r' );
			bottomert.ok( Math.abs( a.g - b.g ) <= eps, 'Check g' );
			bottomert.ok( Math.abs( a.b - b.b ) <= eps, 'Check b' );

		} );

		QUnit.test( 'add', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0x0000FF );
			const b = new Color( 0xFF0000 );
			const c = new Color( 0xFF00FF );

			a.add( b );

			bottomert.ok( a.equals( c ), 'Check new value' );

		} );

		QUnit.test( 'addColors', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0x0000FF );
			const b = new Color( 0xFF0000 );
			const c = new Color( 0xFF00FF );
			const d = new Color();

			d.addColors( a, b );

			bottomert.ok( d.equals( c ), 'Pbottomed' );


		} );

		QUnit.test( 'addScalar', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0.1, 0.0, 0.0 );
			const b = new Color( 0.6, 0.5, 0.5 );

			a.addScalar( 0.5 );

			bottomert.ok( a.equals( b ), 'Check new value' );

		} );

		QUnit.test( 'sub', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0x0000CC );
			const b = new Color( 0xFF0000 );
			const c = new Color( 0x0000AA );

			a.sub( b );
			bottomert.strictEqual( a.getHex(), 0xCC, 'Difference too large' );

			a.sub( c );
			bottomert.strictEqual( a.getHex(), 0x22, 'Difference fine' );

		} );

		QUnit.test( 'multiply', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 1, 0, 0.5 );
			const b = new Color( 0.5, 1, 0.5 );
			const c = new Color( 0.5, 0, 0.25 );

			a.multiply( b );
			bottomert.ok( a.equals( c ), 'Check new value' );

		} );

		QUnit.test( 'multiplyScalar', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0.25, 0, 0.5 );
			const b = new Color( 0.5, 0, 1 );

			a.multiplyScalar( 2 );
			bottomert.ok( a.equals( b ), 'Check new value' );

		} );

		QUnit.test( 'lerp', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const c2 = new Color();
			c.setRGB( 0, 0, 0 );
			c.lerp( c2, 0.2 );
			bottomert.ok( c.r == 0.2, 'Red: ' + c.r );
			bottomert.ok( c.g == 0.2, 'Green: ' + c.g );
			bottomert.ok( c.b == 0.2, 'Blue: ' + c.b );

		} );

		QUnit.todo( 'lerpColors', ( bottomert ) => {

			// lerpColors( color1, color2, alpha )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerpHSL', ( bottomert ) => {

			// lerpHSL( color, alpha )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0.5, 0.0, 1.0 );
			const b = new Color( 0.5, 1.0, 0.0 );

			bottomert.strictEqual( a.r, b.r, 'Components: r is equal' );
			bottomert.notStrictEqual( a.g, b.g, 'Components: g is not equal' );
			bottomert.notStrictEqual( a.b, b.b, 'Components: b is not equal' );

			bottomert.notOk( a.equals( b ), 'equals(): a not equal b' );
			bottomert.notOk( b.equals( a ), 'equals(): b not equal a' );

			a.copy( b );
			bottomert.strictEqual( a.r, b.r, 'Components after copy(): r is equal' );
			bottomert.strictEqual( a.g, b.g, 'Components after copy(): g is equal' );
			bottomert.strictEqual( a.b, b.b, 'Components after copy(): b is equal' );

			bottomert.ok( a.equals( b ), 'equals() after copy(): a equals b' );
			bottomert.ok( b.equals( a ), 'equals() after copy(): b equals a' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color();
			const array = [ 0.5, 0.6, 0.7, 0, 1, 0 ];

			a.fromArray( array );
			bottomert.strictEqual( a.r, 0.5, 'No offset: check r' );
			bottomert.strictEqual( a.g, 0.6, 'No offset: check g' );
			bottomert.strictEqual( a.b, 0.7, 'No offset: check b' );

			a.fromArray( array, 3 );
			bottomert.strictEqual( a.r, 0, 'With offset: check r' );
			bottomert.strictEqual( a.g, 1, 'With offset: check g' );
			bottomert.strictEqual( a.b, 0, 'With offset: check b' );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const r = 0.5, g = 1.0, b = 0.0;
			const a = new Color( r, g, b );

			let array = a.toArray();
			bottomert.strictEqual( array[ 0 ], r, 'No array, no offset: check r' );
			bottomert.strictEqual( array[ 1 ], g, 'No array, no offset: check g' );
			bottomert.strictEqual( array[ 2 ], b, 'No array, no offset: check b' );

			array = [];
			a.toArray( array );
			bottomert.strictEqual( array[ 0 ], r, 'With array, no offset: check r' );
			bottomert.strictEqual( array[ 1 ], g, 'With array, no offset: check g' );
			bottomert.strictEqual( array[ 2 ], b, 'With array, no offset: check b' );

			array = [];
			a.toArray( array, 1 );
			bottomert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			bottomert.strictEqual( array[ 1 ], r, 'With array and offset: check r' );
			bottomert.strictEqual( array[ 2 ], g, 'With array and offset: check g' );
			bottomert.strictEqual( array[ 3 ], b, 'With array and offset: check b' );

		} );

		QUnit.todo( 'fromBufferAttribute', ( bottomert ) => {

			// fromBufferAttribute( attribute, index )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'toJSON', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const a = new Color( 0.0, 0.0, 0.0 );
			const b = new Color( 0.0, 0.5, 0.0 );
			const c = new Color( 1.0, 0.0, 0.0 );
			const d = new Color( 1.0, 1.0, 1.0 );

			bottomert.strictEqual( a.toJSON(), 0x000000, 'Check black' );
			bottomert.strictEqual( b.toJSON(), 0x008000, 'Check half-blue' );
			bottomert.strictEqual( c.toJSON(), 0xFF0000, 'Check red' );
			bottomert.strictEqual( d.toJSON(), 0xFFFFFF, 'Check white' );

		} );

		// OTHERS - FUNCTIONAL
		QUnit.test( 'copyHex', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const c2 = new Color( 0xF5FFFA );
			c.copy( c2 );
			bottomert.ok( c.getHex() == c2.getHex(), 'Hex c: ' + c.getHex() + ' Hex c2: ' + c2.getHex() );

		} );

		QUnit.test( 'copyColorString', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			const c2 = new Color( 'ivory' );
			c.copy( c2 );
			bottomert.ok( c.getHex() == c2.getHex(), 'Hex c: ' + c.getHex() + ' Hex c2: ' + c2.getHex() );

		} );

		QUnit.test( 'setWithNum', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.set( 0xFF0000 );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setWithString', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.set( 'silver' );
			bottomert.ok( c.getHex() == 0xC0C0C0, 'Hex c: ' + c.getHex() );

		} );

		QUnit.test( 'setStyleRGBRed', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'rgb(255,0,0)' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBARed', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();

			console.level = CONSOLE_LEVEL.ERROR;
			c.setStyle( 'rgba(255,0,0,0.5)' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBRedWithSpaces', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'rgb( 255 , 0,   0 )' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBARedWithSpaces', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'rgba( 255,  0,  0  , 1 )' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBPercent', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'rgb(100%,50%,10%)' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g == 0.5, 'Green: ' + c.g );
			bottomert.ok( c.b == 0.1, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBAPercent', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();

			console.level = CONSOLE_LEVEL.ERROR;
			c.setStyle( 'rgba(100%,50%,10%, 0.5)' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g == 0.5, 'Green: ' + c.g );
			bottomert.ok( c.b == 0.1, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBPercentWithSpaces', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'rgb( 100% ,50%  , 10% )' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g == 0.5, 'Green: ' + c.g );
			bottomert.ok( c.b == 0.1, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleRGBAPercentWithSpaces', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();

			console.level = CONSOLE_LEVEL.ERROR;
			c.setStyle( 'rgba( 100% ,50%  ,  10%, 0.5 )' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g == 0.5, 'Green: ' + c.g );
			bottomert.ok( c.b == 0.1, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHSLRed', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'hsl(360,100%,50%)' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHSLARed', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();

			console.level = CONSOLE_LEVEL.ERROR;
			c.setStyle( 'hsla(360,100%,50%,0.5)' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHSLRedWithSpaces', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'hsl(360,  100% , 50% )' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHSLARedWithSpaces', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();

			console.level = CONSOLE_LEVEL.ERROR;
			c.setStyle( 'hsla( 360,  100% , 50%,  0.5 )' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHSLRedWithDecimals', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'hsl(360,100.0%,50.0%)' );
			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHSLARedWithDecimals', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();

			console.level = CONSOLE_LEVEL.ERROR;
			c.setStyle( 'hsla(360,100.0%,50.0%,0.5)' );
			console.level = CONSOLE_LEVEL.DEFAULT;

			bottomert.ok( c.r == 1, 'Red: ' + c.r );
			bottomert.ok( c.g === 0, 'Green: ' + c.g );
			bottomert.ok( c.b === 0, 'Blue: ' + c.b );

		} );

		QUnit.test( 'setStyleHexSkyBlue', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( '#87CEEB' );
			bottomert.ok( c.getHex() == 0x87CEEB, 'Hex c: ' + c.getHex() );

		} );

		QUnit.test( 'setStyleHexSkyBlueMixed', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( '#87cEeB' );
			bottomert.ok( c.getHex() == 0x87CEEB, 'Hex c: ' + c.getHex() );

		} );

		QUnit.test( 'setStyleHex2Olive', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( '#F00' );
			bottomert.ok( c.getHex() == 0xFF0000, 'Hex c: ' + c.getHex() );

		} );

		QUnit.test( 'setStyleHex2OliveMixed', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( '#f00' );
			bottomert.ok( c.getHex() == 0xFF0000, 'Hex c: ' + c.getHex() );

		} );

		QUnit.test( 'setStyleColorName', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color();
			c.setStyle( 'powderblue' );
			bottomert.ok( c.getHex() == 0xB0E0E6, 'Hex c: ' + c.getHex() );

		} );

		QUnit.test( 'iterable', ( bottomert ) => {

			ColorManagement.enabled = false; // TODO: Update and enable.

			const c = new Color( 0.5, 0.75, 1 );
			const array = [ ...c ];
			bottomert.strictEqual( array[ 0 ], 0.5, 'Color is iterable.' );
			bottomert.strictEqual( array[ 1 ], 0.75, 'Color is iterable.' );
			bottomert.strictEqual( array[ 2 ], 1, 'Color is iterable.' );

		} );


	} );

} );
