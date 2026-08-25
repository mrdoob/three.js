import * as THREE from 'three';
import * as TSL from 'three/tsl';
import { fract, texture, uv } from 'three/tsl';
import { createHalfFloatLatentTexture } from './NTCHalfFloatTexture.js';
import { applyChannelActivation } from './NTCOutputActivations.js';
import { CHANNELS } from './NTCFormat.js';

/**
 * NTCMLPNode.js - evaluates a trained Neural Texture Compression (NTC) asset
 * (a small multiresolution latent grid + MLP decoder, see NTCLoader.js) as a
 * TSL node graph, and applies its decoded PBR channels onto a real
 * `THREE.MeshPhysicalNodeMaterial`.
 *
 * The MLP's weight/bias matrices are evaluated with native `mat4 * vec4`
 * multiplies (one hardware FMA-chain instruction per input quad, instead of
 * one `dot()` call per output neuron), and - wherever the renderer supports
 * it - live in a real fp16 storage buffer (`instancedArray(count, 'hmat4'/
 * 'hvec4')`) instead of an fp32 uniform array, halving the bytes on the
 * wire and using native fp16 ALU throughput for the multiply. This requires
 * the native WebGPU backend with the `shader-f16` GPU feature; every path
 * here transparently falls back to the original fp32 `uniformArray`
 * behavior when that isn't available (see `supportsHalfPrecisionStorage`).
 */

/**
 * True when `renderer` can back a real fp16 storage buffer for the MLP's
 * weights/biases: the native WebGPU backend (not the WebGL2 fallback, which
 * has no storage buffer concept at all) with the `shader-f16` GPU feature
 * actually available. `renderer` may be omitted (or not yet `init()`-ed) -
 * this only ever decides fp16 vs. the universal fp32 fallback below, never
 * throws.
 */
function supportsHalfPrecisionStorage( renderer ) {

	return Boolean(
		renderer &&
		renderer.backend &&
		renderer.backend.isWebGPUBackend === true &&
		typeof renderer.hasFeature === 'function' &&
		renderer.hasFeature( 'shader-f16' ) === true
	);

}

// Writes a flat array of THREE.Matrix4 into an `instancedArray(count,
// 'hmat4')` node's packed Uint16Array backing store, using the same
// DataUtils.toHalfFloat() convention as Float16BufferAttribute. Matrix4
// .elements is already column-major, the same layout WGSL's
// `array<mat4x4<f16>>` expects per column, so this is a direct
// element-by-element copy - no transpose bookkeeping needed.
function writeMat4HalfStorage( node, matrices ) {

	const array = node.value.array;

	for ( let m = 0; m < matrices.length; m ++ ) {

		const elements = matrices[ m ].elements;
		const base = m * 16;

		for ( let e = 0; e < 16; e ++ ) {

			array[ base + e ] = THREE.DataUtils.toHalfFloat( elements[ e ] );

		}

	}

	node.value.needsUpdate = true;

}

function writeVec4HalfStorage( node, vectors ) {

	const array = node.value.array;

	for ( let v = 0; v < vectors.length; v ++ ) {

		const vector = vectors[ v ];
		const base = v * 4;

		array[ base ] = THREE.DataUtils.toHalfFloat( vector.x );
		array[ base + 1 ] = THREE.DataUtils.toHalfFloat( vector.y );
		array[ base + 2 ] = THREE.DataUtils.toHalfFloat( vector.z );
		array[ base + 3 ] = THREE.DataUtils.toHalfFloat( vector.w );

	}

	node.value.needsUpdate = true;

}

/**
 * Builds the storage for one packed `mat4`-per-block MLP weight array (see
 * `packLayerWeightsMat4`): `node.element(i)` reads block `i`. When
 * `renderer` supports it, this is a real fp16 storage buffer; otherwise it
 * falls back to a plain `uniformArray(..., 'mat4')` fp32 uniform buffer.
 */
function createMat4Storage( renderer, matrices ) {

	if ( supportsHalfPrecisionStorage( renderer ) ) {

		const node = TSL.instancedArray( matrices.length, 'hmat4' );
		writeMat4HalfStorage( node, matrices );

		return { node, isHalf: true };

	}

	const node = TSL.uniformArray( matrices, 'mat4' );

	return { node, isHalf: false };

}

