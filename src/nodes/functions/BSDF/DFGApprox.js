import { Fn, vec2 } from '../../tsl/TSLBase.js';
import { texture } from '../../accessors/TextureNode.js';
import { getDFGLUT } from '../../../renderers/shaders/DFGLUTData.js';

// Cached DFG LUT texture

let dfgLUT = null;

// DFG LUT sampling for physically-based rendering.
// Uses a precomputed lookup table for the split-sum approximation
// used in indirect specular lighting.
// Reference: "Real Shading in Unreal Engine 4" by Brian Karis

const DFGApprox = /*@__PURE__*/ Fn( ( { roughness, dotNV } ) => {

	if ( dfgLUT === null ) {

		dfgLUT = getDFGLUT();

	}

	const uv = vec2( roughness, dotNV );

	return texture( dfgLUT, uv ).rg;

} );

export default DFGApprox;
