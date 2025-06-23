import { attribute } from '../core/AttributeNode.js';
import { cameraViewMatrix } from './Camera.js';
import { modelNormalMatrix, modelWorldMatrix } from './ModelNode.js';
import { mat3, vec3, Fn } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { directionToFaceDirection } from '../display/FrontFacingNode.js';

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
export const normalViewGeometry = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.material.flatShading === true ) {

		node = normalFlat;

	} else {

		node = transformNormalToView( normalLocal ).toVarying( 'v_normalViewGeometry' ).normalize();

	}

	return node;

}, 'vec3' ).once() )().toVar( 'normalViewGeometry' );

/**
 * TSL object that represents the vertex normal in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalWorldGeometry = /*@__PURE__*/ ( Fn( ( builder ) => {

	let normal = normalViewGeometry.transformDirection( cameraViewMatrix );

	if ( builder.material.flatShading !== true ) {

		normal = normal.toVarying( 'v_normalWorldGeometry' );

	}

	return normal.normalize().toVar( 'normalWorldGeometry' );

}, 'vec3' ).once() )();

/**
 * TSL object that represents the transformed vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalView = /*@__PURE__*/ ( Fn( ( { subBuildFn, material, context } ) => {

	let node;

	if ( subBuildFn === 'NORMAL' || subBuildFn === 'VERTEX' ) {

		node = normalViewGeometry;

		if ( material.flatShading !== true ) {

			node = directionToFaceDirection( node );

		}

	} else {

		// Use getUV context to avoid side effects from nodes overwriting getUV in the context (e.g. EnvironmentNode)

		node = context.setupNormal().context( { getUV: null } );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'normalView' );

/**
 * TSL object that represents the transformed vertex normal in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalWorld = /*@__PURE__*/ normalView.transformDirection( cameraViewMatrix ).toVar( 'normalWorld' );

/**
 * TSL object that represents the transformed clearcoat vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const clearcoatNormalView = /*@__PURE__*/ ( Fn( ( { subBuildFn, context } ) => {

	let node;

	if ( subBuildFn === 'NORMAL' || subBuildFn === 'VERTEX' ) {

		node = normalView;

	} else {

		// Use getUV context to avoid side effects from nodes overwriting getUV in the context (e.g. EnvironmentNode)

		node = context.setupClearcoatNormal().context( { getUV: null } );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'clearcoatNormalView' );

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

	const modelNormalViewMatrix = builder.renderer.overrideNodes.modelNormalViewMatrix;

	if ( modelNormalViewMatrix !== null ) {

		return modelNormalViewMatrix.transformDirection( normal );

	}

	//

	const transformedNormal = modelNormalMatrix.mul( normal );

	return cameraViewMatrix.transformDirection( transformedNormal );

} );

// Deprecated

/**
 * TSL object that represents the transformed vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 * @deprecated since r178. Use `normalView` instead.
 */
export const transformedNormalView = ( Fn( () => { // @deprecated, r177

	console.warn( 'THREE.TSL: "transformedNormalView" is deprecated. Use "normalView" instead.' );
	return normalView;

} ).once( [ 'NORMAL', 'VERTEX' ] ) )();

/**
 * TSL object that represents the transformed vertex normal in world space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 * @deprecated since r178. Use `normalWorld` instead.
 */
export const transformedNormalWorld = ( Fn( () => { // @deprecated, r177

	console.warn( 'THREE.TSL: "transformedNormalWorld" is deprecated. Use "normalWorld" instead.' );
	return normalWorld;

} ).once( [ 'NORMAL', 'VERTEX' ] ) )();

/**
 * TSL object that represents the transformed clearcoat vertex normal in view space of the current rendered object.
 *
 * @tsl
 * @type {Node<vec3>}
 * @deprecated since r178. Use `clearcoatNormalView` instead.
 */
export const transformedClearcoatNormalView = ( Fn( () => { // @deprecated, r177

	console.warn( 'THREE.TSL: "transformedClearcoatNormalView" is deprecated. Use "clearcoatNormalView" instead.' );
	return clearcoatNormalView;

} ).once( [ 'NORMAL', 'VERTEX' ] ) )();
