/**
 * A class with loader utility functions.
 */
class LoaderUtils {

	/**
	 * The function takes a stream of bytes as input and returns a string
	 * representation.
	 *
	 * @deprecated since r165. Use the native `TextDecoder` API instead.
	 * @param {TypedArray} array - A stream of bytes as a typed array.
	 * @return {string} The decoded text.
	 */
	static decodeText( array ) { // @deprecated, r165

		console.warn( 'THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead.' );

		if ( typeof TextDecoder !== 'undefined' ) {

			return new TextDecoder().decode( array );

		}

		// Avoid the String.fromCharCode.apply(null, array) shortcut, which
		// throws a "maximum call stack size exceeded" error for large arrays.

		let s = '';

		for ( let i = 0, il = array.length; i < il; i ++ ) {

			// Implicitly assumes little-endian.
			s += String.fromCharCode( array[ i ] );

		}

		try {

			// merges multi-byte utf-8 characters.

			return decodeURIComponent( escape( s ) );

		} catch ( e ) { // see #16358

			return s;

		}

	}

	/**
	 * Extracts the base URL from the given URL.
	 *
	 * @param {string} url -The URL to extract the base URL from.
	 * @return {string} The extracted base URL.
	 */
	static extractUrlBase( url ) {

		const index = url.lastIndexOf( '/' );

		if ( index === - 1 ) return './';

		return url.slice( 0, index + 1 );

	}

	/**
	 * Resolves relative URLs against the given path. Absolute paths, data urls,
	 * and blob URLs will be returned as is. Invalid URLs will return an empty
	 * string.
	 *
	 * @param {string} url -The URL to resolve.
	 * @param {string} path - The base path for relative URLs to be resolved against.
	 * @return {string} The resolved URL.
	 */
	static resolveURL( url, path ) {

		// Invalid URL
		if ( typeof url !== 'string' || url === '' ) return '';

		// Host Relative URL
		if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

			path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

		}

		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) return url;

		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) return url;

		// Blob URL
		if ( /^blob:.*$/i.test( url ) ) return url;

		// Relative URL
		return path + url;

	}

}

export { LoaderUtils };
