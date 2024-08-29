import { attribute } from '../core/AttributeNode.js';
import { cameraViewMatrix } from './Camera.js';
import { modelNormalMatrix } from './ModelNode.js';
import { vec3 } from '../tsl/TSLBase.js';
import { positionView } from './Position.js';
import { Fn, varying } from '../tsl/TSLBase.js';
import { faceDirection } from '../display/FrontFacingNode.js';

export const normalGeometry = /*@__PURE__*/ attribute( 'normal', 'vec3' );

export const normalLocal = /*@__PURE__*/ ( Fn( ( builder ) => {

	if ( builder.geometry.hasAttribute( 'normal' ) === false ) {

		console.warn( 'TSL.NormalNode: Vertex attribute "normal" not found on geometry.' );

		return vec3( 0, 1, 0 );

	}

	return normalGeometry;

}, 'vec3' ).once() )().toVar( 'normalLocal' );

export const normalFlat = /*@__PURE__*/ positionView.dFdx().cross( positionView.dFdy() ).normalize().toVar( 'normalFlat' );

let normalViewVarying = null;

export const normalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	let node;

	if ( builder.material.flatShading === true ) {

		node = normalFlat;

	} else {

		node = normalViewVarying || ( normalViewVarying = varying( modelNormalMatrix.mul( normalLocal ), 'v_normalView' ).normalize() );

	}

	return node;

}, 'vec3' ).once() )().toVar( 'normalView' );

export const normalWorld = /*@__PURE__*/ varying( normalView.transformDirection( cameraViewMatrix ), 'v_normalWorld' ).normalize().toVar( 'normalWorld' );

export const transformedNormalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.setupNormal();

}, 'vec3' ).once() )().mul( faceDirection ).toVar( 'transformedNormalView' );


export const transformedNormalWorld = /*@__PURE__*/ transformedNormalView.transformDirection( cameraViewMatrix ).normalize().toVar( 'transformedNormalWorld' );

export const transformedClearcoatNormalView = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.setupClearcoatNormal();

}, 'vec3' ).once() )().mul( faceDirection ).toVar( 'transformedClearcoatNormalView' );
