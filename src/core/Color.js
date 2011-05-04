/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	this.setHex( hex );

};

THREE.Color.prototype = {

	copy : function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.hex = color.hex;

	},

	setHex : function ( hex ) {

		this.hex = ( ~~ hex ) & 0xffffff;
		this.updateRGB();

	},

	setRGB : function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		this.updateHex();

	},

	setHSV : function ( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		var r, g, b, i, f, p, q, t;

		if ( v == 0.0 ) {

			r = g = b = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			switch ( i ) {

				case 1: r = q; g = v; b = p; break;
				case 2: r = p; g = v; b = t; break;
				case 3: r = p; g = q; b = v; break;
				case 4: r = t; g = p; b = v; break;
				case 5: r = v; g = p; b = q; break;
				case 6: // fall through
				case 0: r = v; g = t; b = p; break;

			}

		}

		this.setRGB( r, g, b );

	},

	updateHex : function () {

		this.hex = ~~ ( this.r * 255 ) << 16 ^ ~~ ( this.g * 255 ) << 8 ^ ~~ ( this.b * 255 );

	},

	updateRGB : function () {

		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	clone : function () {

		return new THREE.Color( this.hex );

	}

};
