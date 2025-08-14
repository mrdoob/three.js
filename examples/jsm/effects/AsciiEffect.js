/**
 * A class that creates an ASCII effect.
 *
 * The ASCII generation is based on [jsascii]{@link https://github.com/hassadee/jsascii/blob/master/jsascii.js}.
 *
 * @three_import import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
 */
class AsciiEffect {

	/**
	 * Constructs a new ASCII effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {AsciiEffect~Options} [options] - The configuration parameter.
	 */
	constructor( renderer, options = {} ) {

		// ' .,:;=|iI+hHOE#`$';
		// darker bolder character set from https://github.com/saw/Canvas-ASCII-Art/
		// ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split('');

		let fResolution = options[ 'resolution' ] || 0.15;
		let bColor = options[ 'color' ] || false;
		let bAlpha = options[ 'alpha' ] || false;
		let bBlock = options[ 'block' ] || false;
		let bInvert = options[ 'invert' ] || false;
		let strFont = options[ 'fontFamily' ] || 'Courier New, monospace';
		let strCharSet = options[ 'charSet' ] || ' .:-=+*#%@';
		let iFontWeight = options[ 'fontWeight' ] || 400;
		let fCharScale = options[ 'charScale' ] || 1.0;

		// Cache for letter spacing calculation optimization
		// Only recalculates when font-related parameters change
		let cachedLetterSpacing = null;
		let lastFontConfig = null;

		// Memory management flags
		let isDisposed = false;

		let width, height;

		const domElement = document.createElement( 'div' );
		domElement.style.cursor = 'default';

		const oAscii = document.createElement( 'table' );
		domElement.appendChild( oAscii );

		let iWidth, iHeight;
		let oImg;

		// String buffer for reusing memory in ASCII generation
		const stringBuffer = [];

		/**
		 * Resizes the effect.
		 *
		 * @param {number} w - The width of the effect in logical pixels.
		 * @param {number} h - The height of the effect in logical pixels.
		 */
		this.setSize = function ( w, h ) {

			if ( isDisposed ) return;

			width = w;
			height = h;

			renderer.setSize( w, h );
			renderer.setPixelRatio( fResolution );

			initAsciiSize();

		};

		/**
		 * When using this effect, this method should be called instead of the
		 * default {@link WebGLRenderer#render}.
		 *
		 * @param {Object3D} scene - The scene to render.
		 * @param {Camera} camera - The camera.
		 */
		this.render = function ( scene, camera ) {

			if ( isDisposed ) return;

			renderer.render( scene, camera );

			asciifyImage( oAscii );

		};

		/**
		 * The DOM element of the effect. This element must be used instead of the
		 * default {@link WebGLRenderer#domElement}.
		 *
		 * @type {HTMLDivElement}
		 */
		this.domElement = domElement;

		/**
		 * Updates visual settings, font parameters, and resolution.
		 *
		 * @param {Object} newSettings - Object containing the new settings.
		 */
		this.updateVisualSettings = function ( newSettings ) {

			if ( isDisposed ) return;

			let needsFontRecalculation = false;
			let needsResolutionUpdate = false;

			if ( newSettings.color !== undefined ) bColor = newSettings.color;
			if ( newSettings.alpha !== undefined ) bAlpha = newSettings.alpha;
			if ( newSettings.block !== undefined ) bBlock = newSettings.block;
			if ( newSettings.invert !== undefined ) bInvert = newSettings.invert;

			if ( newSettings.charSet !== undefined ) {

				strCharSet = newSettings.charSet;
				aCharList = strCharSet.split( '' );

			}

			// Handle resolution updates
			if ( newSettings.resolution !== undefined ) {

				fResolution = newSettings.resolution;
				renderer.setPixelRatio( fResolution );
				needsResolutionUpdate = true;

			}

			// Handle font-related parameters that require recalculation
			if ( newSettings.charScale !== undefined ) {

				fCharScale = newSettings.charScale;
				needsFontRecalculation = true;

			}

			if ( newSettings.fontFamily !== undefined ) {

				strFont = newSettings.fontFamily;
				needsFontRecalculation = true;

			}

			if ( newSettings.fontWeight !== undefined ) {

				iFontWeight = newSettings.fontWeight;
				needsFontRecalculation = true;

			}

			if ( needsResolutionUpdate ) {

				initAsciiSize();

			}

			// Force recalculation of letter spacing since font parameters changed
			if ( needsFontRecalculation ) {

				cachedLetterSpacing = null;

			}

		};

		// Throw in ascii library from https://github.com/hassadee/jsascii/blob/master/jsascii.js (MIT License)

		function initAsciiSize() {

			if ( isDisposed ) return;

			iWidth = Math.floor( width * fResolution );
			iHeight = Math.floor( height * fResolution );

			oCanvas.width = iWidth;
			oCanvas.height = iHeight;
			// oCanvas.style.display = "none";
			// oCanvas.style.width = iWidth;
			// oCanvas.style.height = iHeight;

			oImg = renderer.domElement;

			if ( oImg.style.backgroundColor ) {

				oAscii.rows[ 0 ].cells[ 0 ].style.backgroundColor = oImg.style.backgroundColor;
				oAscii.rows[ 0 ].cells[ 0 ].style.color = oImg.style.color;

			}

			oAscii.cellSpacing = '0';
			oAscii.cellPadding = '0';

			const oStyle = oAscii.style;
			oStyle.whiteSpace = 'pre';
			oStyle.margin = '0px';
			oStyle.padding = '0px';
			oStyle.fontFamily = strFont.toLowerCase();
			oStyle.fontWeight = iFontWeight;
			oStyle.fontSize = strFontSize;
			oStyle.lineHeight = fLineHeight + 'px';
			oStyle.textAlign = 'left';
			oStyle.textDecoration = 'none';

			// Create a configuration key for font-related parameters that affect letter spacing
			const currentFontConfig = {
				fontFamily: strFont.toLowerCase(),
				fontSize: strFontSize,
				fontWeight: iFontWeight,
				charScale: fCharScale,
				lineHeight: fLineHeight
			};
			const fontConfigKey = JSON.stringify( currentFontConfig );

			// Only recalculate letter spacing if font configuration changed
			let optimalLetterSpacing;
			if ( cachedLetterSpacing === null || lastFontConfig === null || JSON.stringify( lastFontConfig ) !== fontConfigKey ) {

				optimalLetterSpacing = calculateLetterSpacing(
					currentFontConfig.fontFamily,
					currentFontConfig.fontSize,
					currentFontConfig.fontWeight,
					currentFontConfig.lineHeight
				);

				// Cache the results
				cachedLetterSpacing = optimalLetterSpacing;
				lastFontConfig = currentFontConfig;

			} else {

				optimalLetterSpacing = cachedLetterSpacing;

			}

			oStyle.letterSpacing = optimalLetterSpacing + 'em';

		}

		const oCanvasImg = renderer.domElement;

		const oCanvas = document.createElement( 'canvas' );
		if ( ! oCanvas.getContext ) {

			return;

		}

		const oCtx = oCanvas.getContext( '2d' );
		if ( ! oCtx.getImageData ) {

			return;

		}

		let aCharList;
		if ( options[ 'charSet' ] ) {

			aCharList = ( strCharSet ).split( '' );

		} else {

			const aDefaultCharList = ( ' .:-=+*#%@' ).split( '' );
			const aDefaultColorCharList = ( ' CGO08@' ).split( '' );
			aCharList = ( bColor ? aDefaultColorCharList : aDefaultCharList );

		}

		// Apply character scaling to font size (fully dynamic calculation)
		const baseFontSize = 2 / fResolution;
		const strFontSize = ( baseFontSize * fCharScale ) + 'px';

		const fLineHeight = ( 2 / fResolution );

		// Calculate letter spacing for monospace fonts, so that each character fits in a perfect square
		function calculateLetterSpacing( fontFamily, fontSize, fontWeight, lineHeight ) {

			// Create a temporary DOM element to measure actual rendered spacing
			const testElement = document.createElement( 'div' );
			testElement.style.position = 'absolute';
			testElement.style.visibility = 'hidden';
			testElement.style.fontFamily = fontFamily;
			testElement.style.fontSize = fontSize;
			testElement.style.fontWeight = fontWeight;
			testElement.style.lineHeight = lineHeight + 'px';
			testElement.style.margin = '0';
			testElement.style.padding = '0';
			testElement.style.whiteSpace = 'pre';
			testElement.style.letterSpacing = '0px';

			// Test with two characters side by side to measure horizontal spacing
			// Any character works here if the font is truly monospace
			const testChar = 'M';
			testElement.innerHTML = testChar + testChar;
			document.body.appendChild( testElement );

			// Get the actual dimensions using getBoundingClientRect for precise measurements
			const rect = testElement.getBoundingClientRect();
			const elementWidth = rect.width;

			// Clean up
			document.body.removeChild( testElement );

			// Calculate the letter-spacing adjustment needed
			const letterSpacingAdjustment = lineHeight - ( elementWidth / 2 );

			// Convert to em units (relative to the current scaled font size)
			const fontSizeValue = parseFloat( fontSize );
			const letterSpacingInEm = letterSpacingAdjustment / fontSizeValue;

			return letterSpacingInEm;

		}

		// can't get a span or div to flow like an img element, but a table works?

		// HTML escaping function to prevent XSS
		function escapeHtml( text ) {

			const map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				'\'': '&#39;'
			};

			return text.replace( /[&<>"']/g, function ( m ) {

				return map[ m ];

			} );

		}

