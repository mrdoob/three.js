import { cameraViewMatrix } from './Camera.js';
import { transformedNormalView } from './Normal.js';
import { positionViewDirection } from './Position.js';
import { materialRefractionRatio } from './MaterialProperties.js';

/** @module ReflectVector **/

/**
 * The reflect vector in view space.
 *
 * @type {Node<vec3>}
 */
export const reflectView = /*@__PURE__*/ positionViewDirection.negate().reflect( transformedNormalView );

/**
 * The refract vector in view space.
 *
 * @type {Node<vec3>}
 */
export const refractView = /*@__PURE__*/ positionViewDirection.negate().refract( transformedNormalView, materialRefractionRatio );

/**
 * Used for sampling cube maps when using cube reflection mapping.
 *
 * @type {Node<vec3>}
 */
export const reflectVector = /*@__PURE__*/ reflectView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );

/**
 * Used for sampling cube maps when using cube refraction mapping.
 *
 * @type {Node<vec3>}
 */
export const refractVector = /*@__PURE__*/ refractView.transformDirection( cameraViewMatrix ).toVar( 'reflectVector' );
