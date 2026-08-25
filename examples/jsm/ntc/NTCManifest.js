// Exported as .ntc (JSON content, format: 'three-ntc') - see FORMAT/VERSION
// below.

import { encodeUint8Base64, encodeMLPLayersBase64 } from './NTCBinaryCodec.js';

const FORMAT = 'three-ntc';
const VERSION = 1;

/**
 * A `.ntc` (Neural Texture Compression) asset is one shared multiresolution
 * latent grid + MLP decoder (NVIDIA NTC style: one small decoder, many
 * jointly-fit, correlated PBR output channels), plus the channel layout/
 * constant-value metadata needed to slice that decoder's output back into
 * named PBR channels at load time (see NTCLoader.js / NTCMLPNode.js).
 *
 * `cpuModel` is `{ channels, grids, decoder: { layers }, outputChannels }` -
 * the same shape a `NeuralTextureTrainer`-style trainer produces (this
 * branch doesn't carry that trainer; `.ntc` assets are produced offline, on
 * the `neural-appearance-ibl` branch's training tools, then converted - see
 * `examples/ntc/README.md`). `channelClassification` is `{ activeChannels,
 * constantValues, totalChannels, packCount, renderFlags }` - the layout
 * that model's output was trained against.
 *
 * Each latent grid level is quantized to uint8 against its own `[min, max]`
 * range (a plain per-level min/max scan, unless `options.quantizationRanges`
 * supplies one explicitly - e.g. reusing the range a quantization-aware
 * trainer already tracked), and the decoder MLP's weights/biases are packed
 * as float16 - both via NTCBinaryCodec.js.
 */
function encodeNTC( cpuModel, channelClassification, options = {} ) {

	const ranges = options.quantizationRanges || cpuModel.grids.map( ( grid ) => computeRange( grid.data ) );

	const levels = cpuModel.grids.map( ( grid, index ) => {

		const [ min, max ] = ranges[ index ];

		return {
			width: grid.width,
			height: grid.height,
			channels: grid.channels,
			wrap: options.wrap || 'repeat',
			dtype: 'uint8',
			min,
			max,
			dataBase64: encodeUint8Base64( grid.data, min, max )
		};

	} );

	return {
		format: FORMAT,
		version: VERSION,
		name: options.name,
		source: options.source || 'THREE.NTCManifest',
		latents: {
			channelsPerLevel: cpuModel.channels,
			wrap: options.wrap || 'repeat',
			levels
		},
		outputChannels: cpuModel.outputChannels,
		mlp: encodeMLPLayersBase64( cpuModel.decoder.layers ),
		renderFlags: channelClassification.renderFlags || null,
		channels: {
			activeKeys: channelClassification.activeChannels.map( ( channel ) => channel.key ),
			constantValues: channelClassification.constantValues
		}
	};

}

function computeRange( data ) {

	let min = Infinity;
	let max = - Infinity;

	for ( let i = 0; i < data.length; i ++ ) {

		if ( data[ i ] < min ) min = data[ i ];
		if ( data[ i ] > max ) max = data[ i ];

	}

	if ( min > max ) {

		min = 0; max = 0;

	} // empty grid, shouldn't happen in practice

	return [ min, max ];

}

export { FORMAT, VERSION, encodeNTC };
