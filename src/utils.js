import { AlwaysDepth, EqualDepth, GreaterDepth, GreaterEqualDepth, LessDepth, LessEqualDepth, NeverDepth, NotEqualDepth } from './constants.js';

/**
 * Finds the minimum value in an array.
 *
 * @private
 * @param {Array<number>} array - The array to search for the minimum value.
 * @return {number} The minimum value in the array, or Infinity if the array is empty.
 */
function arrayMin( array ) {

	if ( array.length === 0 ) return Infinity;

	let min = array[ 0 ];

	for ( let i = 1, l = array.length; i < l; ++ i ) {

		if ( array[ i ] < min ) min = array[ i ];

	}

	return min;

}

/**
 * Finds the maximum value in an array.
 *
 * @private
 * @param {Array<number>} array - The array to search for the maximum value.
 * @return {number} The maximum value in the array, or -Infinity if the array is empty.
 */
function arrayMax( array ) {

	if ( array.length === 0 ) return - Infinity;

	let max = array[ 0 ];

	for ( let i = 1, l = array.length; i < l; ++ i ) {

		if ( array[ i ] > max ) max = array[ i ];

	}

	return max;

}

/**
 * Checks if an array contains values that require Uint32 representation.
 *
 * This function determines whether the array contains any values >= 65535,
 * which would require a Uint32Array rather than a Uint16Array for proper storage.
 * The function iterates from the end of the array, assuming larger values are
 * typically located at the end.
 *
 * @private
 * @param {Array<number>} array - The array to check.
 * @return {boolean} True if the array contains values >= 65535, false otherwise.
 */
function arrayNeedsUint32( array ) {

	// assumes larger values usually on last

	for ( let i = array.length - 1; i >= 0; -- i ) {

		if ( array[ i ] >= 65535 ) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565

	}

	return false;

}

/**
 * Map of typed array constructor names to their constructors.
 * This mapping enables dynamic creation of typed arrays based on string type names.
 *
 * @private
 * @constant
 * @type {Object<string, TypedArrayConstructor>}
 */
const TYPED_ARRAYS = {
	Int8Array: Int8Array,
	Uint8Array: Uint8Array,
	Uint8ClampedArray: Uint8ClampedArray,
	Int16Array: Int16Array,
	Uint16Array: Uint16Array,
	Int32Array: Int32Array,
	Uint32Array: Uint32Array,
	Float32Array: Float32Array,
	Float64Array: Float64Array
};

/**
 * Creates a typed array of the specified type from the given buffer.
 *
 * @private
 * @param {string} type - The name of the typed array type (e.g., 'Float32Array', 'Uint16Array').
 * @param {ArrayBuffer} buffer - The buffer to create the typed array from.
 * @return {TypedArray} A new typed array of the specified type.
 */
function getTypedArray( type, buffer ) {

	return new TYPED_ARRAYS[ type ]( buffer );

}

/**
 * Returns `true` if the given object is a typed array.
 *
 * @param {any} array - The object to check.
 * @return {boolean} Whether the given object is a typed array.
 */
function isTypedArray( array ) {

	return ArrayBuffer.isView( array ) && ! ( array instanceof DataView );

}

/**
 * Creates an XHTML element with the specified tag name.
 *
 * This function uses the XHTML namespace to create DOM elements,
 * ensuring proper element creation in XML-based contexts.
 *
 * @private
 * @param {string} name - The tag name of the element to create (e.g., 'canvas', 'div').
 * @return {HTMLElement} The created XHTML element.
 */
function createElementNS( name ) {

	return document.createElementNS( 'http://www.w3.org/1999/xhtml', name );

}

/**
 * Creates a canvas element configured for block display.
 *
 * This is a convenience function that creates a canvas element with
 * display style set to 'block', which is commonly used in three.js
 * rendering contexts to avoid inline element spacing issues.
 *
 * @return {HTMLCanvasElement} A canvas element with display set to 'block'.
 */
function createCanvasElement() {

	const canvas = createElementNS( 'canvas' );
	canvas.style.display = 'block';
	return canvas;

}

/**
 * Internal cache for tracking warning messages to prevent duplicate warnings.
 *
 * @private
 * @type {Object<string, boolean>}
 */
