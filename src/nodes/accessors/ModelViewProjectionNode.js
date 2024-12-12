import { cameraProjectionMatrix } from './Camera.js';
import { positionView } from './Position.js';

export const modelViewProjection = /*@__PURE__*/ cameraProjectionMatrix.mul( positionView ).varying( 'v_modelViewProjection' );