/**
 * Same as `createMat4Storage`, for a packed `vec4`-per-block array (an MLP
 * layer's biases).
 */
function createVec4Storage( renderer, vectors ) {

	if ( supportsHalfPrecisionStorage( renderer ) ) {

		const node = TSL.instancedArray( vectors.length, 'hvec4' );
		writeVec4HalfStorage( node, vectors );

		return { node, isHalf: true };

	}

	const node = TSL.uniformArray( vectors, 'vec4' );

	return { node, isHalf: false };

}

// Packs a flat array of scalar TSL nodes/plain numbers into vec4-grouped TSL
// nodes, zero-padding the final group. `half: true` packs into `hvec4`
// groups instead of `vec4` - required at the boundary feeding a
// half-precision weight multiply, since a half mat4 can only be multiplied
// against a half vec4.
function packVec4Inputs( inputs, half = false ) {

	const vec4Fn = half ? TSL.hvec4 : TSL.vec4;
	const groups = [];
	const groupCount = Math.ceil( inputs.length / 4 );

	for ( let i = 0; i < groupCount; i ++ ) {

		const offset = i * 4;

		groups.push( vec4Fn(
			inputs[ offset ] ?? 0,
			inputs[ offset + 1 ] ?? 0,
			inputs[ offset + 2 ] ?? 0,
			inputs[ offset + 3 ] ?? 0
		) );

	}

	return groups;

}

// Inverse of packVec4Inputs: extracts `outputSize` scalar nodes back out of
// a vec4-grouped array, narrowing each back to `float` when `half` is true.
function unpackVec4Outputs( groups, outputSize, half = false ) {

	const outputs = [];

	for ( let i = 0; i < outputSize; i ++ ) {

		const value = groups[ Math.floor( i / 4 ) ].element( i % 4 );
		outputs.push( half ? value.toFloat() : value );

	}

	return outputs;

}

// CPU-side: packs a flat, row-major `weights[outputSize][inputSize]` array
// into THREE.Matrix4 blocks ready for a storage/uniform array, one block
// per (outputVector, inputVector) quad-pair, laid out as
// `outputVector * inputVectorCount + inputVector`.
function packLayerWeightsMat4( weights, inputSize, outputSize ) {

	const inputVectorCount = Math.ceil( inputSize / 4 );
	const outputVectorCount = Math.ceil( outputSize / 4 );
	const packed = [];

	const weightAt = ( outputIndex, inputIndex ) => {

		if ( outputIndex >= outputSize || inputIndex >= inputSize ) return 0;

		return weights[ outputIndex * inputSize + inputIndex ] || 0;

	};

	for ( let outputVector = 0; outputVector < outputVectorCount; outputVector ++ ) {

		const outputBase = outputVector * 4;

		for ( let inputVector = 0; inputVector < inputVectorCount; inputVector ++ ) {

			const inputBase = inputVector * 4;

			const matrix = new THREE.Matrix4();
			matrix.set(
				weightAt( outputBase, inputBase ), weightAt( outputBase, inputBase + 1 ), weightAt( outputBase, inputBase + 2 ), weightAt( outputBase, inputBase + 3 ),
				weightAt( outputBase + 1, inputBase ), weightAt( outputBase + 1, inputBase + 1 ), weightAt( outputBase + 1, inputBase + 2 ), weightAt( outputBase + 1, inputBase + 3 ),
				weightAt( outputBase + 2, inputBase ), weightAt( outputBase + 2, inputBase + 1 ), weightAt( outputBase + 2, inputBase + 2 ), weightAt( outputBase + 2, inputBase + 3 ),
				weightAt( outputBase + 3, inputBase ), weightAt( outputBase + 3, inputBase + 1 ), weightAt( outputBase + 3, inputBase + 2 ), weightAt( outputBase + 3, inputBase + 3 )
			);

			packed.push( matrix );

		}

	}

	return packed;

}