const _cache = {};

/**
 * Custom console function handler for intercepting log, warn, and error calls.
 *
 * @private
 * @type {Function|null}
 */
let _setConsoleFunction = null;

/**
 * Sets a custom function to handle console output.
 *
 * This allows external code to intercept and handle console.log, console.warn,
 * and console.error calls made by three.js, which is useful for custom logging,
 * testing, or debugging workflows.
 *
 * @param {Function} fn - The function to handle console output. Should accept
 *                        (type, message, ...params) where type is 'log', 'warn', or 'error'.
 */
function setConsoleFunction( fn ) {

	_setConsoleFunction = fn;

}

/**
 * Gets the currently set custom console function.
 *
 * @return {Function|null} The custom console function, or null if not set.
 */
function getConsoleFunction() {

	return _setConsoleFunction;

}

/**
 * Logs an informational message with the 'THREE.' prefix.
 *
 * If a custom console function is set via setConsoleFunction(), it will be used
 * instead of the native console.log. The first parameter is treated as the
 * method name and is automatically prefixed with 'THREE.'.
 *
 * @param {...any} params - The message components. The first param is used as
 *                          the method name and prefixed with 'THREE.'.
 */
function log( ...params ) {

	const message = 'THREE.' + params.shift();

	if ( _setConsoleFunction ) {

		_setConsoleFunction( 'log', message, ...params );

	} else {

		console.log( message, ...params );

	}

}

/**
 * Enhances log/warn/error messages related to TSL.
 *
 * @param {Array<any>} params - The original message parameters.
 * @returns {Array<any>} The filtered and enhanced message parameters.
 */
function enhanceLogMessage( params ) {

	const message = params[ 0 ];

	if ( typeof message === 'string' && message.startsWith( 'TSL:' ) ) {

		const stackTrace = params[ 1 ];

		if ( stackTrace && stackTrace.isStackTrace ) {

			params[ 0 ] += ' ' + stackTrace.getLocation();

		} else {

			params[ 1 ] = 'Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.';

		}

	}

	return params;

}

/**
 * Logs a warning message with the 'THREE.' prefix.
 *
 * If a custom console function is set via setConsoleFunction(), it will be used
 * instead of the native console.warn. The first parameter is treated as the
 * method name and is automatically prefixed with 'THREE.'.
 *
 * @param {...any} params - The message components. The first param is used as
 *                          the method name and prefixed with 'THREE.'.
 */
function warn( ...params ) {

	params = enhanceLogMessage( params );

	const message = 'THREE.' + params.shift();

	if ( _setConsoleFunction ) {

		_setConsoleFunction( 'warn', message, ...params );

	} else {

		const stackTrace = params[ 0 ];

		if ( stackTrace && stackTrace.isStackTrace ) {

			console.warn( stackTrace.getError( message ) );

		} else {

			console.warn( message, ...params );

		}

	}

}

/**
 * Logs an error message with the 'THREE.' prefix.
 *
 * If a custom console function is set via setConsoleFunction(), it will be used
 * instead of the native console.error. The first parameter is treated as the
 * method name and is automatically prefixed with 'THREE.'.
 *
 * @param {...any} params - The message components. The first param is used as
 *                          the method name and prefixed with 'THREE.'.
 */
function error( ...params ) {

	params = enhanceLogMessage( params );

	const message = 'THREE.' + params.shift();

	if ( _setConsoleFunction ) {

		_setConsoleFunction( 'error', message, ...params );

	} else {

		const stackTrace = params[ 0 ];

		if ( stackTrace && stackTrace.isStackTrace ) {

			console.error( stackTrace.getError( message ) );

		} else {

			console.error( message, ...params );

		}

	}

}

/**
 * Logs a warning message only once, preventing duplicate warnings.
 *
 * This function maintains an internal cache of warning messages and will only
 * output each unique warning message once. Useful for warnings that may be
 * triggered repeatedly but should only be shown to the user once.
 *
 * @param {...any} params - The warning message components.
 */
function warnOnce( ...params ) {

	const message = params.join( ' ' );

	if ( message in _cache ) return;

	_cache[ message ] = true;

	warn( ...params );

}

