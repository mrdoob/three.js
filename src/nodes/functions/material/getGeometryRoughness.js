import { normalViewGeometry } from '../../accessors/Normal.js';
import { float, Fn } from '../../tsl/TSLBase.js';

const getGeometryRoughness = /*@__PURE__*/ Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'normal' ) === false ) {

		return float( 0 );

	}

	const dxy = normalViewGeometry.dFdx().abs().max( normalViewGeometry.dFdy().abs() );
	const geometryRoughness = dxy.x.max( dxy.y ).max( dxy.z );

	return geometryRoughness;

} );

export default getGeometryRoughness;
