import { ShaderNodeScript, shaderNodeHandler } from './ShaderNodeUtils.js';

export default const ShaderNode = new Proxy( ShaderNodeScript, shaderNodeHandler );
