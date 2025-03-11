import {
	ClampToEdgeWrapping,
	Data3DTexture,
	FileLoader,
	LinearFilter,
	Loader,
	UnsignedByteType,
	Vector3,
} from 'three';

/**
 * A loader for the Cube LUT format.
 *
 * References:
 * - [Cube LUT Specification]{@link https://web.archive.org/web/20220220033515/https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf}
 *
 * ```js
 * const loader = new LUTCubeLoader();
 * const map = loader.loadAsync( 'luts/Bourbon 64.CUBE' );
 * ```
 *
 * @augments Loader
 */
export class LUTCubeLoader extends Loader {

	/**
	 * Constructs a new Cube LUT loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * The texture type.
		 *
		 * @type {(UnsignedByteType|FloatType)}
		 * @default UnsignedByteType
		 */
		this.type = UnsignedByteType;

	}

	/**
	 * Sets the texture type.
	 *
	 * @param {(UnsignedByteType|FloatType)} type - The texture type to set.
	 * @return {LUTCubeLoader} A reference to this loader.
	 */
	setType( type ) {

		this.type = type;

		return this;

	}

	/**
	 * Starts loading from the given URL and passes the loaded Cube LUT asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function({title:string,size:number,domainMin:Vector3,domainMax:Vector3,texture3D:Data3DTexture})} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'text' );
		loader.load( url, text => {

			try {

				onLoad( this.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				this.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given Cube LUT data and returns the resulting 3D data texture.
	 *
	 * @param {string} input - The raw Cube LUT data as a string.
	 * @return {{title:string,size:number,domainMin:Vector3,domainMax:Vector3,texture3D:Data3DTexture}} The parsed Cube LUT.
	 */
	parse( input ) {

		const regExpTitle = /TITLE +"([^"]*)"/;
		const regExpSize = /LUT_3D_SIZE +(\d+)/;
		const regExpDomainMin = /DOMAIN_MIN +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDomainMax = /DOMAIN_MAX +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDataPoints = /^([\d.e+-]+) +([\d.e+-]+) +([\d.e+-]+) *$/gm;

		let result = regExpTitle.exec( input );
		const title = ( result !== null ) ? result[ 1 ] : null;

		result = regExpSize.exec( input );

		if ( result === null ) {

			throw new Error( 'LUTCubeLoader: Missing LUT_3D_SIZE information' );

		}

		const size = Number( result[ 1 ] );
		const length = size ** 3 * 4;
		const data = this.type === UnsignedByteType ? new Uint8Array( length ) : new Float32Array( length );

		const domainMin = new Vector3( 0, 0, 0 );
		const domainMax = new Vector3( 1, 1, 1 );

		result = regExpDomainMin.exec( input );

		if ( result !== null ) {

			domainMin.set( Number( result[ 1 ] ), Number( result[ 2 ] ), Number( result[ 3 ] ) );

		}

		result = regExpDomainMax.exec( input );

		if ( result !== null ) {

			domainMax.set( Number( result[ 1 ] ), Number( result[ 2 ] ), Number( result[ 3 ] ) );

		}

		if ( domainMin.x > domainMax.x || domainMin.y > domainMax.y || domainMin.z > domainMax.z ) {

			throw new Error( 'LUTCubeLoader: Invalid input domain' );

		}

		const scale = this.type === UnsignedByteType ? 255 : 1;
		let i = 0;

		while ( ( result = regExpDataPoints.exec( input ) ) !== null ) {

			data[ i ++ ] = Number( result[ 1 ] ) * scale;
			data[ i ++ ] = Number( result[ 2 ] ) * scale;
			data[ i ++ ] = Number( result[ 3 ] ) * scale;
			data[ i ++ ] = scale;

		}

		const texture3D = new Data3DTexture();
		texture3D.image.data = data;
		texture3D.image.width = size;
		texture3D.image.height = size;
		texture3D.image.depth = size;
		texture3D.type = this.type;
		texture3D.magFilter = LinearFilter;
		texture3D.minFilter = LinearFilter;
		texture3D.wrapS = ClampToEdgeWrapping;
		texture3D.wrapT = ClampToEdgeWrapping;
		texture3D.wrapR = ClampToEdgeWrapping;
		texture3D.generateMipmaps = false;
		texture3D.needsUpdate = true;

		return {
			title,
			size,
			domainMin,
			domainMax,
			texture3D,
		};

	}

}