		// convert img element to ascii

		function asciifyImage( oAscii ) {

			if ( isDisposed ) return;

			oCtx.clearRect( 0, 0, iWidth, iHeight );
			oCtx.drawImage( oCanvasImg, 0, 0, iWidth, iHeight );
			const oImgData = oCtx.getImageData( 0, 0, iWidth, iHeight ).data;

			// Calculate expected buffer size for optimization
			const expectedPixels = Math.floor( iHeight / 2 ) * ( Math.floor( iWidth / 2 ) + 1 ); // +1 for <br/> tags

			// Reuse string buffer to avoid massive string allocations
			// Only resize if needed
			if ( stringBuffer.length < expectedPixels || stringBuffer.length > expectedPixels * 2 ) {

				stringBuffer.length = expectedPixels;

			}

			let bufferIndex = 0;

			// console.time('rendering');

			for ( let y = 0; y < iHeight; y += 2 ) {

				for ( let x = 0; x < iWidth; x += 2 ) {

					const iOffset = ( y * iWidth + x ) * 4;

					const iRed = oImgData[ iOffset ];
					const iGreen = oImgData[ iOffset + 1 ];
					const iBlue = oImgData[ iOffset + 2 ];
					const iAlpha = oImgData[ iOffset + 3 ];
					let iCharIdx;

					let fBrightness;

					fBrightness = ( 0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue ) / 255;

					if ( iAlpha == 0 ) {

						// should calculate alpha instead, but quick hack :)
						//fBrightness *= (iAlpha / 255);
						fBrightness = 1;

					}

					iCharIdx = Math.floor( ( 1 - fBrightness ) * ( aCharList.length - 1 ) );

					if ( bInvert ) {

						iCharIdx = aCharList.length - iCharIdx - 1;

					}

					// good for debugging
					//fBrightness = Math.floor(fBrightness * 10);
					//strThisChar = fBrightness;

					let strThisChar = aCharList[ iCharIdx ];

					if ( strThisChar === undefined )
						strThisChar = ' ';

					if ( bColor ) {

						stringBuffer[ bufferIndex ++ ] = '<span style="'
							+ 'color:rgb(' + iRed + ',' + iGreen + ',' + iBlue + ');'
							+ ( bBlock ? 'background-color:rgb(' + iRed + ',' + iGreen + ',' + iBlue + ');' : '' )
							+ ( bAlpha ? 'opacity:' + ( iAlpha / 255 ) + ';' : '' )
							+ '">' + escapeHtml( strThisChar ) + '</span>';

					} else {

						stringBuffer[ bufferIndex ++ ] = strThisChar;

					}

				}

				stringBuffer[ bufferIndex ++ ] = '<br/>';

			}

			// Join only the used portion of the buffer
			const strChars = stringBuffer.slice( 0, bufferIndex ).join( '' );

			oAscii.innerHTML = `<tr><td style="display:block;width:${width}px;height:${height}px;overflow:hidden">${strChars}</td></tr>`;

			// console.timeEnd('rendering');

			// return oAscii;

		}

