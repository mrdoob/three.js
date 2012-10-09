/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	if ( hex !== undefined ) this.setHex( hex );

	return this;

};

THREE.Color.prototype = {

	constructor: THREE.Color,

	r: 1, g: 1, b: 1,

	copy: function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	},

	copyGammaToLinear: function ( color ) {

		this.r = color.r * color.r;
		this.g = color.g * color.g;
		this.b = color.b * color.b;

		return this;

	},

	copyLinearToGamma: function ( color ) {

		this.r = Math.sqrt( color.r );
		this.g = Math.sqrt( color.g );
		this.b = Math.sqrt( color.b );

		return this;

	},

	convertGammaToLinear: function () {

		var r = this.r, g = this.g, b = this.b;

		this.r = r * r;
		this.g = g * g;
		this.b = b * b;

		return this;

	},

	convertLinearToGamma: function () {

		this.r = Math.sqrt( this.r );
		this.g = Math.sqrt( this.g );
		this.b = Math.sqrt( this.b );

		return this;

	},

	setRGB: function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		return this;

	},

	setHSV: function ( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		var i, f, p, q, t;

		if ( v === 0 ) {

			this.r = this.g = this.b = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			if ( i === 0 ) {

				this.r = v;
				this.g = t;
				this.b = p;

			} else if ( i === 1 ) {

				this.r = q;
				this.g = v;
				this.b = p;

			} else if ( i === 2 ) {

				this.r = p;
				this.g = v;
				this.b = t;

			} else if ( i === 3 ) {

				this.r = p;
				this.g = q;
				this.b = v;

			} else if ( i === 4 ) {

				this.r = t;
				this.g = p;
				this.b = v;

			} else if ( i === 5 ) {

				this.r = v;
				this.g = p;
				this.b = q;

			}

		}

		return this;

	},

	setHex: function ( hex ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		return this;

	},

	lerpSelf: function ( color, alpha ) {

		this.r += ( color.r - this.r ) * alpha;
		this.g += ( color.g - this.g ) * alpha;
		this.b += ( color.b - this.b ) * alpha;

		return this;

	},

	getHex: function () {

		return ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;

	},

	getContextStyle: function () {

		return 'rgb(' + ( ( this.r * 255 ) | 0 )  + ',' + ( ( this.g * 255 ) | 0 ) + ',' + ( ( this.b * 255 ) | 0 ) + ')';

	},

	clone: function () {

		return new THREE.Color().setRGB( this.r, this.g, this.b );

	}

};
