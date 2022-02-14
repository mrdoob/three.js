import { ShaderNode,
	add, max, min, abs, dFdx, dFdy,
	normalGeometry
} from '../ShaderNode.js';

export const getGeometryRoughness = new ShaderNode( () => {

	const dxy = max( abs( dFdx( normalGeometry ) ), abs( dFdy( normalGeometry ) ) );
	const geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

	return geometryRoughness;

} );

export const getRoughness = new ShaderNode( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	let roughnessFactor = max( roughness, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.
	roughnessFactor = add( roughnessFactor, geometryRoughness );
	roughnessFactor = min( roughnessFactor, 1.0 );

	return roughnessFactor;

} );
