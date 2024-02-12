import { bitangentView } from './BitangentNode.js';
import { normalView } from './NormalNode.js';
import { tangentView } from './TangentNode.js';
import { mat3 } from '../shadernode/ShaderNode.js';
import { positionViewDirection } from './PositionNode.js';

export const TBNViewMatrix = mat3( tangentView, bitangentView, normalView );

export const parallaxDelta = positionViewDirection.mul( mat3( tangentView, bitangentView, normalView.negate() ) );
export const parallaxUV = ( uv, scale ) => uv.sub( parallaxDelta.mul( scale ) );
