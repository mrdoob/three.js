import { ShaderNode, mul } from '../../shadernode/ShaderNodeBaseElements.js';

const BRDF_Lambert = new ShaderNode( ( { baseColor } ) => {

	return mul( 1 / Math.PI, baseColor.rgb ); // punctual light

} ); // validated

export default BRDF_Lambert;
