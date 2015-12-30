/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Font = function ( data ) {

	this.data = data;

};

THREE.Font.prototype = {

	constructor: THREE.Font,

	generateShapes: function ( text, size, curveSegments ) {

		function createPaths( text ) {

			var chars = String( text ).split( '' );
			var scale = size / data.resolution;
			var offset = 0;

			var paths = [];

			for ( var i = 0; i < chars.length; i ++ ) {

				var path = new THREE.Path();

				var ret = extractGlyphPoints( chars[ i ], scale, offset, path );
				offset += ret.offset;

				paths.push( ret.path );

			}

			return paths;

		}

		function extractGlyphPoints( c, scale, offset, path ) {

			var pts = [];

			var b2 = THREE.ShapeUtils.b2;
			var b3 = THREE.ShapeUtils.b3;

			var i, i2, divisions,
				outline, action, length,
				scaleX, scaleY,
				x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2,
				laste,
				glyph = data.glyphs[ c ] || data.glyphs[ '?' ];

			if ( ! glyph ) return;

			if ( glyph.o ) {

				outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );
				length = outline.length;

				scaleX = scale;
				scaleY = scale;

				for ( i = 0; i < length; ) {

					action = outline[ i ++ ];

					//console.log( action );

					switch ( action ) {

					case 'm':

						// Move To

						x = outline[ i ++ ] * scaleX + offset;
						y = outline[ i ++ ] * scaleY;

						path.moveTo( x, y );
						break;

					case 'l':

						// Line To

						x = outline[ i ++ ] * scaleX + offset;
						y = outline[ i ++ ] * scaleY;
						path.lineTo( x, y );
						break;

					case 'q':

						// QuadraticCurveTo

						cpx  = outline[ i ++ ] * scaleX + offset;
						cpy  = outline[ i ++ ] * scaleY;
						cpx1 = outline[ i ++ ] * scaleX + offset;
						cpy1 = outline[ i ++ ] * scaleY;

						path.quadraticCurveTo( cpx1, cpy1, cpx, cpy );

						laste = pts[ pts.length - 1 ];

						if ( laste ) {

							cpx0 = laste.x;
							cpy0 = laste.y;

							for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2 ++ ) {

								var t = i2 / divisions;
								b2( t, cpx0, cpx1, cpx );
								b2( t, cpy0, cpy1, cpy );

							}

						}

						break;

					case 'b':

						// Cubic Bezier Curve

						cpx  = outline[ i ++ ] * scaleX + offset;
						cpy  = outline[ i ++ ] * scaleY;
						cpx1 = outline[ i ++ ] * scaleX + offset;
						cpy1 = outline[ i ++ ] * scaleY;
						cpx2 = outline[ i ++ ] * scaleX + offset;
						cpy2 = outline[ i ++ ] * scaleY;

						path.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, cpx, cpy );

						laste = pts[ pts.length - 1 ];

						if ( laste ) {

							cpx0 = laste.x;
							cpy0 = laste.y;

							for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2 ++ ) {

								var t = i2 / divisions;
								b3( t, cpx0, cpx1, cpx2, cpx );
								b3( t, cpy0, cpy1, cpy2, cpy );

							}

						}

						break;

					}

				}

			}

			return { offset: glyph.ha * scale, path: path };

		}

		//

		if ( size === undefined ) size = 100;
		if ( curveSegments === undefined ) curveSegments = 4;

		var data = this.data;

		var paths = createPaths( text );
		var shapes = [];

		for ( var p = 0, pl = paths.length; p < pl; p ++ ) {

			Array.prototype.push.apply( shapes, paths[ p ].toShapes() );

		}

		return shapes;

	}

};
