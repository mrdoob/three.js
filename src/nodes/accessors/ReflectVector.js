import { cameraViewMatrix } from './Camera.js';
import { transformedNormalView } from './Normal.js';
import { positionViewDirection } from './Position.js';
import { materialRefractionRatio } from './MaterialProperties.js';

export const reflectView = /*@__PURE__*/ positionViewDirection.negate().reflect( transformedNormalView );
export const refractView = /*@__PURE__*/ positionViewDirection.negate().refract( transformedNormalView, materialRefractionRatio );

export const reflectVector = /*@__PURE__*/ reflectView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
export const refractVector = /*@__PURE__*/ refractView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
