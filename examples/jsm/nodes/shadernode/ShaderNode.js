import { ShaderNodeScript, shaderNodeHandler } from './ShaderNodeUtils.js';

const ShaderNode = new Proxy( ShaderNodeScript, shaderNodeHandler );

export default ShaderNode;
