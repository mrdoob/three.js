import { float, vec2, vec3 } from 'three/tsl';
import { OUTPUT_TYPES, channelEffectiveType, constantToNode, reconstructFinalNormal } from './NTCOutputTypes.js';

/**
 * Full vocabulary of standard PBR channels an `.ntc` asset can carry - one
 * shared latent grid + MLP decoder can jointly predict any subset of these
 * (NVIDIA neural texture compression style: one small decoder, many
 * correlated output channels), while any channel that never varies
 * spatially on the source material is instead carried as a plain constant
 * (see NTCLoader.js's `channels.constantValues`) and applied directly,
 * bypassing the network entirely.
 *
 * This is inference-only: each channel descriptor only carries what's
 * needed to *apply* a trained slice or a resolved constant onto a
 * `THREE.MeshPhysicalNodeMaterial` (`applyActive`/`applyConstant`) - not
 * the `resolveNode`/`resolveConstant` machinery a trainer would use to read
 * a live source material's own channels (that lives on the
 * `neural-appearance-ibl` branch's training tools, which this branch
 * doesn't carry).
 *
 * `activation` is the output nonlinearity applied to this channel's slice
 * of the decoder's (always-linear) raw output - see NTCOutputActivations.js
 * - chosen to match each channel's natural physical range:
 *  - 'sigmoid': bounded [0,1] scalars/colors (reflectance, coverage,
 *    roughness-like properties).
 *  - 'tanh': bounded [-1,1] signed vectors (tangent-space normal offsets,
 *    anisotropy direction).
 *  - 'softplus': unbounded, non-negative HDR values (emission, thickness).
 * Anything without an explicit `activation` falls back to plain linear.
 *
 * `clampRange` is the range this channel's *trained* value is clamped to
 * before use. `null` means "don't clamp" - used for vector-valued channels
 * that get a channel-specific treatment instead (normal reconstruction,
 * anisotropy, unbounded emission).
 *
 * `defaultValue` is what a *constant* channel falls back to when the
 * manifest doesn't carry an explicit constant for it - matching
 * `MeshPhysicalMaterial`'s own defaults for that property.
 *
 * A constant channel's resolved value is applied via `applyConstant` as a
 * literal TSL constant node (`float(...)`/`vec2(...)`/`vec3(...)`) assigned
 * onto the material's `*Node` property - not the plain (non-`Node`)
 * property, which would route through three.js's live-uniform
 * `MaterialReferenceNode` machinery instead of a shader-compiler-visible
 * constant.
 */

/**
 * Builds a regular "single `${key}Node` property, scalar clamp range,
 * scalar default" channel descriptor - the shape most PBR channels
 * (roughness, metalness, transmission, ...) actually have.
 */
function simpleScalarChannel( key, { activation, clampRange, defaultValue } ) {

	return {
		key,
		size: 1,
		activation,
		clampRange,
		defaultValue,
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial[ key + 'Node' ] = clampRange ? sliceNode.clamp( ...clampRange ) : sliceNode;

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial[ key + 'Node' ] = float( constantValue );

		}
	};

}

/**
 * Builds a "Color property + separate scalar intensity property" channel
 * descriptor - the shape `emissive`/`sheenColor` have. The trained/resolved
 * node is always the color already multiplied by its intensity.
 */
function colorIntensityChannel( key, { applyActive, applyConstant } ) {

	return {
		key,
		size: 3,
		activation: 'sigmoid',
		type: 'color',
		clampRange: [ 0, 1 ],
		defaultValue: [ 0, 0, 0 ],
		applyActive,
		applyConstant
	};

}

/**
 * Builds a scalar channel descriptor for a physical quantity that has a
 * fixed, known-in-advance range (e.g. an index of refraction) but isn't
 * itself naturally [0,1]-bounded - trained strictly as a [0,1] fraction of
 * `[min, max]` via 'sigmoid', decoded back to physical units
 * (`min + fraction * (max - min)`) on the way out.
 */
function fixedRangeScalarChannel( key, { min, max, defaultValue } ) {

	const range = max - min;

	return {
		key,
		size: 1,
		activation: 'sigmoid',
		clampRange: null,
		defaultValue,
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial[ key + 'Node' ] = sliceNode.clamp( 0, 1 ).mul( range ).add( min );

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial[ key + 'Node' ] = float( constantValue );

		}
	};

}

/**
 * Builds a "plain Color property, no separate intensity" channel descriptor
 * - the shape `attenuationColor` has.
 */
function simpleColorChannel( key, { defaultValue } ) {

	return {
		key,
		size: 3,
		activation: 'sigmoid',
		type: 'color',
		clampRange: [ 0, 1 ],
		defaultValue,
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial[ key + 'Node' ] = sliceNode.clamp( 0, 1 );

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial[ key + 'Node' ] = vec3( ...constantValue );

		}
	};

}

