import DFGApprox from './DFGApprox.js';
import { Fn } from '../../tsl/TSLBase.js';

const EnvironmentBRDF = /*@__PURE__*/ Fn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	const fab = DFGApprox( { dotNV, roughness } );
	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

export default EnvironmentBRDF;
