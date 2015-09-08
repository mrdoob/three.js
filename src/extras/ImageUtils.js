/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 */

var Constants = require( "../Constants" ),
	ImageLoader = require( "../loaders/ImageLoader" ),
	Texture = require( "../textures/Texture" ),
	CubeTexture = require( "../textures/CubeTexture" ),
	DataTexture = require( "../textures/DataTexture" );
	
module.exports = {

	crossOrigin: undefined,

	loadTexture: function ( url, mapping, onLoad, onError ) {

		var loader = new ImageLoader();
		loader.crossOrigin = this.crossOrigin;

		var texture = new Texture( undefined, mapping );

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

			if ( onLoad ) { onLoad( texture ); }

		}, undefined, function ( event ) {

			if ( onError ) { onError( event ); }

		} );

		texture.sourceFile = url;

		return texture;

	},

	loadTextureCube: function ( array, mapping, onLoad, onError ) {

		var images = [];

		var loader = new ImageLoader();
		loader.crossOrigin = this.crossOrigin;

		var texture = new CubeTexture( images, mapping );

		var loaded = 0;

		var loadTexture = function ( i ) {

			loader.load( array[ i ], function ( image ) {

				texture.images[ i ] = image;

				loaded += 1;

				if ( loaded === 6 ) {

					texture.needsUpdate = true;

					if ( onLoad ) { onLoad( texture ); }

				}

			}, undefined, onError );

		};

		for ( var i = 0, il = array.length; i < il; ++ i ) {

			loadTexture( i );

		}

		return texture;

	},

	loadCompressedTexture: function () {

		console.error( "ImageUtils.loadCompressedTexture has been removed. Use DDSLoader instead." );

	},

	loadCompressedTextureCube: function () {

		console.error( "ImageUtils.loadCompressedTextureCube has been removed. Use DDSLoader instead." );

	},

	getNormalMap: function ( image, depth ) {

		// Adapted from http://www.paulbrunt.co.uk/lab/heightnormal/

		var cross = function ( a, b ) {

			return [ a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ], a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ], a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ] ];

		};

		var subtract = function ( a, b ) {

			return [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ], a[ 2 ] - b[ 2 ] ];

		};

		var normalize = function ( a ) {

			var l = Math.sqrt( a[ 0 ] * a[ 0 ] + a[ 1 ] * a[ 1 ] + a[ 2 ] * a[ 2 ] );
			return [ a[ 0 ] / l, a[ 1 ] / l, a[ 2 ] / l ];

		};

		depth = depth | 1;

		var width = image.width;
		var height = image.height;

		var canvas = document.createElement( "canvas" );
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext( "2d" );
		context.drawImage( image, 0, 0 );

		var data = context.getImageData( 0, 0, width, height ).data;
		var imageData = context.createImageData( width, height );
		var output = imageData.data;

		var x, y, ly, uy, lx, ux,
			points, origin,	i,
			normals, num_points,
			v1, v2, normal, idx;

		for ( x = 0; x < width; x ++ ) {

			for ( y = 0; y < height; y ++ ) {

				ly = y - 1 < 0 ? 0 : y - 1;
				uy = y + 1 > height - 1 ? height - 1 : y + 1;
				lx = x - 1 < 0 ? 0 : x - 1;
				ux = x + 1 > width - 1 ? width - 1 : x + 1;

				points = [];
				origin = [ 0, 0, data[ ( y * width + x ) * 4 ] / 255 * depth ];
				points.push( [ - 1, 0, data[ ( y * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, - 1, data[ ( ly * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ 0, - 1, data[ ( ly * width + x ) * 4 ] / 255 * depth ] );
				points.push( [ 1, - 1, data[ ( ly * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 0, data[ ( y * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 1, data[ ( uy * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 0, 1, data[ ( uy * width + x ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, 1, data[ ( uy * width + lx ) * 4 ] / 255 * depth ] );

				normals = [];
				num_points = points.length;

				for ( i = 0; i < num_points; i ++ ) {

					v1 = points[ i ];
					v2 = points[ ( i + 1 ) % num_points ];
					v1 = subtract( v1, origin );
					v2 = subtract( v2, origin );
					normals.push( normalize( cross( v1, v2 ) ) );

				}

				normal = [ 0, 0, 0 ];

				for ( i = 0; i < normals.length; i ++ ) {

					normal[ 0 ] += normals[ i ][ 0 ];
					normal[ 1 ] += normals[ i ][ 1 ];
					normal[ 2 ] += normals[ i ][ 2 ];

				}

				normal[ 0 ] /= normals.length;
				normal[ 1 ] /= normals.length;
				normal[ 2 ] /= normals.length;

				idx = ( y * width + x ) * 4;

				output[ idx ] = ( ( normal[ 0 ] + 1.0 ) / 2.0 * 255 ) | 0;
				output[ idx + 1 ] = ( ( normal[ 1 ] + 1.0 ) / 2.0 * 255 ) | 0;
				output[ idx + 2 ] = ( normal[ 2 ] * 255 ) | 0;
				output[ idx + 3 ] = 255;

			}

		}

		context.putImageData( imageData, 0, 0 );

		return canvas;

	},

	generateDataTexture: function ( width, height, color ) {

		var size = width * height;
		var data = new Uint8Array( 3 * size );

		var r = Math.floor( color.r * 255 );
		var g = Math.floor( color.g * 255 );
		var b = Math.floor( color.b * 255 );

		for ( var i = 0; i < size; i ++ ) {

			data[ i * 3 ] = r;
			data[ i * 3 + 1 ] = g;
			data[ i * 3 + 2 ] = b;

		}

		var texture = new DataTexture( data, width, height, Constants.RGBFormat );
		texture.needsUpdate = true;

		return texture;

	}

};
