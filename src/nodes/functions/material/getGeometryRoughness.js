import { normalView } from '../../accessors/NormalNode.js';
import { Fn } from '../../shadernode/ShaderNode.js';

const getGeometryRoughness = Fn( () => {

	const dxy = normalView.dFdx().abs().max( normalView.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y ).max( dxy.z );

	return geometryRoughness;

} );

export default getGeometryRoughness;