		/**
		 * Disposes of the effect and cleans up all resources to prevent memory leaks.
		 * This method should be called when the effect is no longer needed.
		 */
		this.dispose = function () {

			if ( isDisposed ) return;

			isDisposed = true;

			// Clear DOM elements
			if ( oAscii && oAscii.parentNode ) {

				oAscii.parentNode.removeChild( oAscii );

			}

			if ( domElement && domElement.parentNode ) {

				domElement.parentNode.removeChild( domElement );

			}

			// Clear canvas context
			if ( oCanvas && oCtx ) {

				oCtx.clearRect( 0, 0, oCanvas.width, oCanvas.height );

			}

			// Clear cached data
			cachedLetterSpacing = null;
			lastFontConfig = null;
			stringBuffer.length = 0;

			// Clear references
			width = height = null;
			iWidth = iHeight = null;
			oImg = null;

		};

	}

}

/**
 * This type represents configuration settings of `AsciiEffect`.
 *
 * @typedef {Object} AsciiEffect~Options
 * @property {number} [resolution=0.15] - A higher value leads to more details.
 * @property {boolean} [color=false] - Whether colors should be enabled or not. Better quality but slows down rendering.
 * @property {boolean} [alpha=false] - Whether transparency should be enabled or not.
 * @property {boolean} [block=false] - Whether blocked characters should be enabled or not.
 * @property {boolean} [invert=false] - Whether colors should be inverted or not.
 * @property {string} [fontFamily='Courier New, monospace'] - The font family used for the effect.
 * @property {string} [charSet=' .:-=+*#%@'] - The character set used for the effect.
 * @property {number} [fontWeight=400] - The font weight used for the effect.
 * @property {number} [charScale=1.0] - The character scaling factor. Values > 1.0 make characters larger while maintaining proper spacing. Values < 1.0 make characters smaller.
 **/

export { AsciiEffect };
