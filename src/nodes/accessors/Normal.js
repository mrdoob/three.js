import { attribute } from '../core/AttributeNode.js';
import { cameraViewMatrix } from './Camera.js';
import { modelNormalMatrix, modelWorldMatrix } from './ModelNode.js';
import { mat3, vec3, Fn, varying } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { faceDirection } from '../display/FrontFacingNode.js';

/**
 * TSL object that represents the normal attribute of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalGeometry = /*@__PURE__*/ attribute( 'normal', 'vec3' );

/**
 * TSL object that represents the vertex normal in local space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalLocal = /*@__PURE__*/ ( Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'normal' ) === false ) {

		console.warn( 'THREE.TSL: Vertex attribute "normal" not found on geometry.' );

		return vec3( 0, 1, 0 );

	}

	return normalGeometry;

}, 'vec3' ).once() )().toVar( 'normalLocal' );

/**
 * TSL object that represents the flat vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalFlat = /*@__PURE__*/ positionView.dFdx().cross( positionView.dFdy() ).normalize().toVar( 'normalFlat' );

/**
 * TSL object that represents the vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.material.flatShading === true ) {

		node = normalFlat;

	} else {

		node = varying( transformNormalToView( normalLocal ), 'v_normalView' ).normalize();

	}

	return node;

}, 'vec3' ).once() )().toVar( 'normalView' );

/**
 * TSL object that represents the vertex normal in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalWorld = /*@__PURE__*/ varying( normalView.transformDirection( cameraViewMatrix ), 'v_normalWorld' ).normalize().toVar( 'normalWorld' );

/**
 * TSL object that represents the transformed vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const transformedNormalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	// Use getUV context to avoid side effects from nodes overwriting getUV in the context (e.g. EnvironmentNode)

	return builder.context.setupNormal().context( { getUV: null } );

}, 'vec3' ).once() )().mul( faceDirection ).toVar( 'transformedNormalView' );

/**
 * TSL object that represents the transformed vertex normal in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const transformedNormalWorld = /*@__PURE__*/ transformedNormalView.transformDirection( cameraViewMatrix ).toVar( 'transformedNormalWorld' );

/**
 * TSL object that represents the transformed clearcoat vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const transformedClearcoatNormalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	// Use getUV context to avoid side effects from nodes overwriting getUV in the context (e.g. EnvironmentNode)

	return builder.context.setupClearcoatNormal().context( { getUV: null } );

}, 'vec3' ).once() )().mul( faceDirection ).toVar( 'transformedClearcoatNormalView' );

/**
 * Transforms the normal with the given matrix.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} normal - The normal.
 * @param {Node<mat3>} [matrix=modelWorldMatrix] - The matrix.
 * @return {Node<vec3>} The transformed normal.
 */
export const transformNormal = /*@__PURE__*/ Fn( ( [ normal, matrix = modelWorldMatrix ] ) => {

	const m = mat3( matrix );

	const transformedNormal = normal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

	return m.mul( transformedNormal ).xyz;

} );

/**
 * Transforms the given normal from local to view space.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} normal - The normal.
 * @param {NodeBuilder} builder - The current node builder.
 * @return {Node<vec3>} The transformed normal.
 */
export const transformNormalToView = /*@__PURE__*/ Fn( ( [ normal ], builder ) => {

	const modelNormalViewMatrix = builder.renderer.nodes.modelNormalViewMatrix;

	if ( modelNormalViewMatrix !== null ) {

		return modelNormalViewMatrix.transformDirection( normal );

	}

	//

	const transformedNormal = modelNormalMatrix.mul( normal );

	return cameraViewMatrix.transformDirection( transformedNormal );

} );
