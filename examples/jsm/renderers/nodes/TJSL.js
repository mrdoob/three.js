// inputs
import ColorNode from './inputs/ColorNode.js';
import FloatNode from './inputs/FloatNode.js';
import Vector2Node from './inputs/Vector2Node.js';
import Vector3Node from './inputs/Vector3Node.js';
import Vector4Node from './inputs/Vector4Node.js';

// math
import MathNode from './math/MathNode.js';
import OperatorNode from './math/OperatorNode.js';

// utils
import JoinNode from './utils/JoinNode.js';
import SplitNode from './utils/SplitNode.js';

// core
import { Vector2, Vector3, Vector4, Color } from 'three';

const NodeHandler = {

	get: function ( node, prop ) {

		// Split Properties Pass

		if ( typeof prop === 'string' ) {

			const splitProps = prop.match( /^[xyzw]{1,4}$/ );

			if ( splitProps !== null ) {

				return tjslObject( new SplitNode( node, splitProps[ 0 ] ) );

			}

			return node[ prop ];

		}

	}

};

export const tjslObject = ( obj ) => {

	const type = typeof obj;

	if ( type === 'number' ) {

		return tjslObject( new FloatNode( obj ).setConst( true ) );

	} else if ( type === 'object' ) {

		if ( obj.isNode === true ) {

			const node = obj;

			if ( node.isProxyNode !== true ) {

				node.isProxyNode = true;

				return new Proxy( node, NodeHandler );

			}

		}

	}

	return obj;

};

export const tjslArray = ( array ) => {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = tjslObject( array[ i ] );

	}

	return array;

};

export const tjslScript = ( jsFunc ) => {

	return ( ...params ) => {

		tjslArray( params );

		return jsFunc( ...params );

	};

};

export const tjsl = ( obj ) => {

	return tjslScript( obj );

};

export const uniform = tjslScript( ( inputNode ) => {

	inputNode.setConst( false );

	return inputNode;

} );

export const float = ( val ) => {

	return tjslObject( new FloatNode( val ).setConst( true ) );

};

export const color = ( ...params ) => {

	return tjslObject( new ColorNode( new Color( ...params ) ).setConst( true ) );

};

export const join = ( ...params ) => {

	return tjslObject( new JoinNode( tjslArray( params ) ) );

};

export const vec2 = ( ...params ) => {

	return tjslObject( new Vector2Node( new Vector2( ...params ) ).setConst( true ) );

};

export const vec3 = ( ...params ) => {

	return tjslObject( new Vector3Node( new Vector3( ...params ) ).setConst( true ) );

};

export const vec4 = ( ...params ) => {

	return tjslObject( new Vector4Node( new Vector4( ...params ) ).setConst( true ) );

};

export const add = ( ...params ) => {

	return tjslObject( new OperatorNode( '+', ...tjslArray( params ) ) );

};

export const sub = ( ...params ) => {

	return tjslObject( new OperatorNode( '-', ...tjslArray( params ) ) );

};

export const mul = ( ...params ) => {

	return tjslObject( new OperatorNode( '*', ...tjslArray( params ) ) );

};

export const div = ( ...params ) => {

	return tjslObject( new OperatorNode( '/', ...tjslArray( params ) ) );

};

export const floor = ( ...params ) => {

	return tjslObject( new MathNode( 'floor', ...tjslArray( params ) ) );

};

export const mod = ( ...params ) => {

	return tjslObject( new MathNode( 'mod', ...tjslArray( params ) ) );

};

export const sign = ( ...params ) => {

	return tjslObject( new MathNode( 'sign', ...tjslArray( params ) ) );

};
