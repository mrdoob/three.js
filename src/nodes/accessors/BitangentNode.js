import { varying } from '../core/VaryingNode.js';
import { cameraViewMatrix } from './CameraNode.js';
import { normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView } from './NormalNode.js';
import { tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView } from './TangentNode.js';

const getBitangent = ( crossNormalTangent ) => crossNormalTangent.mul( tangentGeometry.w ).xyz;

export const bitangentGeometry = /*#__PURE__*/ varying( getBitangent( normalGeometry.cross( tangentGeometry ) ), 'v_bitangentGeometry' ).normalize().toVar( 'bitangentGeometry' );
export const bitangentLocal = /*#__PURE__*/ varying( getBitangent( normalLocal.cross( tangentLocal ) ), 'v_bitangentLocal' ).normalize().toVar( 'bitangentLocal' );
export const bitangentView = /*#__PURE__*/ varying( getBitangent( normalView.cross( tangentView ) ), 'v_bitangentView' ).normalize().toVar( 'bitangentView' );
export const bitangentWorld = /*#__PURE__*/ varying( getBitangent( normalWorld.cross( tangentWorld ) ), 'v_bitangentWorld' ).normalize().toVar( 'bitangentWorld' );
export const transformedBitangentView = /*#__PURE__*/ getBitangent( transformedNormalView.cross( transformedTangentView ) ).normalize().toVar( 'transformedBitangentView' );
export const transformedBitangentWorld = /*#__PURE__*/ transformedBitangentView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedBitangentWorld' );
