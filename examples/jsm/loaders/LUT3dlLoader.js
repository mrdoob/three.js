import {
	ClampToEdgeWrapping,
	Data3DTexture,
	FileLoader,
	LinearFilter,
	Loader,
	RGBAFormat,
	UnsignedByteType,
} from 'three';

/**
 * A loader for the 3DL LUT format.
 *
 * References:
 * - [3D LUTs]{@link http://download.autodesk.com/us/systemdocs/help/2011/lustre/index.html?url=./files/WSc4e151a45a3b785a24c3d9a411df9298473-7ffd.htm,topicNumber=d0e9492}
 * - [Format Spec for .3dl]{@link https://community.foundry.com/discuss/topic/103636/format-spec-for-3dl?mode=Post&postID=895258}
 *
 * ```js
 * const loader = new LUT3dlLoader();
 * const map = loader.loadAsync( 'luts/Presetpro-Cinematic.3dl' );
 * ```
 *
 * @augments Loader
 */
export class LUT3dlLoader extends Loader {

	/**
	 * Constructs a new 3DL LUT loader.
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
	 * @return {LUT3dlLoader} A reference to this loader.
	 */
	setType( type ) {

		this.type = type;

		return this;

	}

	/**
	 * Starts loading from the given URL and passes the loaded 3DL LUT asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function({size:number,texture3D:Data3DTexture})} onLoad - Executed when the loading process has been finished.
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
	 * Parses the given 3DL LUT data and returns the resulting 3D data texture.
	 *
	 * @param {string} input - The raw 3DL LUT data as a string.
	 * @return {{size:number,texture3D:Data3DTexture}} The parsed 3DL LUT.
	 */
	parse( input ) {

		const regExpGridInfo = /^[\d ]+$/m;
		const regExpDataPoints = /^([\d.e+-]+) +([\d.e+-]+) +([\d.e+-]+) *$/gm;

		// The first line describes the positions of values on the LUT grid.
		let result = regExpGridInfo.exec( input );

		if ( result === null ) {

			throw new Error( 'LUT3dlLoader: Missing grid information' );

		}

		const gridLines = result[ 0 ].trim().split( /\s+/g ).map( Number );
		const gridStep = gridLines[ 1 ] - gridLines[ 0 ];
		const size = gridLines.length;
		const sizeSq = size ** 2;

		for ( let i = 1, l = gridLines.length; i < l; ++ i ) {

			if ( gridStep !== ( gridLines[ i ] - gridLines[ i - 1 ] ) ) {

				throw new Error( 'LUT3dlLoader: Inconsistent grid size' );

			}

		}

		const dataFloat = new Float32Array( size ** 3 * 4 );
		let maxValue = 0.0;
		let index = 0;

		while ( ( result = regExpDataPoints.exec( input ) ) !== null ) {

			const r = Number( result[ 1 ] );
			const g = Number( result[ 2 ] );
			const b = Number( result[ 3 ] );

			maxValue = Math.max( maxValue, r, g, b );

			const bLayer = index % size;
			const gLayer = Math.floor( index / size ) % size;
			const rLayer = Math.floor( index / ( sizeSq ) ) % size;

			// b grows first, then g, then r.
			const d4 = ( bLayer * sizeSq + gLayer * size + rLayer ) * 4;
			dataFloat[ d4 + 0 ] = r;
			dataFloat[ d4 + 1 ] = g;
			dataFloat[ d4 + 2 ] = b;

			++ index;

		}

		// Determine the bit depth to scale the values to [0.0, 1.0].
		const bits = Math.ceil( Math.log2( maxValue ) );
		const maxBitValue = Math.pow( 2, bits );

		const data = this.type === UnsignedByteType ? new Uint8Array( dataFloat.length ) : dataFloat;
		const scale = this.type === UnsignedByteType ? 255 : 1;

		for ( let i = 0, l = data.length; i < l; i += 4 ) {

			const i1 = i + 1;
			const i2 = i + 2;
			const i3 = i + 3;

			// Note: data is dataFloat when type is FloatType.
			data[ i ] = dataFloat[ i ] / maxBitValue * scale;
			data[ i1 ] = dataFloat[ i1 ] / maxBitValue * scale;
			data[ i2 ] = dataFloat[ i2 ] / maxBitValue * scale;
			data[ i3 ] = scale;

		}

		const texture3D = new Data3DTexture();
		texture3D.image.data = data;
		texture3D.image.width = size;
		texture3D.image.height = size;
		texture3D.image.depth = size;
		texture3D.format = RGBAFormat;
		texture3D.type = this.type;
		texture3D.magFilter = LinearFilter;
		texture3D.minFilter = LinearFilter;
		texture3D.wrapS = ClampToEdgeWrapping;
		texture3D.wrapT = ClampToEdgeWrapping;
		texture3D.wrapR = ClampToEdgeWrapping;
		texture3D.generateMipmaps = false;
		texture3D.needsUpdate = true;

		return {
			size,
			texture3D,
		};

	}

}
