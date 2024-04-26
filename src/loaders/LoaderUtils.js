class LoaderUtils {

	static decodeText( array ) {

		if ( typeof TextDecoder !== 'undefined' ) {

			return new TextDecoder().decode( array );

		}

		let s = '';

		for ( let i = 0, l = array.length; i < l; ) {

			if ( array[ i ] >> 7 === 0 ) {

				s += String.fromCodePoint( array[ i ] );
				i += 1;
				continue;

			} else if ( array[ i ] >> 5 === 0b110 ) {

				if ( array[ i + 1 ] >> 6 === 0b10 ) {

					s += String.fromCodePoint( ( ( array[ i ] & 0b11111 ) << 6 ) + ( array[ i + 1 ] & 0b111111 ) );
					i += 2;
					continue;

				}

			} else if ( array[ i ] >> 4 === 0b1110 ) {

				if ( array[ i + 1 ] >> 6 === 0b10 && array[ i + 2 ] >> 6 === 0b10 ) {

					s += String.fromCodePoint( ( ( array[ i ] & 0b1111 ) << 12 ) + ( ( array[ i + 1 ] & 0b111111 ) << 6 ) + ( array[ i + 2 ] & 0b111111 ) );
					i += 3;
					continue;

				}

			} else if ( array[ i ] >> 3 === 0b11110 ) {

				if ( array[ i + 1 ] >> 6 === 0b10 && array[ i + 2 ] >> 6 === 0b10 && array[ i + 3 ] >> 6 === 0b10 ) {

					s += String.fromCodePoint( ( ( array[ i ] & 0b111 ) << 18 ) + ( ( array[ i + 1 ] & 0b111111 ) << 12 ) + ( ( array[ i + 2 ] & 0b111111 ) << 6 ) + ( array[ i + 3 ] & 0b111111 ) );
					i += 4;
					continue;

				}

			} else if ( array[ i ] >> 2 === 0b111110 ) {

				if ( array[ i + 1 ] >> 6 === 0b10 && array[ i + 2 ] >> 6 === 0b10 && array[ i + 3 ] >> 6 === 0b10 && array[ i + 4 ] >> 6 === 0b10 ) {

					s += String.fromCodePoint( ( ( array[ i ] & 0b11 ) << 24 ) + ( ( array[ i + 1 ] & 0b111111 ) << 18 ) + ( ( array[ i + 2 ] & 0b111111 ) << 12 ) + ( ( array[ i + 3 ] & 0b111111 ) << 6 ) + ( array[ i + 4 ] & 0b111111 ) );
					i += 5;
					continue;

				}

			} else if ( array[ i ] >> 1 === 0b1111110 ) {

				if ( array[ i + 1 ] >> 6 === 0b10 && array[ i + 2 ] >> 6 === 0b10 && array[ i + 3 ] >> 6 === 0b10 && array[ i + 4 ] >> 6 === 0b10 && array[ i + 5 ] >> 6 === 0b10 ) {

					s += String.fromCodePoint( ( ( array[ i ] & 0b1 ) << 30 ) + ( ( array[ i + 1 ] & 0b111111 ) << 24 ) + ( ( array[ i + 2 ] & 0b111111 ) << 18 ) + ( ( array[ i + 3 ] & 0b111111 ) << 12 ) + ( ( array[ i + 4 ] & 0b111111 ) << 6 ) + ( array[ i + 5 ] & 0b111111 ) );
					i += 6;
					continue;

				}

			}

			s += String.fromCodePoint( 0xfffd );
			i += 1;

		}

		return s;

	}

	static extractUrlBase( url ) {

		const index = url.lastIndexOf( '/' );

		if ( index === - 1 ) return './';

		return url.slice( 0, index + 1 );

	}

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
