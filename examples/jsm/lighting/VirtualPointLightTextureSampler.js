import { FloatType, MirroredRepeatWrapping, NearestFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace, UnsignedByteType, Vector2, Vector4 } from 'three';

/** CPU base-level texture sampling for static VPL generation. */
class VirtualPointLightTextureSampler {

	constructor() {

		this.images = new WeakMap();
		this.uv = new Vector2();
		this.value = new Vector4();

	}

	sample( texture, hit ) {

		const sourceUV = texture.channel === 0 ? hit.uv : texture.channel === 1 ? hit.uv1 : null;
		if ( ! sourceUV ) throw new Error( 'VPL texture sampling requires UV channel 0 or 1.' );
		if ( texture.matrixAutoUpdate ) texture.updateMatrix();
		texture.transformUv( this.uv.copy( sourceUV ) );

		let image = this.images.get( texture );
		if ( ! image || image.version !== texture.source.version ) {

			const source = texture.image;
			if ( ! source || ! source.width || ! source.height ) throw new Error( 'Load material textures before generating VPLs.' );
			let data;
			let scale = 1 / 255;

			if ( source.data ) {

				if ( texture.format !== RGBAFormat || ! [ UnsignedByteType, FloatType ].includes( texture.type ) ) {

					throw new Error( 'VPL data textures require RGBA unsigned-byte or float pixels.' );

				}

				data = source.data;
				if ( texture.type === FloatType ) scale = 1;

			} else {

				const canvas = document.createElement( 'canvas' );
				canvas.width = source.width;
				canvas.height = source.height;
				const context = canvas.getContext( '2d', { willReadFrequently: true } );
				context.drawImage( source, 0, 0 );
				data = context.getImageData( 0, 0, canvas.width, canvas.height ).data;

			}

			image = { data, width: source.width, height: source.height, scale, version: texture.source.version };
			this.images.set( texture, image );

		}

		const wrap = ( index, size, mode ) => {

			if ( mode === RepeatWrapping ) return ( index % size + size ) % size;
			if ( mode === MirroredRepeatWrapping ) {

				const mirrored = ( index % ( size * 2 ) + size * 2 ) % ( size * 2 );
				return mirrored < size ? mirrored : size * 2 - mirrored - 1;

			}

			return Math.min( size - 1, Math.max( 0, index ) );

		};

		const x = this.uv.x * image.width - 0.5;
		const y = this.uv.y * image.height - 0.5;
		const nearest = texture.magFilter === NearestFilter;
		const ix = nearest ? Math.round( x ) : Math.floor( x );
		const iy = nearest ? Math.round( y ) : Math.floor( y );
		const fx = nearest ? 0 : x - ix;
		const fy = nearest ? 0 : y - iy;
		this.value.set( 0, 0, 0, 0 );

		for ( let j = 0; j < 2; j ++ ) {

			for ( let i = 0; i < 2; i ++ ) {

				const weight = ( i ? fx : 1 - fx ) * ( j ? fy : 1 - fy );
				if ( weight === 0 ) continue;
				const offset = ( wrap( iy + j, image.height, texture.wrapT ) * image.width + wrap( ix + i, image.width, texture.wrapS ) ) * 4;

				for ( let c = 0; c < 4; c ++ ) {

					let value = image.data[ offset + c ] * image.scale;
					// Decode RGB before filtering, matching sampling an sRGB GPU texture.

					if ( c < 3 && texture.colorSpace === SRGBColorSpace ) value = value <= 0.04045 ? value / 12.92 : Math.pow( ( value + 0.055 ) / 1.055, 2.4 );
					this.value.setComponent( c, this.value.getComponent( c ) + value * weight );

				}

			}

		}

		return this.value;

	}

}

export { VirtualPointLightTextureSampler };
