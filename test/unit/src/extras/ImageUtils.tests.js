import { ImageUtils } from '../../../../src/extras/ImageUtils.js';
import { SRGBToLinear } from '../../../../src/math/ColorManagement.js';

// These tests need a real canvas, so they only run in a browser environment --
// which is how the suite is executed (see test/unit/README.md).
function makeCanvas( width = 2, height = 2, fill = 'rgb(128, 64, 32)' ) {

	const canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext( '2d' );
	context.fillStyle = fill;
	context.fillRect( 0, 0, width, height );

	return canvas;

}

export default QUnit.module( 'Extras', () => {

	QUnit.module( 'ImageUtils', () => {

		// getDataURL
		QUnit.test( 'getDataURL - returns an existing data URI unchanged', ( assert ) => {

			// Re-encoding through a canvas would be lossy and pointless when the
			// source is already a data URI.
			const src = 'data:image/png;base64,iVBORw0KGgo=';

			assert.strictEqual( ImageUtils.getDataURL( { src } ), src, 'the source is passed straight through' );

		} );

		QUnit.test( 'getDataURL - matches a data URI case-insensitively', ( assert ) => {

			const src = 'DATA:image/png;base64,iVBORw0KGgo=';

			assert.strictEqual( ImageUtils.getDataURL( { src } ), src, 'an upper-case scheme is still recognised' );

		} );

		QUnit.test( 'getDataURL - encodes a canvas directly', ( assert ) => {

			const canvas = makeCanvas();
			const url = ImageUtils.getDataURL( canvas );

			assert.ok( url.startsWith( 'data:image/png' ), 'a PNG data URI is produced by default' );
			assert.strictEqual( url, canvas.toDataURL( 'image/png' ), 'the canvas is encoded without an intermediate copy' );

		} );

		QUnit.test( 'getDataURL - honours the requested MIME type', ( assert ) => {

			const url = ImageUtils.getDataURL( makeCanvas(), 'image/jpeg' );

			assert.ok( url.startsWith( 'data:image/jpeg' ), 'a JPEG data URI is produced' );

		} );

		QUnit.test( 'getDataURL - draws other image sources onto a scratch canvas', ( assert ) => {

			// ImageData is not a canvas, so it takes the putImageData path
			// through the module's shared scratch canvas.
			const imageData = new ImageData( 2, 2 );

			for ( let i = 0; i < imageData.data.length; i += 4 ) {

				imageData.data[ i ] = 255;
				imageData.data[ i + 3 ] = 255;

			}

			const url = ImageUtils.getDataURL( imageData );

			assert.ok( url.startsWith( 'data:image/png' ), 'a PNG data URI is produced' );

			// Decoding the result back has to give the red we put in.
			const canvas = document.createElement( 'canvas' );
			canvas.width = 2;
			canvas.height = 2;
			const context = canvas.getContext( '2d' );
			context.putImageData( imageData, 0, 0 );

			assert.strictEqual( url, canvas.toDataURL( 'image/png' ), 'the pixels survive the round trip' );

		} );

		// sRGBToLinear
		QUnit.test( 'sRGBToLinear - converts a canvas in place of the original', ( assert ) => {

			const canvas = makeCanvas( 1, 1, 'rgb(188, 188, 188)' );
			const result = ImageUtils.sRGBToLinear( canvas );

			assert.ok( result instanceof HTMLCanvasElement, 'a canvas is returned' );
			assert.notStrictEqual( result, canvas, 'the source canvas is not modified' );
			assert.strictEqual( result.width, 1, 'the width is preserved' );
			assert.strictEqual( result.height, 1, 'the height is preserved' );

			const [ r ] = result.getContext( '2d', { willReadFrequently: true } ).getImageData( 0, 0, 1, 1 ).data;

			// 188/255 in sRGB is roughly 0.5 linear, so the byte drops sharply.
			// The canvas stores whole bytes, so allow a rounding step either way.
			const expected = SRGBToLinear( 188 / 255 ) * 255;
			assert.ok( Math.abs( r - expected ) <= 1, `the channel is converted to linear (${ r } vs ${ expected.toFixed( 2 ) })` );
			assert.ok( r < 188, 'a mid-grey gets darker in linear space' );

		} );

		QUnit.test( 'sRGBToLinear - leaves the extremes untouched', ( assert ) => {

			// The transfer function fixes 0 and 1, so black and white survive.
			const black = ImageUtils.sRGBToLinear( makeCanvas( 1, 1, 'rgb(0, 0, 0)' ) );
			const white = ImageUtils.sRGBToLinear( makeCanvas( 1, 1, 'rgb(255, 255, 255)' ) );

			assert.strictEqual( black.getContext( '2d', { willReadFrequently: true } ).getImageData( 0, 0, 1, 1 ).data[ 0 ], 0, 'black stays black' );
			assert.strictEqual( white.getContext( '2d', { willReadFrequently: true } ).getImageData( 0, 0, 1, 1 ).data[ 0 ], 255, 'white stays white' );

		} );

		QUnit.test( 'sRGBToLinear - converts a byte data object without mutating it', ( assert ) => {

			const image = { data: new Uint8Array( [ 0, 128, 255, 255 ] ), width: 1, height: 1 };
			const result = ImageUtils.sRGBToLinear( image );

			assert.notStrictEqual( result, image, 'a new object is returned' );
			assert.deepEqual( Array.from( image.data ), [ 0, 128, 255, 255 ], 'the source data is untouched' );
			assert.strictEqual( result.width, 1, 'the width is carried over' );
			assert.strictEqual( result.height, 1, 'the height is carried over' );

			assert.strictEqual( result.data[ 0 ], 0, 'zero stays zero' );
			assert.strictEqual( result.data[ 1 ], Math.floor( SRGBToLinear( 128 / 255 ) * 255 ), 'the mid value is converted and floored' );
			assert.strictEqual( result.data[ 2 ], 255, 'the maximum stays at the maximum' );

		} );

		QUnit.test( 'sRGBToLinear - converts float data without the 0-255 scaling', ( assert ) => {

			// Float images already hold normalised values, so they are fed to
			// the transfer function directly.
			const image = { data: new Float32Array( [ 0, 0.5, 1 ] ), width: 3, height: 1 };
			const result = ImageUtils.sRGBToLinear( image );

			assert.numEqual( result.data[ 0 ], 0, 'zero stays zero' );
			assert.numEqual( result.data[ 1 ], SRGBToLinear( 0.5 ), 'the mid value is converted directly' );
			assert.numEqual( result.data[ 2 ], 1, 'one stays one' );

		} );

		QUnit.test( 'sRGBToLinear - preserves the data array type', ( assert ) => {

			const bytes = ImageUtils.sRGBToLinear( { data: new Uint8Array( [ 128 ] ), width: 1, height: 1 } );
			const floats = ImageUtils.sRGBToLinear( { data: new Float32Array( [ 0.5 ] ), width: 1, height: 1 } );

			assert.ok( bytes.data instanceof Uint8Array, 'byte data stays a Uint8Array' );
			assert.ok( floats.data instanceof Float32Array, 'float data stays a Float32Array' );

		} );

		QUnit.test( 'sRGBToLinear - returns an unsupported image unchanged and warns', ( assert ) => {

			// The warning is captured rather than merely silenced, so the "and
			// warns" half of this test's name is actually asserted. The console
			// wrapper routes through console._warn, so swapping that out records
			// the message without printing it. Restored in `finally` so a failure
			// here cannot leave the rest of the suite with a patched console.
			const warnings = [];
			const originalWarn = console._warn;
			console._warn = ( ...args ) => warnings.push( args.join( ' ' ) );

			const image = { width: 1, height: 1 };
			let result;

			try {

				result = ImageUtils.sRGBToLinear( image );

			} finally {

				console._warn = originalWarn;

			}

			assert.strictEqual( result, image, 'the image is passed through untouched' );
			assert.strictEqual( warnings.length, 1, 'exactly one warning is emitted' );
			assert.ok( warnings[ 0 ].includes( 'sRGBToLinear' ), 'the warning names the function that could not convert' );

		} );

	} );

} );
