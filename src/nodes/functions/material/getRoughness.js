import getGeometryRoughness from './getGeometryRoughness.js';
import { Fn } from '../../tsl/TSLBase.js';

const getRoughness = /*@__PURE__*/ Fn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	// GGX width scales with roughness squared; large normal variation needs a linear floor.
	const roughnessFloor = geometryRoughness.sqrt().mul( 0.4 ).max( geometryRoughness );

	return roughness.max( roughnessFloor ).min( 1.0 );

} );

export default getRoughness;
