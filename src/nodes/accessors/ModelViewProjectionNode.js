import { Fn } from '../tsl/TSLCore.js';

/**
 * TSL object that represents the position in clip space after the model-view-projection transform of the current rendered object.
 *
 * @tsl
 * @type {VaryingNode<vec4>}
 */
export const modelViewProjection = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.setupModelViewProjection();

}, 'vec4' ).once() )().toVarying( 'v_modelViewProjection' );
