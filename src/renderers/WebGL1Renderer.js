import { WebGLRenderer } from './WebGLRenderer.js';

class WebGL1Renderer extends WebGLRenderer {}

WebGL1Renderer.prototype.isWebGL1Renderer = true;

export { WebGL1Renderer };
