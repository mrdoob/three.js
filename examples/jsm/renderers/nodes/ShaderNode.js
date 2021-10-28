// core
import PropertyNode from './core/PropertyNode.js';
import VarNode from './core/VarNode.js';

// inputs
import ColorNode from './inputs/ColorNode.js';
import FloatNode from './inputs/FloatNode.js';
import Vector2Node from './inputs/Vector2Node.js';
import Vector3Node from './inputs/Vector3Node.js';
import Vector4Node from './inputs/Vector4Node.js';

// accessors
import PositionNode from './accessors/PositionNode.js';
import NormalNode from './accessors/NormalNode.js';

// math
import OperatorNode from './math/OperatorNode.js';
import CondNode from './math/CondNode.js';
import MathNode from './math/MathNode.js';

// utils
import ArrayElementNode from './utils/ArrayElementNode.js';
import JoinNode from './utils/JoinNode.js';
import SplitNode from './utils/SplitNode.js';

// core
import { Vector2, Vector3, Vector4, Color } from 'three';

const NodeHandler = {

	construct( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( ShaderNodeObjects( inputs ), ...params );

	},

	get: function ( node, prop ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true ) {

				// accessing properties ( swizzle )

				prop = prop
					.replace( /r|s/g, 'x' )
					.replace( /g|t/g, 'y' )
					.replace( /b|p/g, 'z' )
					.replace( /a|q/g, 'w' );

				return ShaderNodeObject( new SplitNode( node, prop ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return ShaderNodeObject( new ArrayElementNode( node, new FloatNode( Number( prop ) ).setConst( true ) ) );

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

const ShaderNodeProxy = ( NodeClass, scope = null, factor = null ) => {

	if ( scope === null ) {

		return ( ...params ) => {

			return ShaderNodeObject( new NodeClass( ...ShaderNodeArray( params ) ) );

		};

	} else if ( factor === null ) {

		return ( ...params ) => {

			return ShaderNodeObject( new NodeClass( scope, ...ShaderNodeArray( params ) ) );

		};

	} else {

		factor = ShaderNodeObject( factor );

		return ( ...params ) => {

			return ShaderNodeObject( new NodeClass( scope, ...ShaderNodeArray( params ), factor ) );

		};

	}

};

const ShaderNodeScript = function ( jsFunc ) {

	return ( inputs, builder ) => {

		ShaderNodeObjects( inputs );

		return ShaderNodeObject( jsFunc( inputs, builder ) );

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

	// Providing one scalar value: This value is used for all components

	if ( params.length === 1 ) {

		params[ 1 ] = params[ 0 ];

	}

	return ShaderNodeObject( new Vector2Node( new Vector2( ...params ) ).setConst( true ) );

};

export const vec3 = ( ...params ) => {

	// Providing one scalar value: This value is used for all components

	if ( params.length === 1 ) {

		params[ 1 ] = params[ 2 ] = params[ 0 ];

	}

	return ShaderNodeObject( new Vector3Node( new Vector3( ...params ) ).setConst( true ) );

};

export const vec4 = ( ...params ) => {

	// Providing one scalar value: This value is used for all components

	if ( params.length === 1 ) {

		params[ 1 ] = params[ 2 ] = params[ 3 ] = params[ 0 ];

	}

	return ShaderNodeObject( new Vector4Node( new Vector4( ...params ) ).setConst( true ) );

};

export const addTo = ( varNode, ...params ) => {

	varNode.node = add( varNode.node, ...ShaderNodeArray( params ) );

	return ShaderNodeObject( varNode );

};

export const add = ShaderNodeProxy( OperatorNode, '+' );
export const sub = ShaderNodeProxy( OperatorNode, '-' );
export const mul = ShaderNodeProxy( OperatorNode, '*' );
export const div = ShaderNodeProxy( OperatorNode, '/' );
export const equal = ShaderNodeProxy( OperatorNode, '==' );
export const assign = ShaderNodeProxy( OperatorNode, '=' );
export const greaterThan = ShaderNodeProxy( OperatorNode, '>' );
export const and = ShaderNodeProxy( OperatorNode, '&&' );

export const element = ShaderNodeProxy( ArrayElementNode );

export const normalLocal = new NormalNode( NormalNode.LOCAL );
export const normalWorld = new NormalNode( NormalNode.WORLD );
export const normalView = new NormalNode( NormalNode.VIEW );
export const transformedNormalView = new VarNode( new NormalNode( NormalNode.VIEW ), 'TransformedNormalView', 'vec3' );

export const positionLocal = new PositionNode( PositionNode.LOCAL );
export const positionWorld = new PositionNode( PositionNode.WORLD );
export const positionView = new PositionNode( PositionNode.VIEW );
export const positionViewDirection = new PositionNode( PositionNode.VIEW_DIRECTION );

export const PI = float( 3.141592653589793 );
export const RECIPROCAL_PI = float( 0.3183098861837907 );
export const EPSILON = float( 1e-6 );

export const diffuseColor = new PropertyNode( 'DiffuseColor', 'vec4' );
export const roughness = new PropertyNode( 'Roughness', 'float' );
export const metalness = new PropertyNode( 'Metalness', 'float' );
export const alphaTest = new PropertyNode( 'AlphaTest', 'float' );
export const specularColor = new PropertyNode( 'SpecularColor', 'color' );

export const negate = ShaderNodeProxy( MathNode, 'negate' );
export const floor = ShaderNodeProxy( MathNode, 'floor' );
export const mod = ShaderNodeProxy( MathNode, 'mod' );
export const cross = ShaderNodeProxy( MathNode, 'cross' );
export const max = ShaderNodeProxy( MathNode, 'max' );
export const min = ShaderNodeProxy( MathNode, 'min' );
export const dot = ShaderNodeProxy( MathNode, 'dot' );
export const normalize = ShaderNodeProxy( MathNode, 'normalize' );
export const sqrt = ShaderNodeProxy( MathNode, 'sqrt' );
export const inversesqrt = ShaderNodeProxy( MathNode, 'inversesqrt' );
export const sign = ShaderNodeProxy( MathNode, 'sign' );
export const dFdx = ShaderNodeProxy( MathNode, 'dFdx' );
export const dFdy = ShaderNodeProxy( MathNode, 'dFdy' );
export const pow = ShaderNodeProxy( MathNode, 'pow' );
export const pow2 = ShaderNodeProxy( MathNode, 'pow', 2 );
export const pow3 = ShaderNodeProxy( MathNode, 'pow', 3 );
export const pow4 = ShaderNodeProxy( MathNode, 'pow', 4 );
export const exp = ShaderNodeProxy( MathNode, 'exp' );
export const exp2 = ShaderNodeProxy( MathNode, 'exp2' );
export const saturate = ShaderNodeProxy( MathNode, 'saturate' );
export const transformDirection = ShaderNodeProxy( MathNode, 'transformDirection' );
