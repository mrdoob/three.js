import getGeometryRoughness from './getGeometryRoughness.js';
import { ShaderNode } from '../../shadernode/ShaderNode.js';

const getRoughness = new ShaderNode( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness.call();

	let roughnessFactor = roughness.max( 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
	roughnessFactor = roughnessFactor.add( geometryRoughness );
	roughnessFactor = roughnessFactor.min( 1.0 );

	return roughnessFactor;

} );

export default getRoughness;