/**
 * Asynchronously probes for WebGL sync object completion.
 *
 * This function creates a promise that resolves when the WebGL sync object
 * signals completion or rejects if the sync operation fails. It uses polling
 * at the specified interval to check the sync status without blocking the
 * main thread. This is useful for GPU-CPU synchronization in WebGL contexts.
 *
 * @private
 * @param {WebGL2RenderingContext} gl - The WebGL rendering context.
 * @param {WebGLSync} sync - The WebGL sync object to wait for.
 * @param {number} interval - The polling interval in milliseconds.
 * @return {Promise<void>} A promise that resolves when the sync completes or rejects if it fails.
 */
function probeAsync( gl, sync, interval ) {

	return new Promise( function ( resolve, reject ) {

		function probe() {

			switch ( gl.clientWaitSync( sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0 ) ) {

				case gl.WAIT_FAILED:
					reject();
					break;

				case gl.TIMEOUT_EXPIRED:
					setTimeout( probe, interval );
					break;

				default:
					resolve();

			}

		}

		setTimeout( probe, interval );

	} );

}

/**
 * Converts a projection matrix from normalized device coordinates (NDC)
 * range [-1, 1] to [0, 1].
 *
 * This conversion is commonly needed when working with depth textures or
 * render targets that expect depth values in the [0, 1] range rather than
 * the standard OpenGL NDC range of [-1, 1]. The function modifies the
 * projection matrix in place.
 *
 * @private
 * @param {Matrix4} projectionMatrix - The projection matrix to convert (modified in place).
 */
function toNormalizedProjectionMatrix( projectionMatrix ) {

	const m = projectionMatrix.elements;

	// Convert [-1, 1] to [0, 1] projection matrix
	m[ 2 ] = 0.5 * m[ 2 ] + 0.5 * m[ 3 ];
	m[ 6 ] = 0.5 * m[ 6 ] + 0.5 * m[ 7 ];
	m[ 10 ] = 0.5 * m[ 10 ] + 0.5 * m[ 11 ];
	m[ 14 ] = 0.5 * m[ 14 ] + 0.5 * m[ 15 ];

}

/**
 * Reverses the depth range of a projection matrix.
 *
 * This function inverts the depth mapping of a projection matrix, which is
 * useful for reversed-Z depth buffer techniques that can improve depth
 * precision. The function handles both perspective and orthographic projection
 * matrices differently and modifies the matrix in place.
 *
 * For perspective matrices (where m[11] === -1), the depth mapping is
 * reversed with an offset. For orthographic matrices, a simpler reversal
 * is applied.
 *
 * @private
 * @param {Matrix4} projectionMatrix - The projection matrix to reverse (modified in place).
 */
function toReversedProjectionMatrix( projectionMatrix ) {

	const m = projectionMatrix.elements;
	const isPerspectiveMatrix = m[ 11 ] === - 1;

	// Reverse [0, 1] projection matrix
	if ( isPerspectiveMatrix ) {

		m[ 10 ] = - m[ 10 ] - 1;
		m[ 14 ] = - m[ 14 ];

	} else {

		m[ 10 ] = - m[ 10 ];
		m[ 14 ] = - m[ 14 ] + 1;

	}

}

/**
 * Used to select the correct depth functions
 * when reversed depth buffer is used.
 *
 * @private
 * @type {Object}
 */
const ReversedDepthFuncs = {
	[ NeverDepth ]: AlwaysDepth,
	[ LessDepth ]: GreaterDepth,
	[ EqualDepth ]: NotEqualDepth,
	[ LessEqualDepth ]: GreaterEqualDepth,

	[ AlwaysDepth ]: NeverDepth,
	[ GreaterDepth ]: LessDepth,
	[ NotEqualDepth ]: EqualDepth,
	[ GreaterEqualDepth ]: LessEqualDepth,
};

export { arrayMin, arrayMax, arrayNeedsUint32, getTypedArray, createElementNS, createCanvasElement, setConsoleFunction, getConsoleFunction, log, warn, error, warnOnce, probeAsync, toNormalizedProjectionMatrix, toReversedProjectionMatrix, isTypedArray, ReversedDepthFuncs };
