export * from './Three.Core.js';

export { WebGLRenderer } from './renderers/WebGLRenderer.js';
export { WebGLCubeRenderTarget } from './renderers/WebGLCubeRenderTarget.js';
export { ShaderLib } from './renderers/shaders/ShaderLib.js';
export { UniformsLib } from './renderers/shaders/UniformsLib.js';
export { UniformsUtils } from './renderers/shaders/UniformsUtils.js';
export { ShaderChunk } from './renderers/shaders/ShaderChunk.js';
export { PMREMGenerator } from './extras/PMREMGenerator.js';
export { ShaderMaterial } from './materials/ShaderMaterial.js';
export { RawShaderMaterial } from './materials/RawShaderMaterial.js';
export { WebGLUtils } from './renderers/webgl/WebGLUtils.js';

import { ShaderMaterial } from './materials/ShaderMaterial.js';
import { RawShaderMaterial } from './materials/RawShaderMaterial.js';
import { MaterialLoader } from './loaders/MaterialLoader.js';

MaterialLoader.registerMaterial( 'ShaderMaterial', ShaderMaterial );
MaterialLoader.registerMaterial( 'RawShaderMaterial', RawShaderMaterial );
