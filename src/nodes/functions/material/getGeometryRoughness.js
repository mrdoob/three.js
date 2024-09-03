import { normalView } from '../../accessors/Normal.js';
import { Fn } from '../../tsl/TSLBase.js';

const getGeometryRoughness = /*@__PURE__*/ Fn( () => {

	const dxy = normalView.dFdx().abs().max( normalView.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y ).max( dxy.z );

	return geometryRoughness;

} );

export default getGeometryRoughness;
