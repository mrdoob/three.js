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

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			const splitProps = prop.match( /^[xyzw]{1,4}$/ );

			if ( splitProps !== null ) {

				return ShaderNodeObject( new SplitNode( node, splitProps[ 0 ] ) );

			}

		}

		return node[ prop ];

	}

};

export const ShaderNodeObject = ( obj ) => {

	const type = typeof obj;

	if ( type === 'number' ) {

		return ShaderNodeObject( new FloatNode( obj ).setConst( true ) );

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

export const ShaderNodeArray = ( array ) => {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = ShaderNodeObject( array[ i ] );

	}

	return array;

};

export const ShaderNodeScript = ( jsFunc ) => {

	return ( ...params ) => {

		ShaderNodeArray( params );

		return ShaderNodeObject( jsFunc( ...params ) );

	};

};

export const ShaderNode = ( obj ) => {

	return ShaderNodeScript( obj );

};

//
// Node Material Shader Syntax
//

export const uniform = ShaderNodeScript( ( inputNode ) => {

	inputNode.setConst( false );

	return inputNode;

} );

export const float = ( val ) => {

	return ShaderNodeObject( new FloatNode( val ).setConst( true ) );

};

export const color = ( ...params ) => {

	return ShaderNodeObject( new ColorNode( new Color( ...params ) ).setConst( true ) );

};

export const join = ( ...params ) => {

	return ShaderNodeObject( new JoinNode( ShaderNodeArray( params ) ) );

};

export const vec2 = ( ...params ) => {

	return ShaderNodeObject( new Vector2Node( new Vector2( ...params ) ).setConst( true ) );

};

export const vec3 = ( ...params ) => {

	return ShaderNodeObject( new Vector3Node( new Vector3( ...params ) ).setConst( true ) );

};

export const vec4 = ( ...params ) => {

	return ShaderNodeObject( new Vector4Node( new Vector4( ...params ) ).setConst( true ) );

};

export const add = ( ...params ) => {

	return ShaderNodeObject( new OperatorNode( '+', ...ShaderNodeArray( params ) ) );

};

export const sub = ( ...params ) => {

	return new OperatorNode( '-', ...ShaderNodeArray( params ) );

};

export const mul = ( ...params ) => {

	return ShaderNodeObject( new OperatorNode( '*', ...ShaderNodeArray( params ) ) );

};

export const div = ( ...params ) => {

	return ShaderNodeObject( new OperatorNode( '/', ...ShaderNodeArray( params ) ) );

};

export const floor = ( ...params ) => {

	return ShaderNodeObject( new MathNode( 'floor', ...ShaderNodeArray( params ) ) );

};

export const mod = ( ...params ) => {

	return ShaderNodeObject( new MathNode( 'mod', ...ShaderNodeArray( params ) ) );

};

export const sign = ( ...params ) => {

	return ShaderNodeObject( new MathNode( 'sign', ...ShaderNodeArray( params ) ) );

};
