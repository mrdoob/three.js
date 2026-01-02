import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';
import * as fs from 'fs/promises';

class Image {

	constructor( width, height, data ) {

		this.width = width;
		this.height = height;
		this.data = data;

	}

	get bitmap() {

		return { width: this.width, height: this.height, data: this.data };

	}

	clone() {

		return new Image( this.width, this.height, Buffer.from( this.data ) );

	}

	scale( factor ) {

		if ( factor >= 1 ) {

			console.warn( 'Image.scale() is optimized for downscaling only.' );

		}

		const newWidth = Math.round( this.width * factor );
		const newHeight = Math.round( this.height * factor );
		const newData = Buffer.alloc( newWidth * newHeight * 4 );

		// Box filter for downscaling (averages all source pixels in the region)
		const scaleX = this.width / newWidth;
		const scaleY = this.height / newHeight;

		for ( let y = 0; y < newHeight; y ++ ) {

			for ( let x = 0; x < newWidth; x ++ ) {

				// Calculate source region
				const srcX0 = x * scaleX;
				const srcY0 = y * scaleY;
				const srcX1 = ( x + 1 ) * scaleX;
				const srcY1 = ( y + 1 ) * scaleY;

				const x0 = Math.floor( srcX0 );
				const y0 = Math.floor( srcY0 );
				const x1 = Math.min( Math.ceil( srcX1 ), this.width );
				const y1 = Math.min( Math.ceil( srcY1 ), this.height );

				const dstIdx = ( y * newWidth + x ) * 4;
				const sums = [ 0, 0, 0, 0 ];
				let totalWeight = 0;

				// Average all pixels in the source region with proper weighting
				for ( let sy = y0; sy < y1; sy ++ ) {

					for ( let sx = x0; sx < x1; sx ++ ) {

						// Calculate coverage weight for edge pixels
						const wx0 = Math.max( 0, Math.min( 1, sx + 1 - srcX0 ) );
						const wx1 = Math.max( 0, Math.min( 1, srcX1 - sx ) );
						const wy0 = Math.max( 0, Math.min( 1, sy + 1 - srcY0 ) );
						const wy1 = Math.max( 0, Math.min( 1, srcY1 - sy ) );
						const weight = Math.min( wx0, wx1 ) * Math.min( wy0, wy1 );

						const srcIdx = ( sy * this.width + sx ) * 4;
						for ( let c = 0; c < 4; c ++ ) {

							sums[ c ] += this.data[ srcIdx + c ] * weight;

						}

						totalWeight += weight;

					}

				}

				for ( let c = 0; c < 4; c ++ ) {

					newData[ dstIdx + c ] = Math.round( sums[ c ] / totalWeight );

				}

			}

		}

		this.width = newWidth;
		this.height = newHeight;
		this.data = newData;

		return this;

	}

	async write( filepath, quality = 95 ) {

		const rawImageData = {
			data: this.data,
			width: this.width,
			height: this.height
		};

		const encoded = jpeg.encode( rawImageData, quality );
		await fs.writeFile( filepath, encoded.data );

	}

	static async read( input ) {

		let buffer;

		if ( typeof input === 'string' ) {

			buffer = await fs.readFile( input );

		} else {

			buffer = input;

		}

		// Check if PNG (starts with PNG signature)
		if ( buffer[ 0 ] === 0x89 && buffer[ 1 ] === 0x50 && buffer[ 2 ] === 0x4E && buffer[ 3 ] === 0x47 ) {

			const png = PNG.sync.read( buffer );
			return new Image( png.width, png.height, png.data );

		}

		// Otherwise assume JPEG
		const decoded = jpeg.decode( buffer, { useTArray: true } );
		return new Image( decoded.width, decoded.height, Buffer.from( decoded.data ) );

	}

}

export { Image };
