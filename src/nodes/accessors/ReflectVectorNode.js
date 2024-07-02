import { cameraViewMatrix } from './CameraNode.js';
import { transformedNormalView } from './NormalNode.js';
import { positionViewDirection } from './PositionNode.js';

export const reflectView = /*#__PURE__*/ positionViewDirection.negate().reflect( transformedNormalView );
export const reflectVector = /*#__PURE__*/ reflectView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
