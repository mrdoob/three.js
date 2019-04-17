/**
 * @author Don McCurdy / https://www.donmccurdy.com
 * @author bbmv / https://github.com/bbmv
 */

var LoaderUtils = {

	decodeText: function ( array ) {

		if ( typeof TextDecoder !== 'undefined' ) {

			return new TextDecoder().decode( array );

		}

		// Avoid the String.fromCharCode.apply(null, array) shortcut, which
		// throws a "maximum call stack size exceeded" error for large arrays.

		var s = '';

		for ( var i = 0, il = array.length; i < il; i ++ ) {

			// Implicitly assumes little-endian.
			s += String.fromCharCode( array[ i ] );

		}

		// Merges multi-byte utf-8 characters.
		return decodeURIComponent( escape( s ) );

	},

	extractUrlBase: function ( url ) {

		var index = url.lastIndexOf( '/' );

		if ( index === - 1 ) return './';

		return url.substr( 0, index + 1 );

	},

	splitByWhitespace: function ( text ) {

		return ( isSafari() ) ? text.trim().split( /\s+/ ) : text.replace( /\n/g, " " ).
			replace( /\r/g, " " ).
			replace( /\t/g, " " ).
			replace( /  +/g, " " ). // double space
			trim().
			split( " " );

	}

};

function isSafari() {

	var browser = ( typeof navigator !== "undefined" ) ? navigator.userAgent.match( /chrome|opera|safari|firefox|msie|trident/i ) : null;

	return ( browser !== null ) ? /safari/i.test( browser[ 0 ] ) : false;

}

export { LoaderUtils };
