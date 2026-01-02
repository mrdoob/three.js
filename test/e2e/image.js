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

		const newWidth = Math.round( this.width * factor );
		const newHeight = Math.round( this.height * factor );
		const newData = Buffer.alloc( newWidth * newHeight * 4 );

		for ( let y = 0; y < newHeight; y ++ ) {

			for ( let x = 0; x < newWidth; x ++ ) {

				// Map to source coordinates
				const srcX = x / factor;
				const srcY = y / factor;

				// Get integer and fractional parts
				const x0 = Math.floor( srcX );
				const y0 = Math.floor( srcY );
				const x1 = Math.min( x0 + 1, this.width - 1 );
				const y1 = Math.min( y0 + 1, this.height - 1 );
				const xFrac = srcX - x0;
				const yFrac = srcY - y0;

				// Get the four surrounding pixels
				const idx00 = ( y0 * this.width + x0 ) * 4;
				const idx10 = ( y0 * this.width + x1 ) * 4;
				const idx01 = ( y1 * this.width + x0 ) * 4;
				const idx11 = ( y1 * this.width + x1 ) * 4;

				const dstIdx = ( y * newWidth + x ) * 4;

				// Bilinear interpolation for each channel
				for ( let c = 0; c < 4; c ++ ) {

					const top = this.data[ idx00 + c ] * ( 1 - xFrac ) + this.data[ idx10 + c ] * xFrac;
					const bottom = this.data[ idx01 + c ] * ( 1 - xFrac ) + this.data[ idx11 + c ] * xFrac;
					newData[ dstIdx + c ] = Math.round( top * ( 1 - yFrac ) + bottom * yFrac );

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
