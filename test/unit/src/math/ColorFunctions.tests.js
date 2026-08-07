import {
	colorAdd,
	colorApplyMatrix3,
	colorCopy,
	colorCreate,
	colorEquals,
	colorFromArray,
	colorGetHex,
	colorGetHSL,
	colorLerp,
	colorLerpColors,
	colorMultiply,
	colorMultiplyScalar,
	colorSet,
	colorSetHex,
	colorSetHSL,
	colorSetRGB,
	colorSetScalar,
	colorSetStyle,
	colorSub,
	colorToArray
} from '../../../../src/math/ColorFunctions.js';
import { Color } from '../../../../src/math/Color.js';
import { ColorManagement } from '../../../../src/math/ColorManagement.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { SRGBColorSpace } from '../../../../src/constants.js';
import { eps } from '../../utils/math-constants.js';

function colorLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.r - b.r ) <= tolerance &&
		Math.abs( a.g - b.g ) <= tolerance &&
		Math.abs( a.b - b.b ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'ColorFunctions', () => {

		const colorManagementEnabled = ColorManagement.enabled;

		QUnit.testDone( () => {

			ColorManagement.enabled = colorManagementEnabled;

		} );

		QUnit.test( 'colorCreate is a plain ColorLike, not a Color instance', ( assert ) => {

			const c = colorCreate();

			assert.strictEqual( c.r, 1, 'default r is 1' );
			assert.strictEqual( c.g, 1, 'default g is 1' );
			assert.strictEqual( c.b, 1, 'default b is 1' );
			assert.notOk( c.isColor, 'is not branded as a Color' );

		} );

		QUnit.test( 'operations work on plain objects without importing Color', ( assert ) => {

			ColorManagement.enabled = false;

			const a = colorSetRGB( 0.5, 0.25, 0.125, ColorManagement.workingColorSpace );
			const b = colorSetRGB( 0.5, 0.5, 0.5, ColorManagement.workingColorSpace );

			const sum = colorAdd( a, b );
			const product = colorMultiply( a, b );

			assert.ok( ! sum.isColor, 'add result is a plain ColorLike' );
			assert.ok( ! product.isColor, 'multiply result is a plain ColorLike' );
			assert.ok( colorLikeEquals( sum, { r: 1, g: 0.75, b: 0.625 } ), 'add matches expected' );
			assert.ok( colorLikeEquals( product, { r: 0.25, g: 0.125, b: 0.0625 } ), 'multiply matches expected' );

		} );

		QUnit.test( 'omitting the target allocates a new ColorLike, providing one reuses it', ( assert ) => {

			ColorManagement.enabled = false;

			const source = { r: 0.2, g: 0.4, b: 0.6 };

			const allocated = colorCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( colorLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = colorCreate();
			const returned = colorCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( colorLikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'add/lerp/applyMatrix3 are safe when the target aliases an input', ( assert ) => {

			ColorManagement.enabled = false;

			const a = { r: 0.2, g: 0.4, b: 0.6 };
			const b = { r: 0.1, g: 0.1, b: 0.1 };
			const expectedAdd = colorAdd( a, b );
			const expectedLerp = colorLerp( a, b, 0.5 );

			const aliasA = colorCopy( a );
			colorAdd( aliasA, b, aliasA );
			assert.ok( colorLikeEquals( aliasA, expectedAdd ), 'add with target aliasing first arg' );

			const aliasLerp = colorCopy( a );
			colorLerp( aliasLerp, b, 0.5, aliasLerp );
			assert.ok( colorLikeEquals( aliasLerp, expectedLerp ), 'lerp with target aliasing first arg' );

			const m = new Matrix3().set( 2, 0, 0, 0, 3, 0, 0, 0, 4 );
			const c = { r: 1, g: 1, b: 1 };
			const expectedMat = colorApplyMatrix3( c, m );
			colorApplyMatrix3( c, m, c );
			assert.ok( colorLikeEquals( c, expectedMat ), 'applyMatrix3 with target aliasing color' );

		} );

		QUnit.test( 'setHex/setStyle/setHSL match Color class on plain objects', ( assert ) => {

			ColorManagement.enabled = false;

			const hex = colorSetHex( 0xff0000, SRGBColorSpace );
			const style = colorSetStyle( 'rgb(0,255,0)', SRGBColorSpace );
			const hsl = colorSetHSL( 0.5, 1.0, 0.5, ColorManagement.workingColorSpace );

			assert.ok( colorLikeEquals( hex, new Color().setHex( 0xff0000 ) ), 'setHex matches class' );
			assert.ok( colorLikeEquals( style, new Color().setStyle( 'rgb(0,255,0)' ) ), 'setStyle matches class' );
			assert.ok( colorLikeEquals( hsl, new Color().setHSL( 0.5, 1.0, 0.5 ) ), 'setHSL matches class' );
			assert.ok( ! hex.isColor && ! style.isColor && ! hsl.isColor, 'results are plain ColorLike' );

		} );

		QUnit.test( 'getHex/getHSL work on plain ColorLike objects', ( assert ) => {

			ColorManagement.enabled = false;

			const c = { r: 1, g: 0.5, b: 0 };
			const hsl = { h: 0, s: 0, l: 0 };

			assert.strictEqual( colorGetHex( c ), new Color( 1, 0.5, 0 ).getHex(), 'getHex matches class' );
			colorGetHSL( c, hsl );
			assert.ok( Math.abs( hsl.h - 0.0833 ) < 0.01, 'getHSL hue in expected range' );
			assert.ok( hsl.s > 0.9, 'getHSL saturation high' );

		} );

		QUnit.test( 'sub clamps at zero', ( assert ) => {

			ColorManagement.enabled = false;

			const a = { r: 0.2, g: 0.1, b: 0.05 };
			const b = { r: 0.5, g: 0.05, b: 0.1 };
			const result = colorSub( a, b );

			assert.ok( colorLikeEquals( result, { r: 0, g: 0.05, b: 0 } ), 'components are clamped at zero' );

		} );

		QUnit.test( 'fromArray/toArray round-trip on plain objects', ( assert ) => {

			const array = [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.6 ];
			const c = colorFromArray( array, 3 );
			const out = colorToArray( c );

			assert.ok( colorLikeEquals( c, { r: 0.4, g: 0.5, b: 0.6 } ), 'fromArray with offset' );
			assert.deepEqual( out, [ 0.4, 0.5, 0.6 ], 'toArray writes components' );

		} );

		QUnit.test( 'set/setScalar/multiplyScalar/lerpColors match class', ( assert ) => {

			ColorManagement.enabled = false;

			const a = colorSet( 0.1, 0.2, 0.3 );
			const b = colorSetScalar( 0.5 );
			const c = colorMultiplyScalar( a, 2 );
			const d = colorLerpColors( a, b, 0.5 );

			assert.ok( colorLikeEquals( a, new Color().set( 0.1, 0.2, 0.3 ) ), 'set matches' );
			assert.ok( colorLikeEquals( b, new Color().setScalar( 0.5 ) ), 'setScalar matches' );
			assert.ok( colorLikeEquals( c, new Color( 0.1, 0.2, 0.3 ).multiplyScalar( 2 ) ), 'multiplyScalar matches' );
			assert.ok( colorLikeEquals( d, new Color().lerpColors( new Color( 0.1, 0.2, 0.3 ), new Color().setScalar( 0.5 ), 0.5 ) ), 'lerpColors matches' );

		} );

		QUnit.test( 'colorEquals compares components', ( assert ) => {

			assert.ok( colorEquals( { r: 1, g: 0, b: 0 }, { r: 1, g: 0, b: 0 } ), 'equal colors' );
			assert.notOk( colorEquals( { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 } ), 'unequal colors' );

		} );

		QUnit.test( 'ColorManagement.convert works on plain ColorLike', ( assert ) => {

			ColorManagement.enabled = true;

			const c = { r: 0.5, g: 0.5, b: 0.5 };
			ColorManagement.colorSpaceToWorking( c, SRGBColorSpace );

			assert.ok( typeof c.r === 'number' && typeof c.g === 'number' && typeof c.b === 'number', 'components remain numbers' );
			assert.ok( ! c.isColor, 'still a plain object' );
			assert.ok( c.r !== 0.5 || c.g !== 0.5 || c.b !== 0.5, 'sRGB conversion mutated components' );

		} );

	} );

} );
