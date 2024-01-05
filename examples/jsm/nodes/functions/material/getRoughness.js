import getGeometryRoughness from './getGeometryRoughness.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

const getRoughness = tslFn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	return roughness.max( 0.0525 ).add( geometryRoughness ).clamp(); // 0.0525 corresponds to the base mip of a 256 cubemap.

} );

export default getRoughness;