// CPU-side: packs a flat bias array into THREE.Vector4s, zero-padded past
// `biases.length`.
function packLayerBiasesVec4( biases ) {

	const packed = [];
	const vectorCount = Math.ceil( biases.length / 4 );

	for ( let vectorIndex = 0; vectorIndex < vectorCount; vectorIndex ++ ) {

		const offset = vectorIndex * 4;

		packed.push( new THREE.Vector4(
			biases[ offset ] || 0,
			biases[ offset + 1 ] || 0,
			biases[ offset + 2 ] || 0,
			biases[ offset + 3 ] || 0
		) );

	}

	return packed;

}

// Evaluates one fully-connected layer against vec4-packed inputs using
// native `mat4 * vec4` multiplies. Materializes each output vec4 with
// `.toVar()` before returning it - without this, a multi-layer network
// built inline (not inside its own TSL.Fn()) compounds each layer's output
// expression into the next, in the worst case exceeding WGSL's
// private-address-space budget and failing pipeline creation outright.
function evaluateLinearLayerMat4( inputs, inputSize, outputSize, activation, getWeightMat4, getBiasVec4, half = false ) {

	const outputs = [];
	const inputVectorCount = Math.ceil( inputSize / 4 );
	const outputVectorCount = Math.ceil( outputSize / 4 );
	const zeroVec4Fn = half ? TSL.hvec4 : TSL.vec4;

	for ( let outputVector = 0; outputVector < outputVectorCount; outputVector ++ ) {

		let value = getBiasVec4 ? getBiasVec4( outputVector ) : zeroVec4Fn( 0 );

		for ( let inputVector = 0; inputVector < inputVectorCount; inputVector ++ ) {

			value = value.add( getWeightMat4( outputVector, inputVector ).mul( inputs[ inputVector ] ) );

		}

		if ( activation === 'relu' ) value = value.max( 0 );

		outputs.push( value.toVar() );

	}

	return outputs;

}

/**
 * Packs each trained latent grid level into an RGBA half-float DataTexture
 * so the runtime can rely on ordinary hardware bilinear filtering + repeat
 * wrap addressing for both interpolation and seamless tiling.
 */
function buildLevelTextures( cpuModel ) {

	return cpuModel.grids.map( ( grid ) =>
		createHalfFloatLatentTexture( grid.data, grid.width, grid.height, { channels: grid.channels } )
	);

}

/**
 * Builds the TSL expression that evaluates the trained multiresolution grid
 * + MLP decoder at `uvNode`, returning the raw array of `outputChannels`
 * scalar nodes (one per trained channel, before any per-channel output
 * activation - see `sliceChannels` below).
 *
 * `renderer`, when given (and already `init()`-ed), lets the decoder weights
 * live in a real fp16 storage buffer wherever the backend supports it - see
 * `createMat4Storage`/`createVec4Storage` above. Omit it to always use the
 * fp32 fallback.
 */
function evaluateNTCRaw( uvNode, cpuModel, levelTextures, renderer = null ) {

	const features = [];

	for ( let i = 0; i < levelTextures.length; i ++ ) {

		const sample = texture( levelTextures[ i ], uvNode );
		const channels = cpuModel.grids[ i ].channels;

		if ( channels > 0 ) features.push( sample.x );
		if ( channels > 1 ) features.push( sample.y );
		if ( channels > 2 ) features.push( sample.z );
		if ( channels > 3 ) features.push( sample.w );

	}

	const half = supportsHalfPrecisionStorage( renderer );
	let activations = packVec4Inputs( features, half );

	for ( let l = 0; l < cpuModel.decoder.layers.length; l ++ ) {

		const layer = cpuModel.decoder.layers[ l ];
		const weights = createMat4Storage( renderer, packLayerWeightsMat4( layer.weights, layer.inputSize, layer.outputSize ) );
		const biases = createVec4Storage( renderer, packLayerBiasesVec4( layer.biases ) );
		const inputVectorCount = Math.ceil( layer.inputSize / 4 );

		activations = evaluateLinearLayerMat4(
			activations, layer.inputSize, layer.outputSize, layer.activation,
			( outputVector, inputVector ) => weights.node.element( outputVector * inputVectorCount + inputVector ),
			( outputVector ) => biases.node.element( outputVector ),
			half
		);

	}

	const lastLayer = cpuModel.decoder.layers[ cpuModel.decoder.layers.length - 1 ];

	return unpackVec4Outputs( activations, lastLayer.outputSize, half );

}

