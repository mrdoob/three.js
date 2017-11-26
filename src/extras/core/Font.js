/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author mrdoob / http://mrdoob.com/
 */

import { QuadraticBezier, CubicBezier } from './Interpolations.js';
import { ShapePath } from './ShapePath.js';


function Font( data ) {

	this.type = 'Font';

	this.data = data;

}

Object.assign( Font.prototype, {

	isFont: true,

	generateShapes: function ( text, size, divisions ) {

		function createPaths( text ) {

			var chars = String( text ).split( '' );
			var scale = size / data.resolution;
			var line_height = ( data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness ) * scale;

			var offsetX = 0, offsetY = 0;

			var paths = [];

			for ( var i = 0; i < chars.length; i ++ ) {

				var char = chars[ i ];

				if ( char === '\n' ) {

					offsetX = 0;
					offsetY -= line_height;

				} else {

					var ret = createPath( char, scale, offsetX, offsetY );
					offsetX += ret.offsetX;
					paths.push( ret.path );

				}

			}

			return paths;

		}

		function createPath( c, scale, offsetX, offsetY ) {

			var glyph = data.glyphs[ c ] || data.glyphs[ '?' ];

			if ( ! glyph ) return;

			var path = new ShapePath();

			var pts = [];
			var x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2, laste;

			if ( glyph.o ) {

				var outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );

				for ( var i = 0, l = outline.length; i < l; ) {

					var action = outline[ i ++ ];

					switch ( action ) {

						case 'm': // moveTo

							x = outline[ i ++ ] * scale + offsetX;
							y = outline[ i ++ ] * scale + offsetY;

							path.moveTo( x, y );

							break;

						case 'l': // lineTo

							x = outline[ i ++ ] * scale + offsetX;
							y = outline[ i ++ ] * scale + offsetY;

							path.lineTo( x, y );

							break;

						case 'q': // quadraticCurveTo

							cpx = outline[ i ++ ] * scale + offsetX;
							cpy = outline[ i ++ ] * scale + offsetY;
							cpx1 = outline[ i ++ ] * scale + offsetX;
							cpy1 = outline[ i ++ ] * scale + offsetY;

							path.quadraticCurveTo( cpx1, cpy1, cpx, cpy );

							laste = pts[ pts.length - 1 ];

							if ( laste ) {

								cpx0 = laste.x;
								cpy0 = laste.y;

								for ( var i2 = 1; i2 <= divisions; i2 ++ ) {

									var t = i2 / divisions;
									QuadraticBezier( t, cpx0, cpx1, cpx );
									QuadraticBezier( t, cpy0, cpy1, cpy );

								}

							}

							break;

						case 'b': // bezierCurveTo

							cpx = outline[ i ++ ] * scale + offsetX;
							cpy = outline[ i ++ ] * scale + offsetY;
							cpx1 = outline[ i ++ ] * scale + offsetX;
							cpy1 = outline[ i ++ ] * scale + offsetY;
							cpx2 = outline[ i ++ ] * scale + offsetX;
							cpy2 = outline[ i ++ ] * scale + offsetY;

							path.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, cpx, cpy );

							laste = pts[ pts.length - 1 ];

							if ( laste ) {

								cpx0 = laste.x;
								cpy0 = laste.y;

								for ( var i2 = 1; i2 <= divisions; i2 ++ ) {

									var t = i2 / divisions;
									CubicBezier( t, cpx0, cpx1, cpx2, cpx );
									CubicBezier( t, cpy0, cpy1, cpy2, cpy );

								}

							}

							break;

					}

				}

			}

			return { offsetX: glyph.ha * scale, path: path };

		}

		//

		if ( size === undefined ) size = 100;
		if ( divisions === undefined ) divisions = 4;

		var data = this.data;

		var paths = createPaths( text );
		var shapes = [];

		for ( var p = 0, pl = paths.length; p < pl; p ++ ) {

			Array.prototype.push.apply( shapes, paths[ p ].toShapes() );

		}

		return shapes;

	}

} );


export { Font };
