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

				const srcX = Math.floor( x / factor );
				const srcY = Math.floor( y / factor );
				const srcIdx = ( srcY * this.width + srcX ) * 4;
				const dstIdx = ( y * newWidth + x ) * 4;

				newData[ dstIdx ] = this.data[ srcIdx ];
				newData[ dstIdx + 1 ] = this.data[ srcIdx + 1 ];
				newData[ dstIdx + 2 ] = this.data[ srcIdx + 2 ];
				newData[ dstIdx + 3 ] = this.data[ srcIdx + 3 ];

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
