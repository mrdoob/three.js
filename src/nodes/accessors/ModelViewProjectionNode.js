import { cameraProjectionMatrix } from './Camera.js';
import { positionView } from './Position.js';

/** @module ModelViewProjectionNode **/

/**
 * TSL object that represents the position in clip space after the model-view-projection transform of the current rendered object.
 *
 * @type {VaryingNode<vec3>}
 */
export const modelViewProjection = /*@__PURE__*/ cameraProjectionMatrix.mul( positionView ).varying( 'v_modelViewProjection' );
