import { uniform } from '../core/UniformNode.js';

/**
 * TSL object that represents the refraction ratio of the material used for rendering the current object.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const materialRefractionRatio = /*@__PURE__*/ uniform( 0 ).onReference( ( { material } ) => material ).onRenderUpdate( ( { material } ) => material.refractionRatio );
