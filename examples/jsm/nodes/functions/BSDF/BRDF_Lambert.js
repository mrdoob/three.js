import { ShaderNode } from '../../shadernode/ShaderNode.js';

const BRDF_Lambert = new ShaderNode( ( inputs ) => {

	return inputs.diffuseColor.mul( 1 / Math.PI ); // punctual light

} ); // validated

export default BRDF_Lambert;
