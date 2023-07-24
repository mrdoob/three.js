import getGeometryRoughness from './getGeometryRoughness.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

const getRoughness = tslFn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	let roughnessFactor = roughness.max( 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
	roughnessFactor = roughnessFactor.add( geometryRoughness );
	roughnessFactor = roughnessFactor.min( 1.0 );

	return roughnessFactor;

} );

export default getRoughness;
