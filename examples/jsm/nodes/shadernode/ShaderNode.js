import { ShaderNodeScript, NodeHandler } from './ShaderNodeUtils.js';

const ShaderNode = new Proxy( ShaderNodeScript, NodeHandler );

export default ShaderNode;
