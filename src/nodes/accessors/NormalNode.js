import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { property } from '../core/PropertyNode.js';
import { cameraViewMatrix } from './CameraNode.js';
import { modelNormalMatrix } from './ModelNode.js';
import { vec3 } from '../shadernode/ShaderNode.js';

export const normalGeometry = /*#__PURE__*/ attribute( 'normal', 'vec3', vec3( 0, 1, 0 ) );
export const normalLocal = /*#__PURE__*/ normalGeometry.toVar( 'normalLocal' );
export const normalView = /*#__PURE__*/ varying( modelNormalMatrix.mul( normalLocal ), 'v_normalView' ).normalize().toVar( 'normalView' );
export const normalWorld = /*#__PURE__*/ varying( normalView.transformDirection( cameraViewMatrix ), 'v_normalWorld' ).normalize().toVar( 'normalWorld' );
export const transformedNormalView = /*#__PURE__*/ property( 'vec3', 'transformedNormalView' );
export const transformedNormalWorld = /*#__PURE__*/ transformedNormalView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedNormalWorld' );
export const transformedClearcoatNormalView = /*#__PURE__*/ property( 'vec3', 'transformedClearcoatNormalView' );
