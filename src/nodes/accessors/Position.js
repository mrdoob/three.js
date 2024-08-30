import { attribute } from '../core/AttributeNode.js';
import { modelWorldMatrix, modelViewMatrix } from './ModelNode.js';

export const positionGeometry = /*@__PURE__*/ attribute( 'position', 'vec3' );
export const positionLocal = /*@__PURE__*/ positionGeometry.varying( 'positionLocal' );
export const positionPrevious = /*@__PURE__*/ positionGeometry.varying( 'positionPrevious' );
export const positionWorld = /*@__PURE__*/ modelWorldMatrix.mul( positionLocal ).xyz.varying( 'v_positionWorld' );
export const positionWorldDirection = /*@__PURE__*/ positionLocal.transformDirection( modelWorldMatrix ).varying( 'v_positionWorldDirection' ).normalize().toVar( 'positionWorldDirection' );
export const positionView = /*@__PURE__*/ modelViewMatrix.mul( positionLocal ).xyz.varying( 'v_positionView' );
export const positionViewDirection = /*@__PURE__*/ positionView.negate().varying( 'v_positionViewDirection' ).normalize().toVar( 'positionViewDirection' );
