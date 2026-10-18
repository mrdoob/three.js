import getGeometryRoughness from './getGeometryRoughness.js';
import { Fn } from '../../tsl/TSLBase.js';

const getRoughness = /*@__PURE__*/ Fn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	// Minimum roughness, so even a perfect mirror samples a prefiltered level of the environment map.
	// Matches Filament's desktop MIN_PERCEPTUAL_ROUGHNESS: https://github.com/google/filament/blob/main/shaders/src/surface_material.fs
	let roughnessFactor = roughness.max( 0.045 );
	roughnessFactor = roughnessFactor.add( geometryRoughness );
	roughnessFactor = roughnessFactor.min( 1.0 );

	return roughnessFactor;

} );

export default getRoughness;
