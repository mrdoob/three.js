/**
 * MMD Toon Shader
 *
 */

import { UniformsUtils, ShaderLib } from '../../../build/three.module.js';

const MMDToonShader = {

	uniforms: UniformsUtils.merge( [
    ShaderLib.toon.uniforms,
    ShaderLib.phong.uniforms,
    ShaderLib.matcap.uniforms,
  ] ),

	// vertexShader: '#define TOON' + '\n' + ShaderLib.phong.vertexShader,
	vertexShader: ShaderLib.toon.vertexShader,

	fragmentShader: ShaderLib.toon.fragmentShader,
 
};

export { MMDToonShader };
