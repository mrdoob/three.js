import { dfgLUT } from '../../lighting/DFGLUTNode.js';
import { Fn, vec2 } from '../../tsl/TSLBase.js';

const EnvironmentBRDF = /*@__PURE__*/ Fn( ( inputs ) => {

	const { dotNV, specularColor, specularF90, roughness } = inputs;

	// Use DFG LUT for accurate BRDF integration
	// LUT coordinates: x = roughness, y = NdotV
	const uv = vec2( roughness, dotNV );
	const fab = dfgLUT.sample( uv );

	return specularColor.mul( fab.x ).add( specularF90.mul( fab.y ) );

} );

export default EnvironmentBRDF;
