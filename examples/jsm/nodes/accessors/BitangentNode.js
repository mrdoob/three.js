import { varying } from '../core/VaryingNode.js';
import { cameraViewMatrix } from './CameraNode.js';
import { normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView } from './NormalNode.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView } from './TangentNode.js';

const getBitangent = ( crossNormalTangent ) => crossNormalTangent.mul( tangentGeometry.w ).xyz;

export const bitangentGeometry = varying( getBitangent( normalGeometry.cross( tangentGeometry ) ) ).normalize();
export const bitangentLocal = varying( getBitangent( normalLocal.cross( tangentLocal ) ) ).normalize();
export const bitangentView = varying( getBitangent( normalView.cross( tangentView ) ) ).normalize();
export const bitangentWorld = varying( getBitangent( normalWorld.cross( tangentWorld ) ) ).normalize();
export const transformedBitangentView = getBitangent( transformedNormalView.cross( transformedTangentView ) ).normalize();
export const transformedBitangentWorld = transformedBitangentView.transformDirection( cameraViewMatrix ).normalize();