/**
 * Slices the raw per-channel output array (see `evaluateNTCRaw`) into a
 * `{ [channelKey]: TSL node }` map, following the offsets of the *active*
 * (trained) channel layout (see NTCLoader.js). Each channel's raw
 * (linear-decoder) slice is passed through its own output activation here,
 * so every consumer downstream already sees values in the channel's
 * natural physical range.
 */
function sliceChannels( outputs, activeChannels ) {

	const slices = {};

	for ( const channel of activeChannels ) {

		const values = [];
		for ( let i = 0; i < channel.size; i ++ ) values.push( applyChannelActivation( outputs[ channel.offset + i ], channel.activation ) );

		if ( channel.size === 1 ) slices[ channel.key ] = values[ 0 ];
		else if ( channel.size === 2 ) slices[ channel.key ] = TSL.vec2( ...values );
		else slices[ channel.key ] = TSL.vec3( ...values );

	}

	return slices;

}

/**
 * Evaluates an `.ntc` asset (loaded via NTCLoader.js, `{ cpuModel,
 * channelClassification }`) and applies its decoded channels onto
 * `targetMaterial` - a real `THREE.MeshPhysicalNodeMaterial` - assigning
 * each active (trained) channel's decoded slice, or each constant
 * (untrained) channel's resolved value, onto the matching `*Node` property
 * (see NTCFormat.js's `applyActive`/`applyConstant` per channel). This is
 * the "plug an NTC into a Physical Node Material" entry point.
 *
 * Returns `{ levelTextures, slices }` so the caller can dispose the level
 * textures later, and inspect/reuse individual channel slices (e.g. for a
 * debug view).
 *
 * `options.renderer`, when given, lets the decoder weights use a real fp16
 * storage buffer instead of an fp32 uniform array on backends that support
 * it (see `supportsHalfPrecisionStorage` above).
 * `options.uvScaleNode`/`options.uvOffsetNode` optionally scale/offset the
 * sampled UV before tiling (`fract()`).
 */
function applyNTCToMaterial( targetMaterial, cpuModel, channelClassification, options = {} ) {

	const { activeChannels, constantValues, renderFlags } = channelClassification;
	const channels = options.channels || CHANNELS;

	if ( renderFlags ) {

		if ( renderFlags.side !== undefined ) targetMaterial.side = renderFlags.side;
		if ( renderFlags.transparent !== undefined ) targetMaterial.transparent = renderFlags.transparent;

	}

	const levelTextures = buildLevelTextures( cpuModel );

	let coord = uv();
	if ( options.uvScaleNode ) coord = coord.mul( options.uvScaleNode );
	if ( options.uvOffsetNode ) coord = coord.add( options.uvOffsetNode );
	const tiledUV = fract( coord );

	const outputs = evaluateNTCRaw( tiledUV, cpuModel, levelTextures, options.renderer );
	const slices = sliceChannels( outputs, activeChannels );

	const isActive = ( key ) => Object.prototype.hasOwnProperty.call( slices, key );

	for ( const channel of channels ) {

		if ( isActive( channel.key ) ) channel.applyActive( targetMaterial, slices[ channel.key ] );
		else channel.applyConstant( targetMaterial, constantValues[ channel.key ] );

	}

	targetMaterial._shadedColorNode = targetMaterial._shadedColorNode || null;
	targetMaterial.needsUpdate = true;

	return { levelTextures, slices };

}

export {
	supportsHalfPrecisionStorage,
	buildLevelTextures,
	evaluateNTCRaw,
	sliceChannels,
	applyNTCToMaterial,
	packVec4Inputs,
	unpackVec4Outputs,
	packLayerWeightsMat4,
	packLayerBiasesVec4,
	evaluateLinearLayerMat4,
	createMat4Storage,
	createVec4Storage
};
