import { normalGeometry } from '../../accessors/NormalNode.js';
import { ShaderNode } from '../../shadernode/ShaderNode.js';

const getGeometryRoughness = new ShaderNode( () => {

	const dxy = normalGeometry.dFdx().abs().max( normalGeometry.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y ).max( dxy.z );

	return geometryRoughness;

} );

export default getGeometryRoughness;
