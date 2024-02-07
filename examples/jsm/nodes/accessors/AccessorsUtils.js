import { bitangentView } from './BitangentNode.js';
import { normalView } from './NormalNode.js';
import { tangentView } from './TangentNode.js';
import { mat3 } from '../shadernode/ShaderNode.js';

export const TBNViewMatrix = mat3( tangentView, bitangentView, normalView );