/**
 * Builds one endpoint (`index` 0 or 1) of a per-material *metadata* channel
 * for `material.iridescenceThicknessRange` - never trainable, always
 * carried as a constant (see NTCFormat's `iridescenceThickness` channel,
 * which reads it back via `targetMaterial.iridescenceThicknessRange`, so
 * this must stay ordered before it in `CHANNELS`).
 */
function iridescenceThicknessRangeChannel( index, fallback ) {

	const key = index === 0 ? 'iridescenceThicknessRangeMin' : 'iridescenceThicknessRangeMax';

	return {
		key,
		size: 1,
		clampRange: null,
		defaultValue: fallback,
		applyActive: () => {}, // never active - this channel is metadata-only
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial.iridescenceThicknessRange[ index ] = constantValue;

		}
	};

}

/**
 * Builds a `type: 'normal'` channel descriptor - a 2-component tangent-space
 * (dx, dy) offset trained/packed by the network, but reconstructed into a
 * full 3-component view-space vector at consumption time - see
 * NTCOutputTypes.js's `reconstructFinalNormal`. Shared by `normal` and
 * `clearcoatNormal` below.
 */
function normalChannel( key, materialNodeProperty ) {

	return {
		key,
		size: 2,
		activation: 'tanh',
		type: 'normal',
		clampRange: null,
		defaultValue: [ 0, 0, 1 ],
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial[ materialNodeProperty ] = OUTPUT_TYPES.normal.reconstruct( sliceNode );

		},
		// A constant normal/clearcoatNormal channel means "no bump" - leave
		// the corresponding *Node property unset entirely.
		applyConstant: () => {}
	};

}

/**
 * Finite stand-in for `Infinity` used by `attenuationDistance` below - see
 * that channel's `decodeConstant` for the inverse.
 */
const ATTENUATION_DISTANCE_INFINITY_SENTINEL = 1e6;

const CHANNELS = [
	{
		key: 'albedo', size: 3, activation: 'sigmoid', type: 'color', clampRange: null, defaultValue: [ 1, 1, 1 ],
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial._shadedColorNode = sliceNode;
			targetMaterial.colorNode = sliceNode;

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial._shadedColorNode = vec3( ...constantValue );
			targetMaterial.colorNode = targetMaterial._shadedColorNode;

		}
	},
	simpleScalarChannel( 'opacity', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 1 } ),
	normalChannel( 'normal', 'normalNode' ),
	simpleScalarChannel( 'roughness', { activation: 'sigmoid', clampRange: [ 0.02, 1 ], defaultValue: 1 } ),
	simpleScalarChannel( 'metalness', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 0 } ),
	simpleScalarChannel( 'clearcoat', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 0 } ),
	simpleScalarChannel( 'clearcoatRoughness', { activation: 'sigmoid', clampRange: [ 0.02, 1 ], defaultValue: 0 } ),
	normalChannel( 'clearcoatNormal', 'clearcoatNormalNode' ),
	simpleScalarChannel( 'iridescence', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 0 } ),
	fixedRangeScalarChannel( 'iridescenceIOR', { min: 1.0, max: 2.333, defaultValue: 1.3 } ),
	iridescenceThicknessRangeChannel( 0, 100 ),
	iridescenceThicknessRangeChannel( 1, 400 ),
	{
		key: 'iridescenceThickness', size: 1, activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 1,
		applyActive: ( targetMaterial, sliceNode ) => {

			const [ min, max ] = targetMaterial.iridescenceThicknessRange;
			targetMaterial.iridescenceThicknessNode = float( min ).add( sliceNode.clamp( 0, 1 ).mul( max - min ) );

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			const [ min, max ] = targetMaterial.iridescenceThicknessRange;
			targetMaterial.iridescenceThicknessNode = float( min + constantValue * ( max - min ) );

		}
	},
	simpleScalarChannel( 'transmission', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 0 } ),
	simpleScalarChannel( 'specularIntensity', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 1 } ),
	simpleColorChannel( 'specularColor', { defaultValue: [ 1, 1, 1 ] } ),
	fixedRangeScalarChannel( 'ior', { min: 1.0, max: 2.333, defaultValue: 1.5 } ),
	simpleScalarChannel( 'thickness', { activation: 'softplus', clampRange: null, defaultValue: 0 } ),
	simpleColorChannel( 'attenuationColor', { defaultValue: [ 1, 1, 1 ] } ),
	( () => {

		const key = 'attenuationDistance';
		const nodeKey = key + 'Node';

		return {
			key, size: 1, activation: 'softplus',
			clampRange: [ 0, ATTENUATION_DISTANCE_INFINITY_SENTINEL ], defaultValue: ATTENUATION_DISTANCE_INFINITY_SENTINEL,
			applyActive: ( targetMaterial, sliceNode ) => {

				targetMaterial[ nodeKey ] = sliceNode.clamp( 0, ATTENUATION_DISTANCE_INFINITY_SENTINEL );

			},
			applyConstant: ( targetMaterial, constantValue ) => {

				targetMaterial[ nodeKey ] = float( constantValue );

			},
			// Only meaningful for a *constant* value - a trained one is never
			// exactly the sentinel, since softplus never produces it exactly.
			decodeConstant: ( value ) => ( value === ATTENUATION_DISTANCE_INFINITY_SENTINEL ? Infinity : value )
		};

	} )(),
	colorIntensityChannel( 'emissive', {
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial.emissiveNode = sliceNode;

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial.emissiveNode = vec3( ...constantValue );

		}
	} ),
	{
		key: 'anisotropy', size: 2, activation: 'tanh', type: 'anisotropyVector', clampRange: null, defaultValue: [ 0, 0 ],
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial.anisotropyNode = sliceNode;

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial.anisotropyNode = vec2( ...constantValue );

		}
	},
	colorIntensityChannel( 'sheenColor', {
		applyActive: ( targetMaterial, sliceNode ) => {

			targetMaterial.sheenNode = sliceNode.clamp( 0, 1 );

		},
		applyConstant: ( targetMaterial, constantValue ) => {

			targetMaterial.sheenNode = vec3( ...constantValue );

		}
	} ),
	simpleScalarChannel( 'sheenRoughness', { activation: 'sigmoid', clampRange: [ 0.02, 1 ], defaultValue: 1 } ),
	simpleScalarChannel( 'dispersion', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 0 } ),
	simpleScalarChannel( 'retroreflectivity', { activation: 'sigmoid', clampRange: [ 0, 1 ], defaultValue: 0 } )
];

