import { cameraViewMatrix } from './CameraNode.js';
import { transformedNormalView } from './NormalNode.js';
import { positionViewDirection } from './PositionNode.js';
import { materialRefractionRatio } from './MaterialNode.js';

export const reflectView = /*#__PURE__*/ positionViewDirection.negate().reflect( transformedNormalView );
export const refractView = /*#__PURE__*/ positionViewDirection.negate().refract( transformedNormalView, materialRefractionRatio );

export const reflectVector = /*#__PURE__*/ reflectView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
export const refractVector = /*#__PURE__*/ refractView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
