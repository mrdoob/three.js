import { Fn } from '../../tsl/TSLBase.js';

const BRDF_Lambert = Fn( ( inputs ) => {

	return inputs.diffuseColor.mul( 1 / Math.PI ); // punctual light

} ); // validated

export default BRDF_Lambert;
