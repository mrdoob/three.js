import { ColorManagement } from './ColorManagement.js';

class Color {

	constructor( r, g, b, a = 1 ) {

		this.isColor = true;

		this.r = 1;
		this.g = 1;
		this.b = 1;

		/**
		 * Alpha component.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.a = a;

		return this.set( r, g, b );

	}

	set( r, g, b ) {

		if ( g === undefined && b === undefined ) {

			const value = r;

			if ( value && value.isColor ) {

				this.copy( value );

			} else if ( typeof value === 'number' ) {

				this.setHex( value );

			} else if ( typeof value === 'string' ) {

				this.setStyle( value );

			}

		} else {

			this.setRGB( r, g, b );

		}

		return this;

	}

	setScalar( scalar ) {

		this.r = scalar;
		this.g = scalar;
		this.b = scalar;

		return this;

	}

	setHex( hex, colorSpace = ColorManagement.workingColorSpace ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		ColorManagement.colorSpaceToWorking( this, colorSpace );

		return this;

	}

	setRGB( r, g, b, colorSpace = ColorManagement.workingColorSpace ) {

		this.r = r;
		this.g = g;
		this.b = b;

		ColorManagement.colorSpaceToWorking( this, colorSpace );

		return this;

	}

	setRGBA( r, g, b, a = this.a, colorSpace = ColorManagement.workingColorSpace ) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		ColorManagement.colorSpaceToWorking( this, colorSpace );

		return this;

	}

	setHSL( h, s, l, colorSpace = ColorManagement.workingColorSpace ) {

		if ( s === 0 ) {

			this.r = this.g = this.b = l;

		} else {

			const p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
			const q = ( 2 * l ) - p;

			this.r = hue2rgb( q, p, h + 1 / 3 );
			this.g = hue2rgb( q, p, h );
			this.b = hue2rgb( q, p, h - 1 / 3 );

		}

		ColorManagement.colorSpaceToWorking( this, colorSpace );

		return this;

	}

	setStyle( style, colorSpace = ColorManagement.workingColorSpace ) {

		function handleAlpha( string ) {

			if ( string === undefined ) return;

			if ( parseFloat( string ) < 1 ) {

				this.a = parseFloat( string );

			}

		}

		let m;

		if ( m = /^#([A-Fa-f\d]+)$/.exec( style ) ) {

			const hex = m[ 1 ];
			const size = hex.length;

			if ( size === 3 ) {

				this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 0 ), 16 ) / 255;
				this.g = parseInt( hex.charAt( 1 ) + hex.charAt( 1 ), 16 ) / 255;
				this.b = parseInt( hex.charAt( 2 ) + hex.charAt( 2 ), 16 ) / 255;

			} else if ( size === 6 ) {

				this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 1 ), 16 ) / 255;
				this.g = parseInt( hex.charAt( 2 ) + hex.charAt( 3 ), 16 ) / 255;
				this.b = parseInt( hex.charAt( 4 ) + hex.charAt( 5 ), 16 ) / 255;

			}

			ColorManagement.colorSpaceToWorking( this, colorSpace );

			return this;

		}

		if ( m = /^rgba?\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*(?:,\s*([+-]?\d*\.?\d+)\s*)?\)$/.exec( style ) ) {

			this.r = Math.min( 255, parseFloat( m[ 1 ] ) ) / 255;
			this.g = Math.min( 255, parseFloat( m[ 2 ] ) ) / 255;
			this.b = Math.min( 255, parseFloat( m[ 3 ] ) ) / 255;

			handleAlpha.call( this, m[ 4 ] );

			ColorManagement.colorSpaceToWorking( this, colorSpace );

			return this;

		}

		return this;

	}

	copy( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.a = color.a !== undefined ? color.a : 1;

		return this;

	}

	clone() {

		return new this.constructor( this.r, this.g, this.b, this.a );

	}

	equals( c ) {

		return (
			c.r === this.r &&
			c.g === this.g &&
			c.b === this.b &&
			( c.a !== undefined ? c.a : 1 ) === this.a
		);

	}

	fromArray( array, offset = 0 ) {

		this.r = array[ offset ];
		this.g = array[ offset + 1 ];
		this.b = array[ offset + 2 ];
		this.a = array[ offset + 3 ] !== undefined ? array[ offset + 3 ] : 1;

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.r;
		array[ offset + 1 ] = this.g;
		array[ offset + 2 ] = this.b;
		array[ offset + 3 ] = this.a;

		return array;

	}

	*[ Symbol.iterator ]() {

		yield this.r;
		yield this.g;
		yield this.b;
		yield this.a;

	}

}

function hue2rgb( p, q, t ) {

	if ( t < 0 ) t += 1;
	if ( t > 1 ) t -= 1;
	if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	if ( t < 1 / 2 ) return q;
	if ( t < 2 / 3 ) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
	return p;

}

export { Color };
