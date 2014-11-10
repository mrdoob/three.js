/*
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.TGALoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.TGALoader.prototype = {

	constructor: THREE.TGALoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var texture = new THREE.DataTexture();

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			texture.image = scope.parse( buffer );
			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture );

		}, onProgress, onError );

		return texture;

	},

	// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js
	parse: function ( buffer ) {

		// TGA Constants
		var TGA_TYPE_NO_DATA = 0,
		TGA_TYPE_INDEXED = 1,
		TGA_TYPE_RGB = 2,
		TGA_TYPE_GREY = 3,
		TGA_TYPE_RLE_INDEXED = 9,
		TGA_TYPE_RLE_RGB = 10,
		TGA_TYPE_RLE_GREY = 11,

		TGA_ORIGIN_MASK = 0x30,
		TGA_ORIGIN_SHIFT = 0x04,
		TGA_ORIGIN_BL = 0x00,
		TGA_ORIGIN_BR = 0x01,
		TGA_ORIGIN_UL = 0x02,
		TGA_ORIGIN_UR = 0x03;


		if ( buffer.length < 19 )
			console.error( 'THREE.TGALoader.parse: Not enough data to contain header.' );

		var content = new Uint8Array( buffer ),
			offset = 0,
			header = {
				id_length:       content[ offset ++ ],
				colormap_type:   content[ offset ++ ],
				image_type:      content[ offset ++ ],
				colormap_index:  content[ offset ++ ] | content[ offset ++ ] << 8,
				colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
				colormap_size:   content[ offset ++ ],

				origin: [
					content[ offset ++ ] | content[ offset ++ ] << 8,
					content[ offset ++ ] | content[ offset ++ ] << 8
				],
				width:      content[ offset ++ ] | content[ offset ++ ] << 8,
				height:     content[ offset ++ ] | content[ offset ++ ] << 8,
				pixel_size: content[ offset ++ ],
				flags:      content[ offset ++ ]
			};

		function tgaCheckHeader( header ) {

			switch( header.image_type ) {

				// Check indexed type
				case TGA_TYPE_INDEXED:
				case TGA_TYPE_RLE_INDEXED:
					if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1) {
						console.error('THREE.TGALoader.parse.tgaCheckHeader: Invalid type colormap data for indexed type');
					}
					break;

				// Check colormap type
				case TGA_TYPE_RGB:
				case TGA_TYPE_GREY:
				case TGA_TYPE_RLE_RGB:
				case TGA_TYPE_RLE_GREY:
					if (header.colormap_type) {
						console.error('THREE.TGALoader.parse.tgaCheckHeader: Invalid type colormap data for colormap type');
					}
					break;

				// What the need of a file without data ?
				case TGA_TYPE_NO_DATA:
					console.error('THREE.TGALoader.parse.tgaCheckHeader: No data');

				// Invalid type ?
				default:
					console.error('THREE.TGALoader.parse.tgaCheckHeader: Invalid type " '+ header.image_type + '"');

			}

			// Check image width and height
			if ( header.width <= 0 || header.height <=0 ) {
				console.error( 'THREE.TGALoader.parse.tgaCheckHeader: Invalid image size' );
			}

			// Check image pixel size
			if (header.pixel_size !== 8  &&
				header.pixel_size !== 16 &&
				header.pixel_size !== 24 &&
				header.pixel_size !== 32) {
				console.error('THREE.TGALoader.parse.tgaCheckHeader: Invalid pixel size "' + header.pixel_size + '"');
			}

		}

		// Check tga if it is valid format
		tgaCheckHeader( header );

		if ( header.id_length + offset > buffer.length ) {
			console.error('THREE.TGALoader.parse: No data');
		}

		// Skip the needn't data
		offset += header.id_length;

		// Get targa information about RLE compression and palette
		var use_rle = false,
			use_pal = false,
			use_grey = false;

		switch ( header.image_type ) {

			case TGA_TYPE_RLE_INDEXED:
				use_rle = true;
				use_pal = true;
				break;

			case TGA_TYPE_INDEXED:
				use_pal = true;
				break;

			case TGA_TYPE_RLE_RGB:
				use_rle = true;
				break;

			case TGA_TYPE_RGB:
				break;

			case TGA_TYPE_RLE_GREY:
				use_rle = true;
				use_grey = true;
				break;

			case TGA_TYPE_GREY:
				use_grey = true;
				break;

		}

		// Parse tga image buffer
		function tgaParse( use_rle, use_pal, header, offset, data ) {

			var pixel_data,
				pixel_size,
				pixel_total,
				palettes;

				pixel_size = header.pixel_size >> 3;
				pixel_total = header.width * header.height * pixel_size;

			 // Read palettes
			 if ( use_pal ) {
				 palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );
			 }

			 // Read RLE
			 if ( use_rle ) {
				 pixel_data = new Uint8Array(pixel_total);

				var c, count, i;
				var shift = 0;
				var pixels = new Uint8Array(pixel_size);

				while (shift < pixel_total) {
					c     = data[offset++];
					count = (c & 0x7f) + 1;

					// RLE pixels.
					if (c & 0x80) {
						// Bind pixel tmp array
						for (i = 0; i < pixel_size; ++i) {
								pixels[i] = data[offset++];
						}

						// Copy pixel array
						for (i = 0; i < count; ++i) {
								pixel_data.set(pixels, shift + i * pixel_size);
						}

						shift += pixel_size * count;

					} else {
						// Raw pixels.
						count *= pixel_size;
						for (i = 0; i < count; ++i) {
								pixel_data[shift + i] = data[offset++];
						}
						shift += count;
					}
				}
			 } else {
				// RAW Pixels
				pixel_data = data.subarray(
					 offset, offset += (use_pal ? header.width * header.height : pixel_total)
				);
			 }

			 return {
				pixel_data: pixel_data,
				palettes: palettes
			 };
		}

		function tgaGetImageData8bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes) {

			var colormap = palettes;
			var color, i = 0, x, y;
					var width = header.width;

			for (y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i++) {
					color = image[i];
					imageData[(x + width * y) * 4 + 3] = 255;
					imageData[(x + width * y) * 4 + 2] = colormap[(color * 3) + 0];
					imageData[(x + width * y) * 4 + 1] = colormap[(color * 3) + 1];
					imageData[(x + width * y) * 4 + 0] = colormap[(color * 3) + 2];
				}
			}

			return imageData;

		};

		function tgaGetImageData16bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {

			var color, i = 0, x, y;
			var width = header.width;

			for (y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 2) {
					color = image[i + 0] + (image[i + 1] << 8); // Inversed ?
					imageData[(x + width * y) * 4 + 0] = (color & 0x7C00) >> 7;
					imageData[(x + width * y) * 4 + 1] = (color & 0x03E0) >> 2;
					imageData[(x + width * y) * 4 + 2] = (color & 0x001F) >> 3;
					imageData[(x + width * y) * 4 + 3] = (color & 0x8000) ? 0 : 255;
				}
			}

			return imageData;

		};

		function tgaGetImageData24bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {

			var i = 0, x, y;
			var width = header.width;

			for (y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 3) {
					imageData[(x + width * y) * 4 + 3] = 255;
					imageData[(x + width * y) * 4 + 2] = image[i + 0];
					imageData[(x + width * y) * 4 + 1] = image[i + 1];
					imageData[(x + width * y) * 4 + 0] = image[i + 2];
				}
			}

			return imageData;

		};

		function tgaGetImageData32bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {

			var i = 0, x, y;
			var width = header.width;

			for (y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 4) {
					imageData[(x + width * y) * 4 + 2] = image[i + 0];
					imageData[(x + width * y) * 4 + 1] = image[i + 1];
					imageData[(x + width * y) * 4 + 0] = image[i + 2];
					imageData[(x + width * y) * 4 + 3] = image[i + 3];
				}
			}

			return imageData;

		};

		function tgaGetImageDataGrey8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			var color, i = 0, x, y;
			var width = header.width;

			for (y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i++) {
					color = image[i];
					imageData[(x + width * y) * 4 + 0] = color;
					imageData[(x + width * y) * 4 + 1] = color;
					imageData[(x + width * y) * 4 + 2] = color;
					imageData[(x + width * y) * 4 + 3] = 255;
				}
			}

			return imageData;

		};

		function tgaGetImageDataGrey16bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end, image) {

			var i = 0, x, y;
			var width = header.width;

			for (y = y_start; y !== y_end; y += y_step) {
				for (x = x_start; x !== x_end; x += x_step, i += 2) {
					imageData[(x + width * y) * 4 + 0] = image[i + 0];
					imageData[(x + width * y) * 4 + 1] = image[i + 0];
					imageData[(x + width * y) * 4 + 2] = image[i + 0];
					imageData[(x + width * y) * 4 + 3] = image[i + 1];
				}
			}

			return imageData;

		};

		function getTgaRGBA( width, height, image, palette ) {

			var x_start,
				y_start,
				x_step,
				y_step,
				x_end,
				y_end,
				data = new Uint8Array(width * height * 4);

			switch( (header.flags & TGA_ORIGIN_MASK) >> TGA_ORIGIN_SHIFT ) {
				default:
				case TGA_ORIGIN_UL:
					x_start = 0;
					x_step = 1;
					x_end = width;
					y_start = 0;
					y_step = 1;
					y_end = height;
					break;

				case TGA_ORIGIN_BL:
					x_start = 0;
					x_step = 1;
					x_end = width;
					y_start = height - 1;
					y_step = -1;
					y_end = -1;
					break;

				case TGA_ORIGIN_UR:
					x_start = width - 1;
					x_step = -1;
					x_end = -1;
					y_start = 0;
					y_step = 1;
					y_end = height;
					break;

				case TGA_ORIGIN_BR:
					x_start = width - 1;
					x_step = -1;
					x_end = -1;
					y_start = height - 1;
					y_step = -1;
					y_end = -1;
					break;

			}

			if ( use_grey ) {

				switch( header.pixel_size ) {
					case 8:
						tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;
					case 16:
						tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;
					default:
						console.error( 'THREE.TGALoader.parse.getTgaRGBA: not support this format' );
						break;
				}

			} else {

				switch( header.pixel_size ) {
					case 8:
						tgaGetImageData8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
						break;

					case 16:
						tgaGetImageData16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 24:
						tgaGetImageData24bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 32:
						tgaGetImageData32bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					default:
						console.error( 'THREE.TGALoader.parse.getTgaRGBA: not support this format' );
						break;
				}

			}

			// Load image data according to specific method
			// var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
			// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
			return data;

		}

		var result = tgaParse( use_rle, use_pal, header, offset, content );
		var rgbaData = getTgaRGBA( header.width, header.height, result.pixel_data, result.palettes );

		return {
			width: header.width,
			height: header.height,
			data: rgbaData
		};

	}

};
