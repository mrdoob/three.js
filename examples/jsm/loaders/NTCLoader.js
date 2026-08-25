import { FileLoader, Loader } from 'three';
import { FORMAT, VERSION } from '../ntc/NTCManifest.js';
import { getChannel, layoutChannels } from '../ntc/NTCFormat.js';
import { decodeUint8Base64, decodeMLPLayersBase64 } from '../ntc/NTCBinaryCodec.js';

/**
 * A loader for `.ntc` (Neural Texture Compression) assets - a compact,
 * quantized multiresolution latent grid pyramid plus a float16-packed MLP
 * decoder, jointly fit against a set of PBR channels (see NTCManifest.js /
 * NTCFormat.js).
 *
 * `parse()` reconstructs `{ name, cpuModel, channelClassification }` -
 * exactly what `NTCMLPNode.applyNTCToMaterial( material, cpuModel,
 * channelClassification, options )` expects.
 *
 * @augments Loader
 * @three_import import { NTCLoader } from 'three/addons/loaders/NTCLoader.js';
 */
class NTCLoader extends Loader {

	/**
	 * Constructs a new NTC loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the parsed NTC asset to
	 * the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the JSON file to load.
	 * @param {function(Object)} onLoad - Executed when loading has finished.
	 * @param {onProgressCallback} onProgress - Executed while loading progresses.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'json' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( json ) {

			try {

				onLoad( scope.parse( json ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses a `.ntc` manifest.
	 *
	 * @param {(Object|string)} data - The JSON manifest, either parsed or as a string.
	 * @return {Object} `{ name, cpuModel, channelClassification }`, ready for `NTCMLPNode.applyNTCToMaterial`.
	 */
	parse( data ) {

		const manifest = ( typeof data === 'string' ) ? JSON.parse( data ) : data;

		validateManifest( manifest );

		const grids = manifest.latents.levels.map( ( level, index ) => decodeLevel( level, `latents.levels[${ index }]` ) );
		const decoderLayers = decodeMLPLayersBase64( manifest.mlp );

		const cpuModel = {
			channels: manifest.latents.channelsPerLevel,
			levels: grids.length,
			grids,
			decoder: { layers: decoderLayers },
			outputChannels: manifest.outputChannels !== undefined ?
				manifest.outputChannels : decoderLayers[ decoderLayers.length - 1 ].outputSize,
			wrap: manifest.latents.wrap || 'repeat'
		};

		const channelClassification = decodeChannelClassification( manifest.channels, manifest.renderFlags );

		return { name: manifest.name || '', cpuModel, channelClassification };

	}

}

function decodeChannelClassification( channels, renderFlags ) {

	const activeList = channels.activeKeys.map( ( key ) => getChannel( key ) );
	const { channels: activeChannels, totalChannels, packCount } = layoutChannels( activeList );

	return { activeChannels, totalChannels, packCount, constantValues: channels.constantValues || {}, renderFlags: renderFlags || null };

}

function decodeLevel( level, path ) {

	assertInteger( level.width, `${ path }.width`, 1 );
	assertInteger( level.height, `${ path }.height`, 1 );
	assertInteger( level.channels, `${ path }.channels`, 1, 4 );

	if ( level.dtype !== 'uint8' ) {

		throw new Error( `THREE.NTCLoader: Unsupported ${ path }.dtype "${ level.dtype }".` );

	}

	const expectedLength = level.width * level.height * level.channels;
	const data = decodeUint8Base64( level.dataBase64, level.min, level.max, expectedLength );

	return { width: level.width, height: level.height, channels: level.channels, data };

}

function validateManifest( manifest ) {

	if ( manifest === null || typeof manifest !== 'object' ) {

		throw new Error( 'THREE.NTCLoader: Manifest must be an object.' );

	}

	if ( manifest.format !== FORMAT ) {

		throw new Error( `THREE.NTCLoader: Unsupported format "${ manifest.format }" (expected "${ FORMAT }").` );

	}

	if ( manifest.version !== VERSION ) {

		throw new Error( `THREE.NTCLoader: Unsupported version ${ manifest.version } (expected ${ VERSION }).` );

	}

	if ( ! manifest.latents || ! Array.isArray( manifest.latents.levels ) || manifest.latents.levels.length === 0 ) {

		throw new Error( 'THREE.NTCLoader: Manifest must define a non-empty latents.levels array.' );

	}

	if ( ! manifest.mlp || typeof manifest.mlp.dataBase64 !== 'string' || ! Array.isArray( manifest.mlp.layout ) ) {

		throw new Error( 'THREE.NTCLoader: Manifest must define mlp.layout and mlp.dataBase64.' );

	}

	if ( ! manifest.channels || ! Array.isArray( manifest.channels.activeKeys ) ) {

		throw new Error( 'THREE.NTCLoader: Manifest must define channels.activeKeys.' );

	}

	for ( const key of manifest.channels.activeKeys ) {

		getChannel( key ); // throws a clear error on an unknown channel key

	}

}

function assertInteger( value, path, min, max = Infinity ) {

	if ( Number.isInteger( value ) === false || value < min || value > max ) {

		throw new Error( `THREE.NTCLoader: ${ path } must be an integer in [${ min }, ${ max }].` );

	}

}

export { NTCLoader };
