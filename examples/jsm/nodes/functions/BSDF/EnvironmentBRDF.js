import DFGApprox from './DFGApprox.js';
import { ShaderNode } from '../../shadernode/ShaderNode.js';

const EnvironmentBRDF = new ShaderNode( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGApprox.call( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

export default EnvironmentBRDF;
