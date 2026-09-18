import getGeometryRoughness from './getGeometryRoughness.js';
import { Fn } from '../../tsl/TSLBase.js';

const getRoughness = /*@__PURE__*/ Fn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	// GGX's lobe width is proportional to roughness squared. Account for the normal variation within a pixel.
	const roughnessFloor = geometryRoughness.sqrt().mul( 0.4 );

	return roughness.add( geometryRoughness ).max( roughnessFloor ).min( 1.0 );

} );

export default getRoughness;