/**
 * True iff `value` (a plain number, or a [x,y]/[x,y,z] array - the shape
 * every channel's constant value takes) is exactly this channel's own
 * `defaultValue` - used below to skip `applyConstant` entirely for a
 * channel whose resolved value is a total no-op.
 */
function constantEqualsDefault( channel, value ) {

	const defaultValue = channel.defaultValue;
	if ( defaultValue === undefined ) return false;

	if ( Array.isArray( defaultValue ) ) {

		return Array.isArray( value ) && value.length === defaultValue.length && value.every( ( v, i ) => v === defaultValue[ i ] );

	}

	return value === defaultValue;

}

/**
 * Wraps every built-in channel's `applyConstant` so it's skipped entirely
 * when the resolved constant value is exactly this channel's own
 * `defaultValue` - i.e. a value that changes nothing about how the material
 * should shade, matching a freshly-constructed `MeshPhysicalNodeMaterial`'s
 * own defaults. This isn't just an optimization: several PBR properties
 * gate an entire extra shading branch on whether their `*Node` property is
 * non-null at all (`MeshPhysicalNodeMaterial`'s `useClearcoat`/`useSheen`/
 * `useAnisotropy`/`useTransmission` getters), independent of what value
 * that node evaluates to - assigning a literal default-valued constant node
 * would force-enable that branch unnecessarily.
 */
for ( const channel of CHANNELS ) {

	const applyConstant = channel.applyConstant;

	channel.applyConstant = ( targetMaterial, constantValue ) => {

		if ( constantEqualsDefault( channel, constantValue ) ) return;

		applyConstant( targetMaterial, constantValue );

	};

}

function getChannel( key, channels = CHANNELS ) {

	const channel = channels.find( ( c ) => c.key === key );
	if ( channel === undefined ) throw new Error( `THREE.NTCFormat: unknown channel "${key}".` );

	return channel;

}

/**
 * Decodes a `constantValues` map back into each channel's true semantic
 * values, via each channel's own (optional) `decodeConstant` hook - a
 * channel without one is passed through unchanged. Currently only
 * `attenuationDistance` defines one (unwrapping its
 * `ATTENUATION_DISTANCE_INFINITY_SENTINEL` encoding back into a real
 * `Infinity`).
 */
function decodeConstantValues( constantValues, channels = CHANNELS ) {

	const decoded = {};

	for ( const [ key, value ] of Object.entries( constantValues ) ) {

		const channel = channels.find( ( c ) => c.key === key );
		decoded[ key ] = ( channel && channel.decodeConstant ) ? channel.decodeConstant( value ) : value;

	}

	return decoded;

}

/**
 * Assigns contiguous flat offsets (and a total/pack count) to an arbitrary
 * subset of channel descriptors, in the order given - used to lay out the
 * active (trained) channel subset against the network's raw output.
 */
function layoutChannels( channelSubset ) {

	let offset = 0;
	const layout = [];

	for ( const channel of channelSubset ) {

		layout.push( { ...channel, offset } );
		offset += channel.size;

	}

	const totalChannels = offset;

	return { channels: layout, totalChannels, packCount: Math.ceil( totalChannels / 4 ) };

}

export {
	CHANNELS,
	getChannel,
	decodeConstantValues,
	layoutChannels,
	simpleScalarChannel,
	fixedRangeScalarChannel,
	colorIntensityChannel,
	simpleColorChannel,
	normalChannel,
	iridescenceThicknessRangeChannel,
	channelEffectiveType,
	constantToNode,
	reconstructFinalNormal
};
