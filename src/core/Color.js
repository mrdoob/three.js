/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	this.setHex( hex );

};

THREE.Color.prototype = {

	autoUpdate : true,

	copy : function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.hex = color.hex;
		this.__styleString = color.__styleString;

	},

	setRGB : function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},

	setHSV : function ( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		var red, green, blue, i, f, p, q, t;

		if ( v == 0.0 ) {

			red = green = blue = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			switch ( i ) {

				case 1: red = q; green = v; blue = p; break;
				case 2: red = p; green = v; blue = t; break;
				case 3: red = p; green = q; blue = v; break;
				case 4: red = t; green = p; blue = v; break;
				case 5: red = v; green = p; blue = q; break;
				case 6: // fall through
				case 0: red = v; green = t; blue = p; break;

			}

		}

		this.r = red;
		this.g = green;
		this.b = blue;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},

	setHex : function ( hex ) {

		this.hex = ( ~~ hex ) & 0xffffff;

		if ( this.autoUpdate ) {

			this.updateRGB();
			this.updateStyleString();

		}

	},

	updateHex : function () {

		this.hex = ~~ ( this.r * 255 ) << 16 ^ ~~ ( this.g * 255 ) << 8 ^ ~~ ( this.b * 255 );

	},

	updateRGB : function () {

		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	updateStyleString : function () {

		this.__styleString = 'rgb(' + ~~ ( this.r * 255 ) + ',' + ~~ ( this.g * 255 ) + ',' + ~~ ( this.b * 255 ) + ')';

	},

	clone : function () {

		return new THREE.Color( this.hex );

	}

};
