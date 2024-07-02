import { attribute } from '../core/AttributeNode.js';
import { varying } from '../core/VaryingNode.js';
import { modelWorldMatrix, modelViewMatrix } from './ModelNode.js';

export const positionGeometry = /*#__PURE__*/ attribute( 'position', 'vec3' );
export const positionLocal = /*#__PURE__*/ positionGeometry.toVar( 'positionLocal' );
export const positionWorld = /*#__PURE__*/ varying( modelWorldMatrix.mul( positionLocal ).xyz, 'v_positionWorld' );
export const positionWorldDirection = /*#__PURE__*/ varying( positionLocal.transformDirection( modelWorldMatrix ), 'v_positionWorldDirection' ).normalize().toVar( 'positionWorldDirection' );
export const positionView = /*#__PURE__*/ varying( modelViewMatrix.mul( positionLocal ).xyz, 'v_positionView' );
export const positionViewDirection = /*#__PURE__*/ varying( positionView.negate(), 'v_positionViewDirection' ).normalize().toVar( 'positionViewDirection' );
