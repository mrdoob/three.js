// inputs
import ColorNode from './inputs/ColorNode.js';
import FloatNode from './inputs/FloatNode.js';
import Vector2Node from './inputs/Vector2Node.js';
import Vector3Node from './inputs/Vector3Node.js';
import Vector4Node from './inputs/Vector4Node.js';

// math
import OperatorNode from './math/OperatorNode.js';
import CondNode from './math/CondNode.js';
import MathNode from './math/MathNode.js';

// utils
import JoinNode from './utils/JoinNode.js';
import SplitNode from './utils/SplitNode.js';

// core
import { Vector2, Vector3, Vector4, Color } from 'three';

const NodeHandler = {

	construct( NodeClosure, params ) {

		return NodeClosure( ShaderNodeObjects( params[ 0 ] ) );

	},

	get: function ( node, prop ) {

		// Split Properties Pass

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			const splitProps = prop.match( /^[xyzwst]{1,4}$/ );

			if ( splitProps !== null ) {

				return ShaderNodeObject( new SplitNode( node, splitProps[ 0 ] ) );

			}

		}

		return node[ prop ];

	}

};

const ShaderNodeObject = ( obj ) => {

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

const ShaderNodeObjects = ( objects ) => {

	for ( const name in objects ) {

		objects[ name ] = ShaderNodeObject( objects[ name ] );

	}

	return objects;

};

const ShaderNodeArray = ( array ) => {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = ShaderNodeObject( array[ i ] );

	}

	return array;

};

const ShaderNodeProxy = ( NodeClass, scope ) => {

	return ( ...params ) => {

		return ShaderNodeObject( new NodeClass( scope, ...ShaderNodeArray( params ) ) );

	};

};


const ShaderNodeScript = function ( jsFunc ) {

	return ( inputs ) => {

		ShaderNodeObjects( inputs );

		return ShaderNodeObject( jsFunc( inputs ) );

	};

};

export const ShaderNode = new Proxy( ShaderNodeScript, NodeHandler );

//
// Node Material Shader Syntax
//

export const uniform = new ShaderNode( ( inputNode ) => {

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

export const cond = ( ...params ) => {

	return ShaderNodeObject( new CondNode( ...ShaderNodeArray( params ) ) );

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

export const add = ShaderNodeProxy( OperatorNode, '+' );
export const sub = ShaderNodeProxy( OperatorNode, '-' );
export const mul = ShaderNodeProxy( OperatorNode, '*' );
export const div = ShaderNodeProxy( OperatorNode, '/' );
export const equals = ShaderNodeProxy( OperatorNode, '==' );

export const floor = ShaderNodeProxy( MathNode, 'floor' );
export const mod = ShaderNodeProxy( MathNode, 'mod' );
export const cross = ShaderNodeProxy( MathNode, 'cross' );
export const max = ShaderNodeProxy( MathNode, 'max' );
export const min = ShaderNodeProxy( MathNode, 'min' );
export const dot = ShaderNodeProxy( MathNode, 'dot' );
export const normalize = ShaderNodeProxy( MathNode, 'normalize' );
export const inversesqrt = ShaderNodeProxy( MathNode, 'inversesqrt' );
export const sign = ShaderNodeProxy( MathNode, 'sign' );
export const dFdx = ShaderNodeProxy( MathNode, 'dFdx' );
export const dFdy = ShaderNodeProxy( MathNode, 'dFdy' );
