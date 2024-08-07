import DFGApprox from './DFGApprox.js';
import { Fn } from '../../shadernode/ShaderNode.js';

const EnvironmentBRDF = Fn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGApprox( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

export default EnvironmentBRDF;
