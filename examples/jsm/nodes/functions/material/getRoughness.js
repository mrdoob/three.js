import getGeometryRoughness from './getGeometryRoughness.js';
import ShaderNode from '../../shadernode/ShaderNode.js';
import { add, max, min } from '../../shadernode/ShaderNodeElements.js';

const getRoughness = new ShaderNode( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness.call();

	let roughnessFactor = max( roughness, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
	roughnessFactor = add( roughnessFactor, geometryRoughness );
	roughnessFactor = min( roughnessFactor, 1.0 );

	return roughnessFactor;

} );

export default getRoughness;
