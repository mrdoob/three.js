import getGeometryRoughness from './getGeometryRoughness.js';
import { Fn } from '../../tsl/TSLBase.js';

const getRoughness = /*@__PURE__*/ Fn( ( inputs ) => {

	const { roughness } = inputs;

	const geometryRoughness = getGeometryRoughness();

	return roughness.add( geometryRoughness ).min( 1.0 );

} );

export default getRoughness;
