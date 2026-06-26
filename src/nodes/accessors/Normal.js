import { attribute } from '../core/AttributeNode.js';
import { cameraViewMatrix } from './Camera.js';
import { modelNormalMatrix, modelWorldMatrix } from './ModelNode.js';
import { mat3, vec3, Fn, addMethodChaining } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { negateOnBackSide } from '../display/FrontFacingNode.js';
import { warn } from '../../utils.js';

/**
 * TSL object that represents the normal attribute of the current rendered object in local space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalGeometry = /*@__PURE__*/ attribute( 'normal', 'vec3' );

/**
 * TSL object that represents the vertex normal of the current rendered object in local space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalLocal = /*@__PURE__*/ ( Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'normal' ) === false ) {

		warn( 'TSL: Vertex attribute "normal" not found on geometry.' );

		return vec3( 0, 1, 0 );

	}

	return normalGeometry;

}, 'vec3' ).once() )().toVar( 'normalLocal' );

/**
 * TSL object that represents the flat vertex normal of the current rendered object in view space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalFlat = /*@__PURE__*/ positionView.dFdx().cross( positionView.dFdy() ).normalize().toVar( 'normalFlat' );

/**
 * TSL object that represents the vertex normal of the current rendered object in view space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalViewGeometry = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.isFlatShading() ) {

		node = normalFlat;

	} else {

		node = transformNormalToView( normalLocal ).toVarying( 'v_normalViewGeometry' ).normalize();

	}

	return node;

}, 'vec3' ).once() )().toVar( 'normalViewGeometry' );

/**
 * TSL object that represents the vertex normal of the current rendered object in world space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalWorldGeometry = /*@__PURE__*/ ( Fn( ( builder ) => {

	let normal = normalViewGeometry.transformNormalByInverseViewMatrix( cameraViewMatrix );

	if ( builder.isFlatShading() !== true ) {

		normal = normal.toVarying( 'v_normalWorldGeometry' );

	}

	return normal.normalize().toVar( 'normalWorldGeometry' );

}, 'vec3' ).once() )();

/**
 * TSL object that represents the vertex normal of the current rendered object in view space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.subBuildFn === 'NORMAL' || builder.subBuildFn === 'VERTEX' ) {

		node = normalViewGeometry;

		if ( builder.isFlatShading() !== true ) {

			node = negateOnBackSide( node );

		}

	} else {

		// Use custom context to avoid side effects from nodes overwriting getUV, getTextureLevel in the context (e.g. EnvironmentNode)

		node = builder.context.setupNormal().context( { getUV: null, getTextureLevel: null } );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'normalView' );

/**
 * TSL object that represents the vertex normal of the current rendered object in world space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const normalWorld = /*@__PURE__*/ normalView.transformNormalByInverseViewMatrix( cameraViewMatrix ).toVar( 'normalWorld' );

/**
 * TSL object that represents the clearcoat vertex normal of the current rendered object in view space.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const clearcoatNormalView = /*@__PURE__*/ ( Fn( ( { subBuildFn, context } ) => {

	let node;

	if ( subBuildFn === 'NORMAL' || subBuildFn === 'VERTEX' ) {

		node = normalView;

	} else {

		// Use custom context to avoid side effects from nodes overwriting getUV, getTextureLevel in the context (e.g. EnvironmentNode)

		node = context.setupClearcoatNormal().context( { getUV: null, getTextureLevel: null } );

	}

	return node;

}, 'vec3' ).once( [ 'NORMAL', 'VERTEX' ] ) )().toVar( 'clearcoatNormalView' );

/**
 * Transforms the normal by the normal matrix of the given matrix and then normalizes the result.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} normal - The normal.
 * @param {Node<mat3|mat4>} [matrix=modelWorldMatrix] - The matrix.
 * @return {Node<vec3>} The transformed normal.
 */
export const transformNormal = /*@__PURE__*/ Fn( ( [ normal, matrix = modelWorldMatrix ] ) => {

	const normalMatrix = mat3( matrix ).inverse().transpose();

	return normalMatrix.mul( normal ).normalize();

} );

addMethodChaining( 'transformNormal', transformNormal );

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

	const modelNormalViewMatrix = builder.context.modelNormalViewMatrix;

	if ( modelNormalViewMatrix ) {

		return normal.transformNormalByViewMatrix( modelNormalViewMatrix );

	}

	//

	const transformedNormal = modelNormalMatrix.mul( normal );

	return transformedNormal.transformNormalByViewMatrix( cameraViewMatrix );

} );

// Deprecated

/**
 * TSL object that represents the transformed vertex normal of the current rendered object in view space.
 *
 * @tsl
 * @type {Node<vec3>}
 * @deprecated since r178. Use `normalView` instead.
 */
export const transformedNormalView = ( Fn( () => { // @deprecated, r177

	warn( 'TSL: "transformedNormalView" is deprecated. Use "normalView" instead.' );
	return normalView;

} ).once( [ 'NORMAL', 'VERTEX' ] ) )();

/**
 * TSL object that represents the transformed vertex normal of the current rendered object in world space.
 *
 * @tsl
 * @type {Node<vec3>}
 * @deprecated since r178. Use `normalWorld` instead.
 */
export const transformedNormalWorld = ( Fn( () => { // @deprecated, r177

	warn( 'TSL: "transformedNormalWorld" is deprecated. Use "normalWorld" instead.' );
	return normalWorld;

} ).once( [ 'NORMAL', 'VERTEX' ] ) )();

/**
 * TSL object that represents the transformed clearcoat vertex normal of the current rendered object in view space.
 *
 * @tsl
 * @type {Node<vec3>}
 * @deprecated since r178. Use `clearcoatNormalView` instead.
 */
export const transformedClearcoatNormalView = ( Fn( () => { // @deprecated, r177

	warn( 'TSL: "transformedClearcoatNormalView" is deprecated. Use "clearcoatNormalView" instead.' );
	return clearcoatNormalView;

} ).once( [ 'NORMAL', 'VERTEX' ] ) )();
