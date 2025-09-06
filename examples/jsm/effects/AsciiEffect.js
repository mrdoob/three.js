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
	 * @param {WebGLRenderer} renderer - The WebGL renderer to use as source.
	 * @param {AsciiEffect~Options} [options={}] - Configuration options for the effect.
	 * @throws {Error} When renderer is not provided or invalid.
	 */
	constructor( renderer, options = {} ) {

		if ( ! renderer ) {

			throw new Error( 'AsciiEffect: renderer parameter is required' );

		}

		if ( typeof renderer.render !== 'function' || ! renderer.domElement ) {

			throw new Error( 'AsciiEffect: renderer must be a valid WebGL renderer' );

		}

		// Validation and initialization helper methods (defined first)

		/**
		 * Validates a numeric parameter within specified bounds
		 * @private
		 * @param {*} value - The value to validate
		 * @param {number} defaultValue - Default value if validation fails
		 * @param {number} min - Minimum allowed value
		 * @param {number} max - Maximum allowed value
		 * @param {string} paramName - Parameter name for error messages
		 * @returns {number} The validated number
		 */
		this._validateNumber = function ( value, defaultValue, min, max, paramName ) {

			if ( value === undefined || value === null ) return defaultValue;

			const num = Number( value );
			if ( isNaN( num ) || num < min || num > max ) {

				console.warn( `AsciiEffect: Invalid ${paramName} value (${value}). Using default: ${defaultValue}` );
				return defaultValue;

			}

			return num;

		};

		/**
		 * Validates a string parameter
		 * @private
		 * @param {*} value - The value to validate
		 * @param {string} defaultValue - Default value if validation fails
		 * @param {string} paramName - Parameter name for error messages
		 * @returns {string} The validated string
		 */
		this._validateString = function ( value, defaultValue, paramName ) {

			if ( typeof value !== 'string' || value.length === 0 ) {

				if ( value !== undefined ) {

					console.warn( `AsciiEffect: Invalid ${paramName} value. Using default: ${defaultValue}` );

				}

				return defaultValue;

			}

			return value;

		};

		/**
		 * Validates dimensions for the effect
		 * @private
		 * @param {number} w - Width
		 * @param {number} h - Height
		 * @returns {boolean} True if dimensions are valid
		 */
		this._validateDimensions = function ( w, h ) {

			return typeof w === 'number' && typeof h === 'number' &&
				   w > 0 && h > 0 &&
				   isFinite( w ) && isFinite( h );

		};

		/**
		 * Creates and validates the canvas element
		 * @private
		 * @returns {HTMLCanvasElement} The canvas element
		 * @throws {Error} If canvas is not supported
		 */
		this._createCanvas = function () {

			const canvas = document.createElement( 'canvas' );
			if ( ! canvas.getContext ) {

				throw new Error( 'AsciiEffect: Canvas not supported' );

			}

			return canvas;

		};

		/**
		 * Gets the 2D context from canvas with proper configuration
		 * @private
		 * @param {HTMLCanvasElement} canvas - The canvas element
		 * @returns {CanvasRenderingContext2D} The 2D context
		 * @throws {Error} If 2D context is not available
		 */
		this._getCanvasContext = function ( canvas ) {

			const ctx = canvas.getContext( '2d', { willReadFrequently: true } );
			if ( ! ctx || ! ctx.getImageData ) {

				throw new Error( 'AsciiEffect: 2D canvas context not available' );

			}

			return ctx;

		};

		/**
		 * Initializes the character list based on settings
		 * @private
		 * @param {string} charSet - The character set string
		 * @param {boolean} useColor - Whether to use color-optimized character set
		 * @returns {Array<string>} Array of characters
		 */
		this._initializeCharacterList = function ( charSet, useColor ) {

			if ( charSet && charSet.length > 0 ) {

				return charSet.split( '' );

			}

			// Default character sets optimized for different modes
			const defaultCharList = ' .:-=+*#%@'.split( '' );
			const colorOptimizedCharList = ' CGO08@'.split( '' );

			return useColor ? colorOptimizedCharList : defaultCharList;

		};

		// Configuration parameters with validation (now that validation methods are defined)
		let fResolution = this._validateNumber( options.resolution, 0.15, 0.01, 1.0, 'resolution' );
		let bColor = Boolean( options.color );
		let bAlpha = Boolean( options.alpha );
		let bBlock = Boolean( options.block );
		let bInvert = Boolean( options.invert );
		let fDensityHorizontal = this._validateNumber( options.densityHorizontal, 2.0, 0.1, 2.0, 'densityHorizontal' );
		let fDensityVertical = this._validateNumber( options.densityVertical, 1.0, 0.1, 2.0, 'densityVertical' );
		let strFont = this._validateString( options.fontFamily, 'Courier New, monospace', 'fontFamily' );
		let strCharSet = this._validateString( options.charSet, ' .:-=+*#%@', 'charSet' );
		let iFontWeight = this._validateNumber( options.fontWeight, 400, 100, 900, 'fontWeight' );
		let fCharScale = this._validateNumber( options.charScale, 1.0, 0.1, 5.0, 'charScale' );

		// Font size and line height calculations - declared here so updateVisualSettings can modify them
		let baseFontSize = 1 / fResolution; // Base font size for square characters
		let strFontSize = ( baseFontSize * fCharScale * 2 ) + 'px';
		let fLineHeight = ( 1 / fResolution ) / ( fDensityVertical * 0.5 );

		// Cache for letter spacing calculation optimization
		let cachedLetterSpacing = null;
		let lastFontConfigKey = null; // Cache the stringified version to avoid repeated JSON.stringify

		// State management
		let isDisposed = false;
		let width = 0, height = 0;
		let iWidth = 0, iHeight = 0;
		let oImg = null;

		// DOM elements
		const domElement = document.createElement( 'div' );
		domElement.style.cursor = 'default';
		domElement.setAttribute( 'data-ascii-effect', 'true' );

		const oAscii = document.createElement( 'table' );
		domElement.appendChild( oAscii );

		// Performance optimization: reusable string buffer
		const stringBuffer = [];

		// Performance optimization: pre-calculated values to avoid repeated calculations
		let charListLength = 0;
		let charListLengthMinus1 = 0;

		// Canvas setup with error handling
		const oCanvas = this._createCanvas();
		const oCtx = this._getCanvasContext( oCanvas );
		const oCanvasImg = renderer.domElement;

		// Character list setup
		let aCharList = this._initializeCharacterList( strCharSet, bColor );

		// Public API methods

		/**
		 * Resizes the effect to match new dimensions.
		 *
		 * @param {number} w - The width of the effect in logical pixels.
		 * @param {number} h - The height of the effect in logical pixels.
		 * @throws {Error} When dimensions are invalid.
		 */
		this.setSize = function ( w, h ) {

			if ( isDisposed ) {

				console.warn( 'AsciiEffect: Cannot resize disposed effect' );
				return;

			}

			if ( ! this._validateDimensions( w, h ) ) {

				throw new Error( `AsciiEffect: Invalid dimensions - width: ${w}, height: ${h}` );

			}

			width = w;
			height = h;

			updateRendererSize( w, h );
			initAsciiSize();

		};

		// Helper functions to centralize repeated logic

		/**
		 * Calculates render dimensions based on resolution
		 * @private
		 * @param {number} w - Width in logical pixels
		 * @param {number} h - Height in logical pixels
		 * @returns {Object} Object with width and height properties
		 */
		function calculateRenderSize( w, h ) {

			return {
				width: Math.floor( w * fResolution ),
				height: Math.floor( h * fResolution )
			};

		}

		/**
		 * Updates renderer size with proper resolution handling
		 * @private
		 * @param {number} w - Width in logical pixels
		 * @param {number} h - Height in logical pixels
		 */
		function updateRendererSize( w, h ) {

			const renderSize = calculateRenderSize( w, h );
			renderer.setSize( renderSize.width, renderSize.height, false );
			renderer.setPixelRatio( 1 );

		}

		/**
		 * Recalculates font-related properties
		 * @private
		 */
		function updateFontProperties() {

			baseFontSize = 1 / fResolution; // Base font size for square characters

			strFontSize = ( baseFontSize * fCharScale * 2 ) + 'px';
			fLineHeight = ( 1 / fResolution ) / ( fDensityVertical * 0.5 );

		}

		/**
		 * Creates font configuration object for caching
		 * @private
		 * @returns {Object} Font configuration object
		 */
		function createFontConfig() {

			return {
				fontFamily: strFont.toLowerCase(),
				fontSize: strFontSize,
				fontWeight: iFontWeight,
				charScale: fCharScale,
				lineHeight: fLineHeight,
				densityHorizontal: fDensityHorizontal,
				densityVertical: fDensityVertical
			};

		}

		/**
		 * Updates cached performance values
		 * @private
		 */
		function updatePerformanceCache() {

			charListLength = aCharList.length;
			charListLengthMinus1 = charListLength - 1;

		}

		/**
		 * Invalidates font cache and triggers recalculation
		 * @private
		 */
		function invalidateFontCache() {

			cachedLetterSpacing = null;
			lastFontConfigKey = null;

		}

		/**
		 * Cleans up cached data and references
		 * @private
		 */
		function clearCachedData() {

			invalidateFontCache();
			stringBuffer.length = 0;
			width = height = null;
			iWidth = iHeight = null;
			oImg = null;

		}

		/**
		 * Renders the scene using the ASCII effect.
		 * This method should be called instead of the default {@link WebGLRenderer#render}.
		 *
		 * @param {Object3D} scene - The scene to render.
		 * @param {Camera} camera - The camera to use for rendering.
		 * @throws {Error} When scene or camera are invalid.
		 */
		this.render = function ( scene, camera ) {

			if ( isDisposed ) {

				console.warn( 'AsciiEffect: Cannot render with disposed effect' );
				return;

			}

			if ( ! scene || ! camera ) {

				throw new Error( 'AsciiEffect: Scene and camera are required for rendering' );

			}

			try {

				renderer.render( scene, camera );
				asciifyImage( oAscii );

			} catch ( error ) {

				console.error( 'AsciiEffect: Rendering failed', error );
				throw error;

			}

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
		 * Validates all input parameters before applying changes.
		 *
		 * @param {Object} newSettings - Object containing the new settings.
		 * @param {number} [newSettings.resolution] - Rendering resolution (0.01-1.0).
		 * @param {boolean} [newSettings.color] - Enable color mode.
		 * @param {boolean} [newSettings.alpha] - Enable alpha transparency.
		 * @param {boolean} [newSettings.block] - Enable block mode.
		 * @param {boolean} [newSettings.invert] - Invert brightness mapping.
		 * @param {number} [newSettings.densityHorizontal] - Horizontal character density multiplier (0.1-4.0).
		 * @param {number} [newSettings.densityVertical] - Vertical character density multiplier (0.1-4.0).
		 * @param {string} [newSettings.charSet] - Character set for ASCII conversion.
		 * @param {string} [newSettings.fontFamily] - Font family to use.
		 * @param {number} [newSettings.fontWeight] - Font weight (100-900).
		 * @param {number} [newSettings.charScale] - Character scaling factor (0.1-5.0).
		 * @throws {Error} When settings object is invalid.
		 */
		this.updateVisualSettings = function ( newSettings ) {

			if ( isDisposed ) {

				console.warn( 'AsciiEffect: Cannot update settings on disposed effect' );
				return;

			}

			if ( ! newSettings || typeof newSettings !== 'object' ) {

				throw new Error( 'AsciiEffect: newSettings must be an object' );

			}

			let needsFontRecalculation = false;
			let needsResolutionUpdate = false;

			// Update boolean settings with validation
			if ( newSettings.color !== undefined ) {

				const newColor = Boolean( newSettings.color );

				if ( newColor !== bColor ) {

					bColor = newColor;
					aCharList = this._initializeCharacterList( strCharSet, bColor );
					updatePerformanceCache(); // Update cache when color mode changes character list

				}

			}

			if ( newSettings.alpha !== undefined ) bAlpha = Boolean( newSettings.alpha );
			if ( newSettings.block !== undefined ) bBlock = Boolean( newSettings.block );
			if ( newSettings.invert !== undefined ) bInvert = Boolean( newSettings.invert );

			// Handle density settings that affect font scaling
			if ( newSettings.densityHorizontal !== undefined ) {

				const newDensityHorizontal = this._validateNumber( newSettings.densityHorizontal, fDensityHorizontal, 0.1, 4.0, 'densityHorizontal' );
				if ( newDensityHorizontal !== fDensityHorizontal ) {

					fDensityHorizontal = newDensityHorizontal;
					needsFontRecalculation = true;

				}

			}

			if ( newSettings.densityVertical !== undefined ) {

				const newDensityVertical = this._validateNumber( newSettings.densityVertical, fDensityVertical, 0.1, 4.0, 'densityVertical' );
				if ( newDensityVertical !== fDensityVertical ) {

					fDensityVertical = newDensityVertical;
					needsFontRecalculation = true;

				}

			}

			// Handle character set updates
			if ( newSettings.charSet !== undefined ) {

				const validatedCharSet = this._validateString( newSettings.charSet, strCharSet, 'charSet' );
				if ( validatedCharSet !== strCharSet ) {

					strCharSet = validatedCharSet;
					aCharList = this._initializeCharacterList( strCharSet, bColor );
					updatePerformanceCache(); // Update cache when character list changes

				}

			}

			// Handle resolution updates with validation
			if ( newSettings.resolution !== undefined ) {

				const newResolution = this._validateNumber( newSettings.resolution, fResolution, 0.01, 1.0, 'resolution' );
				if ( newResolution !== fResolution ) {

					fResolution = newResolution;
					updateRendererSize( width, height );
					needsResolutionUpdate = true;
					needsFontRecalculation = true;

				}

			}

			// Handle font-related parameters with validation
			if ( newSettings.charScale !== undefined ) {

				const newCharScale = this._validateNumber( newSettings.charScale, fCharScale, 0.1, 5.0, 'charScale' );
				if ( newCharScale !== fCharScale ) {

					fCharScale = newCharScale;
					needsFontRecalculation = true;

				}

			}

			if ( newSettings.fontFamily !== undefined ) {

				const newFontFamily = this._validateString( newSettings.fontFamily, strFont, 'fontFamily' );
				if ( newFontFamily !== strFont ) {

					strFont = newFontFamily;
					needsFontRecalculation = true;

				}

			}

			if ( newSettings.fontWeight !== undefined ) {

				const newFontWeight = this._validateNumber( newSettings.fontWeight, iFontWeight, 100, 900, 'fontWeight' );
				if ( newFontWeight !== iFontWeight ) {

					iFontWeight = newFontWeight;
					needsFontRecalculation = true;

				}

			}

			// Apply changes if needed
			if ( needsFontRecalculation ) {

				updateFontProperties();
				invalidateFontCache();

			}

			if ( needsResolutionUpdate || needsFontRecalculation ) {

				initAsciiSize();

			}

		};

		// Throw in ascii library from https://github.com/hassadee/jsascii/blob/master/jsascii.js (MIT License)

		/**
		 * Initialize ASCII size and styling based on current parameters
		 * @private
		 */
		function initAsciiSize() {

			if ( isDisposed ) return;

			// Use the renderer's actual canvas size for ASCII conversion
			iWidth = renderer.domElement.width;
			iHeight = renderer.domElement.height;

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
			const currentFontConfig = createFontConfig();
			const fontConfigKey = `${currentFontConfig.fontFamily}_${currentFontConfig.fontSize}_${currentFontConfig.fontWeight}_${fResolution}_${currentFontConfig.densityHorizontal}`;

			// Only recalculate letter spacing if font configuration changed
			let optimalLetterSpacing;
			if ( cachedLetterSpacing === null || lastFontConfigKey !== fontConfigKey ) {

				// Calculate base line height (unscaled by vertical density) for square character spacing
				const baseLineHeight = 1 / fResolution;

				optimalLetterSpacing = calculateLetterSpacing(
					currentFontConfig.fontFamily,
					currentFontConfig.fontSize,
					currentFontConfig.fontWeight,
					baseLineHeight
				);

				// Cache the results
				cachedLetterSpacing = optimalLetterSpacing;
				lastFontConfigKey = fontConfigKey;

			} else {

				optimalLetterSpacing = cachedLetterSpacing;

			}

			oStyle.letterSpacing = optimalLetterSpacing + 'em';

			// Update performance cache after dimensions and character list changes
			updatePerformanceCache();

		}

		/**
		 * Calculate letter spacing for monospace fonts, so that each character fits in a perfect square
		 * @private
		 * @param {string} fontFamily - The font family
		 * @param {string} fontSize - The font size with units
		 * @param {number} fontWeight - The font weight
		 * @param {number} lineHeight - The line height in pixels
		 * @returns {number} The letter spacing in em units
		 */
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

			// Calculate the target character width based on horizontal density
			// For square characters at density 1.0, character width should equal line height

			// The base target width for square characters (when densities are 1.0)
			const baseTargetWidth = lineHeight;

			// Adjust target width based on horizontal density
			// Higher horizontal density = more characters = smaller target width
			// Apply half the density effect to match the step calculation
			const targetCharWidth = baseTargetWidth / ( fDensityHorizontal * 0.5 );

			// Calculate the letter-spacing adjustment needed
			const currentCharWidth = elementWidth / 2; // Width per character
			const letterSpacingAdjustment = targetCharWidth - currentCharWidth;

			// Convert to em units (relative to the current scaled font size)
			const fontSizeValue = parseFloat( fontSize );
			const letterSpacingInEm = letterSpacingAdjustment / fontSizeValue;

			return letterSpacingInEm;

		}

		// can't get a span or div to flow like an img element, but a table works?

		/**
		 * HTML escaping function to prevent XSS
		 * @private
		 * @param {string} text - The text to escape
		 * @returns {string} The escaped text
		 */
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

		/**
		 * Convert img element to ascii
		 * @private
		 * @param {HTMLTableElement} oAscii - The ASCII table element to populate
		 */
		function asciifyImage( oAscii ) {

			if ( isDisposed ) return;

			oCtx.clearRect( 0, 0, iWidth, iHeight );
			oCtx.drawImage( oCanvasImg, 0, 0, iWidth, iHeight );
			const oImgData = oCtx.getImageData( 0, 0, iWidth, iHeight ).data;

			// Cache width calculation for pixel offset performance
			const widthTimes4 = iWidth * 4;

			// Calculate step sizes based on density settings
			// Higher density = smaller steps = more characters per line/column
			// Base step of 1 pixel when density = 1.0
			// For density > 1.0, we need fractional steps (sub-pixel sampling)
			// Apply half the density effect to get the desired mapping
			const xStep = 1 / ( fDensityHorizontal * 0.5 );
			const yStep = 1 / ( fDensityVertical * 0.5 );

			// Calculate dimensions for ASCII output
			const asciiWidth = Math.floor( iWidth / xStep );
			const asciiHeight = Math.floor( iHeight / yStep );

			// Calculate expected buffer size for optimization
			const expectedPixels = asciiHeight * ( asciiWidth + 1 ); // +1 for <br/> tags

			// Reuse string buffer to avoid massive string allocations
			// Only resize if needed
			if ( stringBuffer.length < expectedPixels || stringBuffer.length > expectedPixels * 2 ) {

				stringBuffer.length = expectedPixels;

			}

			let bufferIndex = 0;

			// console.time('rendering');

			for ( let y = 0; y < iHeight; y += yStep ) {

				for ( let x = 0; x < iWidth; x += xStep ) {

					// Use Math.floor to ensure we get valid pixel coordinates
					const pixelX = Math.floor( x );
					const pixelY = Math.floor( y );
					const iOffset = pixelY * widthTimes4 + pixelX * 4;

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

					iCharIdx = Math.floor( ( 1 - fBrightness ) * charListLengthMinus1 );

					if ( bInvert ) {

						iCharIdx = charListLengthMinus1 - iCharIdx;

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
		 * After calling this method, the effect instance should not be used anymore.
		 *
		 * @public
		 */
		this.dispose = function () {

			if ( isDisposed ) {

				console.warn( 'AsciiEffect: Effect already disposed' );
				return;

			}

			isDisposed = true;

			try {

				// Clear DOM elements safely
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

				// Clear cached data and references
				clearCachedData();

			} catch ( error ) {

				console.error( 'AsciiEffect: Error during disposal', error );

			}

		};

	}

}

/**
 * Configuration options for AsciiEffect constructor.
 *
 * @typedef {Object} AsciiEffect~Options
 * @property {number} [resolution=0.15] - Rendering resolution (0.01-1.0). Higher values provide more detail but reduce performance.
 * @property {boolean} [color=false] - Enable color rendering. Provides better visual quality but impacts performance.
 * @property {boolean} [alpha=false] - Enable alpha transparency support in color mode.
 * @property {boolean} [block=false] - Use block characters with background colors in color mode.
 * @property {boolean} [invert=false] - Invert the brightness-to-character mapping.
 * @property {number} [densityHorizontal=2.0] - Horizontal character density multiplier (0.1-2.0). Higher values create more characters horizontally by reducing the sampling step size.
 * @property {number} [densityVertical=1.0] - Vertical character density multiplier (0.1-2.0). Higher values create more characters vertically by reducing the sampling step size and line height.
 * @property {string} [fontFamily='Courier New, monospace'] - Font family for ASCII characters. Should be monospace.
 * @property {string} [charSet=' .:-=+*#%@'] - Character set for ASCII conversion, ordered from lightest to darkest.
 * @property {number} [fontWeight=400] - Font weight (100-900) for ASCII characters.
 * @property {number} [charScale=1.0] - Character scaling factor (0.1-5.0). Scales individual character size without affecting character density or spacing.
 *
 * @example
 * // Basic usage
 * const effect = new AsciiEffect(renderer, {
 *   resolution: 0.2,
 *   color: true,
 *   fontFamily: 'Monaco, monospace'
 * });
 *
 * @example
 * // Custom character set for artistic effect
 * const effect = new AsciiEffect(renderer, {
 *   charSet: ' ░▒▓█',
 *   invert: true,
 *   charScale: 1.5
 * });
 *
 * @example
 * // Fine-tuned density for specific artistic effect
 * const effect = new AsciiEffect(renderer, {
 *   densityHorizontal: 1.5,  // 50% more horizontal density
 *   densityVertical: 0.8,    // 20% less vertical density
 *   charSet: ' ░▒▓█',
 *   resolution: 0.25
 * });
 */

export { AsciiEffect };
