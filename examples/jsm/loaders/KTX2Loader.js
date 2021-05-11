/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats. While KTX 2.0 also allows
 * other hardware-specific formats, this loader does not yet parse them.
 *
 * This loader parses the KTX 2.0 container and then relies on
 * THREE.BasisTextureLoader to complete the transcoding process.
 *
 * References:
 * - KTX: http://github.khronos.org/KTX-Specification/
 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
 */

import {
	CompressedTexture,
	CompressedTextureLoader,
	FileLoader,
	LinearEncoding,
	sRGBEncoding,
} from '../../../build/three.module.js';
import {
	read as readKTX,
	KTX2ChannelETC1S,
	KTX2ChannelUASTC,
	KTX2Flags,
	KTX2Model,
	KTX2SupercompressionScheme,
	KTX2Transfer
} from '../libs/ktx-parse.module.js';
import { BasisTextureLoader } from './BasisTextureLoader.js';
import { ZSTDDecoder } from '../libs/zstddec.module.js';

class KTX2Loader extends CompressedTextureLoader {

	constructor( manager ) {

		super( manager );

		this.basisLoader = new BasisTextureLoader( manager );
		this.zstd = new ZSTDDecoder();

		this.zstd.init();

		if ( typeof MSC_TRANSCODER !== 'undefined' ) {

			console.warn(

				'THREE.KTX2Loader: Please update to latest "basis_transcoder".'
				+ ' "msc_basis_transcoder" is no longer supported in three.js r125+.'

			);

		}

	}

	setTranscoderPath( path ) {

		this.basisLoader.setTranscoderPath( path );

		return this;

	}

	setWorkerLimit( path ) {

		this.basisLoader.setWorkerLimit( path );

		return this;

	}

	detectSupport( renderer ) {

		this.basisLoader.detectSupport( renderer );

		return this;

	}

	dispose() {

		this.basisLoader.dispose();

		return this;

	}

	load( url, onLoad, onProgress, onError ) {

		var scope = this;

		var texture = new CompressedTexture();

		var bufferPending = new Promise( function ( resolve, reject ) {

			new FileLoader( scope.manager )
				.setPath( scope.path )
				.setResponseType( 'arraybuffer' )
				.load( url, resolve, onProgress, reject );

		} );

		bufferPending
			.then( function ( buffer ) {

				scope.parse( buffer, function ( _texture ) {

					texture.copy( _texture );
					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}, onError );

			} )
			.catch( onError );

		return texture;

	}

	parse( buffer, onLoad, onError ) {

		var scope = this;

		var ktx = readKTX( new Uint8Array( buffer ) );

		if ( ktx.pixelDepth > 0 ) {

			throw new Error( 'THREE.KTX2Loader: Only 2D textures are currently supported.' );

		}

		if ( ktx.layerCount > 1 ) {

			throw new Error( 'THREE.KTX2Loader: Array textures are not currently supported.' );

		}

		if ( ktx.faceCount > 1 ) {

			throw new Error( 'THREE.KTX2Loader: Cube textures are not currently supported.' );

		}

		var dfd = KTX2Utils.getBasicDFD( ktx );

		KTX2Utils.createLevels( ktx, this.zstd ).then( function ( levels ) {

			var basisFormat = dfd.colorModel === KTX2Model.UASTC
				? BasisTextureLoader.BasisFormat.UASTC_4x4
				: BasisTextureLoader.BasisFormat.ETC1S;

			var parseConfig = {

				levels: levels,
				width: ktx.pixelWidth,
				height: ktx.pixelHeight,
				basisFormat: basisFormat,
				hasAlpha: KTX2Utils.getAlpha( ktx ),

			};

			if ( basisFormat === BasisTextureLoader.BasisFormat.ETC1S ) {

				parseConfig.globalData = ktx.globalData;

			}

			return scope.basisLoader.parseInternalAsync( parseConfig );

		} ).then( function ( texture ) {

			texture.encoding = dfd.transferFunction === KTX2Transfer.SRGB
				? sRGBEncoding
				: LinearEncoding;
			texture.premultiplyAlpha = KTX2Utils.getPremultiplyAlpha( ktx );

			onLoad( texture );

		} ).catch( onError );

		return this;

	}

}

var KTX2Utils = {

	createLevels: async function ( ktx, zstd ) {

		if ( ktx.supercompressionScheme === KTX2SupercompressionScheme.ZSTD ) {

			await zstd.init();

		}

		var levels = [];
		var width = ktx.pixelWidth;
		var height = ktx.pixelHeight;

		for ( var levelIndex = 0; levelIndex < ktx.levels.length; levelIndex ++ ) {

			var levelWidth = Math.max( 1, Math.floor( width / Math.pow( 2, levelIndex ) ) );
			var levelHeight = Math.max( 1, Math.floor( height / Math.pow( 2, levelIndex ) ) );
			var levelData = ktx.levels[ levelIndex ].levelData;

			if ( ktx.supercompressionScheme === KTX2SupercompressionScheme.ZSTD ) {

				levelData = zstd.decode( levelData, ktx.levels[ levelIndex ].uncompressedByteLength );

			}

			levels.push( {

				index: levelIndex,
				width: levelWidth,
				height: levelHeight,
				data: levelData,

			} );

		}

		return levels;

	},

	getBasicDFD: function ( ktx ) {

		// Basic Data Format Descriptor Block is always the first DFD.
		return ktx.dataFormatDescriptor[ 0 ];

	},

	getAlpha: function ( ktx ) {

		var dfd = this.getBasicDFD( ktx );

		// UASTC

		if ( dfd.colorModel === KTX2Model.UASTC ) {

			if ( ( dfd.samples[ 0 ].channelID & 0xF ) === KTX2ChannelUASTC.RGBA ) {

				return true;

			}

			return false;

		}

		// ETC1S

		if ( dfd.samples.length === 2
			&& ( dfd.samples[ 1 ].channelID & 0xF ) === KTX2ChannelETC1S.AAA ) {

			return true;

		}

		return false;

	},

	getPremultiplyAlpha: function ( ktx ) {

		var dfd = this.getBasicDFD( ktx );

		return !! ( dfd.flags & KTX2Flags.ALPHA_PREMULTIPLIED );

	},

};

export { KTX2Loader };
