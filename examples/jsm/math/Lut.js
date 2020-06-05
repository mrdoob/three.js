/**
 * @author daron1337 / http://daron1337.github.io/
 */

import {
	Color
} from "../../../build/three.module.js";

var Lut = function ( colormap, numberofcolors ) {

	this.colors = [];
	this.setColorMap( colormap, numberofcolors );
	return this;

};

Lut.prototype = {

	constructor: Lut,

	colors: [], map: [], minV: 0, maxV: 1,

	setMin: function ( min ) {

		this.minV = min;

		return this;

	},

	setMax: function ( max ) {

		this.maxV = max;

		return this;

	},

	setColorMap: function ( map, numberOfColors ) {

		if ( typeof map == 'string' ) {

			this.map = ColorMapKeywords[ map ];

		} else if ( Array.isArray( map ) ) {

			this.map = map;

		} else {

			this.map = ColorMapKeywords.rainbow;

		}

		var step;

		if ( numberOfColors >= 1 ) {

			step = 1.0 / numberOfColors;

		} else {

			step = 1.0 / 32;

		}

		this.colors.length = 0;
		for ( var i = 0; i <= 1; i += step ) {

			for ( var j = 0; j < this.map.length - 1; j ++ ) {

				if ( i >= this.map[ j ][ 0 ] && i < this.map[ j + 1 ][ 0 ] ) {

					var min = this.map[ j ][ 0 ];
					var max = this.map[ j + 1 ][ 0 ];

					var minColor = new Color( this.map[ j ][ 1 ] );
					var maxColor = new Color( this.map[ j + 1 ][ 1 ] );

					var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

					this.colors.push( color );

				}

			}

		}

		return this;

	},

	copy: function ( lut ) {

		this.colors = lut.colors;
		this.map = lut.map;
		this.minV = lut.minV;
		this.maxV = lut.maxV;

		return this;

	},

	getColor: function ( alpha ) {

		alpha = Math.min( this.maxV, Math.max( this.minV, alpha ) );
		alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );

		var colorPosition = Math.round( alpha * ( this.colors.length - 1 ) );
		return this.colors[ colorPosition ];

	},

	createCanvas: function () {

		var canvas = document.createElement( 'canvas' );
		canvas.width = 1;
		canvas.height = this.colors.length;

		this.updateCanvas( canvas );

		return canvas;

	},

	updateCanvas: function ( canvas ) {

		var ctx = canvas.getContext( '2d', { alpha: false } );

		var imageData = ctx.getImageData( 0, 0, 1, this.colors.length );

		var data = imageData.data;

		var k = 0;

		var step = 1.0 / this.colors.length;

		for ( var i = 1; i >= 0; i -= step ) {

			for ( var j = this.map.length - 1; j >= 0; j -- ) {

				if ( i < this.map[ j ][ 0 ] && i >= this.map[ j - 1 ][ 0 ] ) {

					var min = this.map[ j - 1 ][ 0 ];
					var max = this.map[ j ][ 0 ];

					var minColor = new Color( this.map[ j - 1 ][ 1 ] );
					var maxColor = new Color( this.map[ j ][ 1 ] );

					var color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

					data[ k ] = Math.round( color.r * 255 );
					data[ k + 1 ] = Math.round( color.g * 255 );
					data[ k + 2 ] = Math.round( color.b * 255 );
					data[ k + 3 ] = 255;

					k += 4;

				}

			}

		}

		ctx.putImageData( imageData, 0, 0 );

		return canvas;

	},

};

var ColorMapKeywords = {

	"rainbow": [[ 0.0, 0x0000FF ], [ 0.2, 0x00FFFF ], [ 0.5, 0x00FF00 ], [ 0.8, 0xFFFF00 ], [ 1.0, 0xFF0000 ]],
	"cooltowarm": [[ 0.0, 0x3C4EC2 ], [ 0.2, 0x9BBCFF ], [ 0.5, 0xDCDCDC ], [ 0.8, 0xF6A385 ], [ 1.0, 0xB40426 ]],
	"blackbody": [[ 0.0, 0x000000 ], [ 0.2, 0x780000 ], [ 0.5, 0xE63200 ], [ 0.8, 0xFFFF00 ], [ 1.0, 0xFFFFFF ]],
	"grayscale": [[ 0.0, 0x000000 ], [ 0.2, 0x404040 ], [ 0.5, 0x7F7F80 ], [ 0.8, 0xBFBFBF ], [ 1.0, 0xFFFFFF ]]

};

export { Lut };
