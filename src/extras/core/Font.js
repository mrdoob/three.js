/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Font = function ( data ) {

	this.data = data;

};

Object.assign( THREE.Font.prototype, {

	generateShapes: function ( text, size, divisions ) {

		function createPaths( text ) {

			var chars = String( text ).split( '' );
			var scale = size / data.resolution;
			var offset = 0;

			var paths = [];

			for ( var i = 0; i < chars.length; i ++ ) {

				var ret = createPath( chars[ i ], scale, offset );
				offset += ret.offset;

				paths.push( ret.path );

			}

			return paths;

		}

		function createPath( c, scale, offset ) {

			var glyph = data.glyphs[ c ] || data.glyphs[ '?' ];

			if ( ! glyph ) return;

			var path = new THREE.Path();

			var pts = [], b2 = THREE.ShapeUtils.b2, b3 = THREE.ShapeUtils.b3;
			var x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2, laste;

			if ( glyph.o ) {

				var outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );

				for ( var i = 0, l = outline.length; i < l; ) {

					var action = outline[ i ++ ];

					switch ( action ) {

						case 'm': // moveTo

							x = outline[ i ++ ] * scale + offset;
							y = outline[ i ++ ] * scale;

							path.moveTo( x, y );

							break;

						case 'l': // lineTo

							x = outline[ i ++ ] * scale + offset;
							y = outline[ i ++ ] * scale;

							path.lineTo( x, y );

							break;

						case 'q': // quadraticCurveTo

							cpx  = outline[ i ++ ] * scale + offset;
							cpy  = outline[ i ++ ] * scale;
							cpx1 = outline[ i ++ ] * scale + offset;
							cpy1 = outline[ i ++ ] * scale;

							path.quadraticCurveTo( cpx1, cpy1, cpx, cpy );

							laste = pts[ pts.length - 1 ];

							if ( laste ) {

								cpx0 = laste.x;
								cpy0 = laste.y;

								for ( var i2 = 1; i2 <= divisions; i2 ++ ) {

									var t = i2 / divisions;
									b2( t, cpx0, cpx1, cpx );
									b2( t, cpy0, cpy1, cpy );

								}

							}

							break;

						case 'b': // bezierCurveTo

							cpx  = outline[ i ++ ] * scale + offset;
							cpy  = outline[ i ++ ] * scale;
							cpx1 = outline[ i ++ ] * scale + offset;
							cpy1 = outline[ i ++ ] * scale;
							cpx2 = outline[ i ++ ] * scale + offset;
							cpy2 = outline[ i ++ ] * scale;

							path.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, cpx, cpy );

							laste = pts[ pts.length - 1 ];

							if ( laste ) {

								cpx0 = laste.x;
								cpy0 = laste.y;

								for ( var i2 = 1; i2 <= divisions; i2 ++ ) {

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
