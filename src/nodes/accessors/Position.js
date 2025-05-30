import { attribute } from '../core/AttributeNode.js';
import { Fn } from '../tsl/TSLCore.js';
import { modelWorldMatrix } from './ModelNode.js';

/**
 * TSL object that represents the position attribute of the current rendered object.
 *
 * @tsl
 * @type {AttributeNode<vec3>}
 */
export const positionGeometry = /*@__PURE__*/ attribute( 'position', 'vec3' );

/**
 * TSL object that represents the vertex position in local space of the current rendered object.
 *
 * @tsl
 * @type {AttributeNode<vec3>}
 */
export const positionLocal = /*@__PURE__*/ positionGeometry.toVarying( 'positionLocal' );

/**
 * TSL object that represents the previous vertex position in local space of the current rendered object.
 * Used in context of {@link VelocityNode} for rendering motion vectors.
 *
 * @tsl
 * @type {AttributeNode<vec3>}
 */
export const positionPrevious = /*@__PURE__*/ positionGeometry.toVarying( 'positionPrevious' );

/**
 * TSL object that represents the vertex position in world space of the current rendered object.
 *
 * @tsl
 * @type {VaryingNode<vec3>}
 */
export const positionWorld = /*@__PURE__*/ ( Fn( ( builder ) => {

	return modelWorldMatrix.mul( positionLocal ).xyz.toVarying( builder.getNamespace( 'v_positionWorld' ) );

}, 'vec3' ).once( 'POSITION' ) )();

/**
 * TSL object that represents the position world direction of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const positionWorldDirection = /*@__PURE__*/ ( Fn( ( builder ) => {

	const vertexPWD = positionLocal.transformDirection( modelWorldMatrix ).toVarying( builder.getNamespace( 'v_positionWorldDirection' ) );

	return vertexPWD.normalize().toVar( 'positionWorldDirection' );

}, 'vec3' ).once( 'POSITION' ) )();

/**
 * TSL object that represents the vertex position in view space of the current rendered object.
 *
 * @tsl
 * @type {VaryingNode<vec3>}
 */
export const positionView = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.setupPositionView().toVarying( builder.getNamespace( 'v_positionView' ) );

}, 'vec3' ).once( 'POSITION' ) )();

/**
 * TSL object that represents the position view direction of the current rendered object.
 *
 * @tsl
 * @type {VaryingNode<vec3>}
 */
export const positionViewDirection = /*@__PURE__*/ positionView.negate().toVarying( 'v_positionViewDirection' ).normalize().toVar( 'positionViewDirection' );
