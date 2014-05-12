/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 */

THREE.ImageUtils = {

	crossOrigin: undefined,

	loadTexture: function ( url, mapping, onLoad, onError ) {

		var loader = new THREE.ImageLoader();
		loader.crossOrigin = this.crossOrigin;

		var texture = new THREE.Texture( undefined, mapping );

		var image = loader.load( url, function () {

			texture.needsUpdate = true;

			if ( onLoad ) onLoad( texture );

		}, undefined, function ( event ) {

			if ( onError ) onError( event );

		} );

		texture.image = image;
		texture.sourceFile = url;

		return texture;

	},

	loadTextureCube: function ( array, mapping, onLoad, onError ) {

		var images = [];
		images.loadCount = 0;

		var loader = new THREE.ImageLoader();
		loader.crossOrigin = this.crossOrigin;
		
		var texture = new THREE.Texture();
		texture.image = images;
		
		if ( mapping !== undefined ) texture.mapping = mapping;

		// no flipping needed for cube textures

		texture.flipY = false;

		for ( var i = 0, il = array.length; i < il; ++ i ) {

			var cubeImage = loader.load( array[i], function () {

				images.loadCount += 1;

				if ( images.loadCount === 6 ) {

					texture.needsUpdate = true;
					if ( onLoad ) onLoad( texture );

				}

			} );
			
			images[ i ] = cubeImage;
		}
		
		return texture;

	},
                
        
        // reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js
        decodeTGA: function ( arrayBuffer ) {
                   
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
    
            
            if ( arrayBuffer.length < 19 )
                console.error( 'ImageUtils::decodeTGA()- Not enough data to contain header.' );
            
            var content = new Uint8Array( arrayBuffer ),
                offset = 0,
                header = {
                  id_length: content[ offset++ ], 
                  colormap_type: content[ offset++ ],
                  image_type:      content[offset++],
                  colormap_index:  content[offset++] | content[offset++] << 8,
                  colormap_length: content[offset++] | content[offset++] << 8,
                  colormap_size:   content[offset++],

                  origin: [
                            content[offset++] | content[offset++] << 8,
                            content[offset++] | content[offset++] << 8
                    ],
                    width:      content[offset++] | content[offset++] << 8,
                    height:     content[offset++] | content[offset++] << 8,
                    pixel_size: content[offset++],
                    flags:      content[offset++]
                };
                    
            function tgaCheckHeader( header ) {
                switch( header.image_type ) {
                    // Check indexed type
                case TGA_TYPE_INDEXED:
                case TGA_TYPE_RLE_INDEXED:
                    if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1) {
                        console.error('Targa::tgaCheckHeader() - Invalid type colormap data for indexed type');
                    }
                    break;

                // Check colormap type
                case TGA_TYPE_RGB:
                case TGA_TYPE_GREY:
                case TGA_TYPE_RLE_RGB:
                case TGA_TYPE_RLE_GREY:
                    if (header.colormap_type) {
                        console.error('ImageUtils::tgaCheckHeader() - Invalid type colormap data for colormap type');
                    }
                    break;

                // What the need of a file without data ?
                case TGA_TYPE_NO_DATA:
                    console.error('ImageUtils::tgaCheckHeader() - No data');

                // Invalid type ?
                default:
                    console.error('ImageUtils::tgaCheckHeader() - Invalid type " '+ header.image_type + '"');
                }

                // Check image width and height
                if ( header.width <= 0 || header.height <=0 ) {
                    console.error( 'ImageUtils::tgaCheckHeader() - Invalid image size' );
                }

                // Check image pixel size 
                if (header.pixel_size !== 8  &&
                    header.pixel_size !== 16 &&
                    header.pixel_size !== 24 &&
                    header.pixel_size !== 32) {
                    console.error('ImageUtils::tgaCheckHeader() - Invalid pixel size "' + header.pixel_size + '"');
                }
            }

            // Check tga if it is valid format
            tgaCheckHeader( header );

            if ( header.id_length + offset > arrayBuffer.length ) {
                console.error('ImageUtils::load() - No data');
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
                        }

                        // Raw pixels.
                        else {
                            count *= pixel_size;
                            for (i = 0; i < count; ++i) {
                                    pixel_data[shift + i] = data[offset++];
                            }
                           shift += count;
                        }
                    }
                 }
                 // RAW Pixels
                 else {
                    pixel_data = data.subarray(
                         offset, offset += (use_pal ? header.width * header.height : pixel_total)
                    );
                 }
                
                 return { 
                    pixel_data: pixel_data, 
                    palettes: palettes 
                 };
            }
            
	    function tgaGetImageData8bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end
                                    , image, palettes ) {
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

	    function tgaGetImageData16bits(imageData, y_start, y_step, y_end, x_start, x_step, x_end
                                        , image) {
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
                    
                    switch( header.pixel_size )
                    {
                        case 8:
                            tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                            break;
                        case 16:
                            tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
                            break;
                        default:
                            console.error( 'ImageUtils::getTgaRGBA() - not support this format' );
                            break;
                    }
                    
                }
                else {
                    
                    switch( header.pixel_size )
                    {
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
                            console.error( 'ImageUtils::getTgaRGBA() - not support this format' );
                            break;  
                    }
                }
                // Load image data according to specific method
               // var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
                //func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
                return data;
            }
            
            var result = tgaParse( use_rle, use_pal, header, offset, content );
            var rgbaData = getTgaRGBA( header.width, header.height, result.pixel_data, result.palettes );
           
            
            return {
                width: header.width,
                height: header.height,
                data: rgbaData
            };
        },

        loadTGATexture: function ( url, mapping, onLoad, onError ) {
               
            var texture = new THREE.DataTexture();

            var loader = new THREE.XHRLoader();
            loader.setResponseType( 'arraybuffer' );
            loader.load( url, function ( buffer ) {

                var imageData = THREE.ImageUtils.decodeTGA( buffer );

                if ( imageData ) {
                    texture.image = imageData;
                    texture.sourceFile = url;
                    texture.needsUpdate = true;

                    if ( onLoad ) onLoad( texture );
				}            	

            } );
	              
			texture.sourceFile = url;

			return texture;

	    },

	getNormalMap: function ( image, depth ) {

		// Adapted from http://www.paulbrunt.co.uk/lab/heightnormal/

		var cross = function ( a, b ) {

			return [ a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ], a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ], a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ] ];

		}

		var subtract = function ( a, b ) {

			return [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ], a[ 2 ] - b[ 2 ] ];

		}

		var normalize = function ( a ) {

			var l = Math.sqrt( a[ 0 ] * a[ 0 ] + a[ 1 ] * a[ 1 ] + a[ 2 ] * a[ 2 ] );
			return [ a[ 0 ] / l, a[ 1 ] / l, a[ 2 ] / l ];

		}

		depth = depth | 1;

		var width = image.width;
		var height = image.height;

		var canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0 );

		var data = context.getImageData( 0, 0, width, height ).data;
		var imageData = context.createImageData( width, height );
		var output = imageData.data;

		for ( var x = 0; x < width; x ++ ) {

			for ( var y = 0; y < height; y ++ ) {

				var ly = y - 1 < 0 ? 0 : y - 1;
				var uy = y + 1 > height - 1 ? height - 1 : y + 1;
				var lx = x - 1 < 0 ? 0 : x - 1;
				var ux = x + 1 > width - 1 ? width - 1 : x + 1;

				var points = [];
				var origin = [ 0, 0, data[ ( y * width + x ) * 4 ] / 255 * depth ];
				points.push( [ - 1, 0, data[ ( y * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, - 1, data[ ( ly * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ 0, - 1, data[ ( ly * width + x ) * 4 ] / 255 * depth ] );
				points.push( [  1, - 1, data[ ( ly * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 0, data[ ( y * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 1, data[ ( uy * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 0, 1, data[ ( uy * width + x ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, 1, data[ ( uy * width + lx ) * 4 ] / 255 * depth ] );

				var normals = [];
				var num_points = points.length;

				for ( var i = 0; i < num_points; i ++ ) {

					var v1 = points[ i ];
					var v2 = points[ ( i + 1 ) % num_points ];
					v1 = subtract( v1, origin );
					v2 = subtract( v2, origin );
					normals.push( normalize( cross( v1, v2 ) ) );

				}

				var normal = [ 0, 0, 0 ];

				for ( var i = 0; i < normals.length; i ++ ) {

					normal[ 0 ] += normals[ i ][ 0 ];
					normal[ 1 ] += normals[ i ][ 1 ];
					normal[ 2 ] += normals[ i ][ 2 ];

				}

				normal[ 0 ] /= normals.length;
				normal[ 1 ] /= normals.length;
				normal[ 2 ] /= normals.length;

				var idx = ( y * width + x ) * 4;

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

			data[ i * 3 ] 	  = r;
			data[ i * 3 + 1 ] = g;
			data[ i * 3 + 2 ] = b;

		}

		var texture = new THREE.DataTexture( data, width, height, THREE.RGBFormat );
		texture.needsUpdate = true;

		return texture;

	}

};
