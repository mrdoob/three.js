import { ShapePath } from './ShapePath.js';

function Font( data ) {

	this.type = 'Font';

	this.data = data;

	this.userData = {};

}

Object.assign( Font.prototype, {

	isFont: true,

	generateShapes: function ( text, size = 100, paramaters = {} ) {

		const shapes = [];
		const paths = createPaths.call( this, text, size, paramaters );

		for ( let p = 0, pl = paths.length; p < pl; p ++ ) {

			Array.prototype.push.apply( shapes, paths[ p ].toShapes() );

		}

		return shapes;

	}

} );

function createPaths( text, size, paramaters = {} ) {

	const chars = Array.from ? Array.from( text ) : String( text ).split( '' ); // workaround for IE11, see #13988
	const scale = size / this.data.resolution;
	const lineHeight = ( this.data.boundingBox.yMax - this.data.boundingBox.yMin + this.data.underlineThickness ) * scale;
	const fixedWidth = Boolean(paramaters.fixedWidth);
	let letterSpacing = paramaters.letterSpacing;
	let widthScale = 1.0;

	if ( fixedWidth && typeof letterSpacing === 'string' ) {

		// Handle fixed-width percentage scaling (ex. 150% font width)

		const percentageSpacing = Number( letterSpacing.substr( 0, letterSpacing.length - 1 ) );

		if ( !isNaN( percentageSpacing ) ) {

			widthScale = percentageSpacing / 100;

		}

		letterSpacing = 0.0;

	} else {

		letterSpacing = isNaN( letterSpacing ) ? 0.0 : Number( letterSpacing );

	}

	const paths = [];
	
	let offsetX = 0, offsetY = 0, stepX = 0;

	for ( let i = 0; i < chars.length; i ++ ) {

		const char = chars[ i ];

		if ( char === '\n' ) {

			offsetX = 0;
			stepX = 0;
			offsetY -= lineHeight;

		} else {

			const ret = createPath( char, scale, offsetX, offsetY, this.data );

			if ( fixedWidth ) {

				stepX = getFixedFontWidth( this.data, scale, this.userData ) * widthScale;

			} else {

				stepX = ret.offsetX;

			}

			stepX += letterSpacing;

			offsetX += stepX;
			
			paths.push( ret.path );

		}

	}

	return paths;

}

function createPath( char, scale, offsetX, offsetY, data ) {

	const glyph = data.glyphs[ char ] || data.glyphs[ '?' ];

	if ( ! glyph ) {

		console.error( 'THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + '.' );

		return;

	}

	const path = new ShapePath();

	let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

	if ( glyph.o ) {

		const outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );

		for ( let i = 0, l = outline.length; i < l; ) {

			const action = outline[ i ++ ];

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

					break;

				case 'b': // bezierCurveTo

					cpx = outline[ i ++ ] * scale + offsetX;
					cpy = outline[ i ++ ] * scale + offsetY;
					cpx1 = outline[ i ++ ] * scale + offsetX;
					cpy1 = outline[ i ++ ] * scale + offsetY;
					cpx2 = outline[ i ++ ] * scale + offsetX;
					cpy2 = outline[ i ++ ] * scale + offsetY;

					path.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, cpx, cpy );

					break;

			}

		}

	}

	return { offsetX: glyph.ha * scale, path: path };

}

function getFixedFontWidth( data, scale, userData ) {
	
	if ( userData.fixedFontWidth ) {

		return userData.fixedFontWidth;

	}

	if ( ! data.glyphs ) {

		console.error( 'THREE.Font: font data does not contain any glyphs in font family ' + data.familyName + '.' );

		return;

	}

	userData.fixedFontWidth = 0.0;

	for ( const key in data.glyphs ) {

		userData.fixedFontWidth = Math.max( userData.fixedFontWidth, data.glyphs[key].ha * scale );

	}

	if ( isNaN(userData.fixedFontWidth) ) {

		console.warn( 'THREE.Font: font family ' + data.familyName + ' includes invalid glyphs. Using 100.0 as fixed width.' );

		userData.fixedFontWidth = 100.0 * scale;

	}

	return userData.fixedFontWidth;

}

export { Font };
