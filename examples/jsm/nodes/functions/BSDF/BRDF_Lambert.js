import { ShaderNode, mul } from '../../shadernode/ShaderNodeBaseElements.js';

const BRDF_Lambert = new ShaderNode( ( inputs ) => {

	return mul( 1 / Math.PI, inputs.diffuseColor ); // punctual light

} ); // validated

export default BRDF_Lambert;
