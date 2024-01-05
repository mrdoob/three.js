import { normalLocal } from '../../accessors/NormalNode.js';
import { tslFn } from '../../shadernode/ShaderNode.js';

const getGeometryRoughness = tslFn( () => {

	const dxy = normalLocal.dFdx().abs().max( normalLocal.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y, dxy.z );

	return geometryRoughness;

} );

export default getGeometryRoughness;
