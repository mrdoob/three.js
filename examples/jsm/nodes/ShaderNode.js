// core
import PropertyNode from './core/PropertyNode.js';
import VarNode from './core/VarNode.js';

// inputs
import ColorNode from './inputs/ColorNode.js';
import FloatNode from './inputs/FloatNode.js';
import IntNode from './inputs/IntNode.js';
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
import ConvertNode from './utils/ConvertNode.js';
import JoinNode from './utils/JoinNode.js';
import SplitNode from './utils/SplitNode.js';

// core
import { Vector2, Vector3, Vector4, Color } from 'three';

const NodeHandler = {

	construct( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( new ShaderNodeObjects( inputs ), ...params );

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

				return new ShaderNodeObject( new SplitNode( node, prop ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return new ShaderNodeObject( new ArrayElementNode( node, new FloatNode( Number( prop ) ).setConst( true ) ) );

			}

		}

		return node[ prop ];

	}

};

const nodeObjects = new WeakMap();

const ShaderNodeObject = function( obj ) {

	const type = typeof obj;

	if ( type === 'number' ) {

		return new ShaderNodeObject( new FloatNode( obj ).setConst( true ) );

	} else if ( type === 'object' ) {

		if ( obj.isNode === true ) {

			let nodeObject = nodeObjects.get( obj );

			if ( nodeObject === undefined ) {

				nodeObject = new Proxy( obj, NodeHandler );
				nodeObjects.set( obj, nodeObject );

			}

			return nodeObject;

		}

	}

	return obj;

};

const ShaderNodeObjects = function( objects ) {

	for ( const name in objects ) {

		objects[ name ] = new ShaderNodeObject( objects[ name ] );

	}

	return objects;

};

const ShaderNodeArray = function( array ) {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = new ShaderNodeObject( array[ i ] );

	}

	return array;

};

const ShaderNodeProxy = function( NodeClass, scope = null, factor = null ) {

	if ( scope === null ) {

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( ...ShaderNodeArray( params ) ) );

		};

	} else if ( factor === null ) {

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( scope, ...ShaderNodeArray( params ) ) );

		};

	} else {

		factor = new ShaderNodeObject( factor );

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( scope, ...ShaderNodeArray( params ), factor ) );

		};

	}

};

const ShaderNodeScript = function ( jsFunc ) {

	return ( inputs, builder ) => {

		new ShaderNodeObjects( inputs );

		return new ShaderNodeObject( jsFunc( inputs, builder ) );

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

export const nodeObject = ( val ) => {

	return new ShaderNodeObject( val );

};

export const float = ( val ) => {

	if ( val?.isNode === true ) {

		return nodeObject( new ConvertNode( val, 'float' ) );

	}

	return nodeObject( new FloatNode( val ).setConst( true ) );

};

export const int = ( val ) => {

	if ( val?.isNode === true ) {

		return nodeObject( new ConvertNode( val, 'int' ) );

	}

	return nodeObject( new IntNode( val ).setConst( true ) );

};

export const color = ( ...params ) => {

	if ( params[ 0 ]?.isNode === true ) {

		return nodeObject( new ConvertNode( params[0], 'color' ) );

	}

	return nodeObject( new ColorNode( new Color( ...params ) ).setConst( true ) );

};

export const join = ( ...params ) => {

	return nodeObject( new JoinNode( ShaderNodeArray( params ) ) );

};

export const cond = ( ...params ) => {

	return nodeObject( new CondNode( ...ShaderNodeArray( params ) ) );

};

export const vec2 = ( ...params ) => {

	if ( params[ 0 ]?.isNode === true ) {

		return nodeObject( new ConvertNode( params[ 0 ], 'vec2' ) );

	} else {

		// Providing one scalar value: This value is used for all components

		if ( params.length === 1 ) {

			params[ 1 ] = params[ 0 ];

		}

		return nodeObject( new Vector2Node( new Vector2( ...params ) ).setConst( true ) );

	}

};

export const vec3 = ( ...params ) => {

	if ( params[ 0 ]?.isNode === true ) {

		return nodeObject( new ConvertNode( params[ 0 ], 'vec3' ) );

	} else {

		// Providing one scalar value: This value is used for all components

		if ( params.length === 1 ) {

			params[ 1 ] = params[ 2 ] = params[ 0 ];

		}

		return nodeObject( new Vector3Node( new Vector3( ...params ) ).setConst( true ) );

	}

};

export const vec4 = ( ...params ) => {

	if ( params[ 0 ]?.isNode === true ) {

		return nodeObject( new ConvertNode( params[ 0 ], 'vec4' ) );

	} else {

		// Providing one scalar value: This value is used for all components

		if ( params.length === 1 ) {

			params[ 1 ] = params[ 2 ] = params[ 3 ] = params[ 0 ];

		}

		return nodeObject( new Vector4Node( new Vector4( ...params ) ).setConst( true ) );

	}

};

export const addTo = ( varNode, ...params ) => {

	varNode.node = add( varNode.node, ...ShaderNodeArray( params ) );

	return nodeObject( varNode );

};

export const add = new ShaderNodeProxy( OperatorNode, '+' );
export const sub = new ShaderNodeProxy( OperatorNode, '-' );
export const mul = new ShaderNodeProxy( OperatorNode, '*' );
export const div = new ShaderNodeProxy( OperatorNode, '/' );
export const remainder = new ShaderNodeProxy( OperatorNode, '%' );
export const equal = new ShaderNodeProxy( OperatorNode, '==' );
export const assign = new ShaderNodeProxy( OperatorNode, '=' );
export const lessThan = new ShaderNodeProxy( OperatorNode, '<' );
export const greaterThan = new ShaderNodeProxy( OperatorNode, '>' );
export const lessThanEqual = new ShaderNodeProxy( OperatorNode, '<=' );
export const greaterThanEqual = new ShaderNodeProxy( OperatorNode, '>=' );
export const and = new ShaderNodeProxy( OperatorNode, '&&' );
export const or = new ShaderNodeProxy( OperatorNode, '||' );
export const xor = new ShaderNodeProxy( OperatorNode, '^^' );
export const bitAnd = new ShaderNodeProxy( OperatorNode, '&' );
export const bitOr = new ShaderNodeProxy( OperatorNode, '|' );
export const bitXor = new ShaderNodeProxy( OperatorNode, '^' );
export const shiftLeft = new ShaderNodeProxy( OperatorNode, '<<' );
export const shiftRight = new ShaderNodeProxy( OperatorNode, '>>' );

export const element = new ShaderNodeProxy( ArrayElementNode );

export const normalGeometry = new ShaderNodeObject( new NormalNode( NormalNode.GEOMETRY ) );
export const normalLocal = new ShaderNodeObject( new NormalNode( NormalNode.LOCAL ) );
export const normalWorld = new ShaderNodeObject( new NormalNode( NormalNode.WORLD ) );
export const normalView = new ShaderNodeObject( new NormalNode( NormalNode.VIEW ) );
export const transformedNormalView = new ShaderNodeObject( new VarNode( new NormalNode( NormalNode.VIEW ), 'TransformedNormalView', 'vec3' ) );

export const positionLocal = new ShaderNodeObject( new PositionNode( PositionNode.LOCAL ) );
export const positionWorld = new ShaderNodeObject( new PositionNode( PositionNode.WORLD ) );
export const positionView = new ShaderNodeObject( new PositionNode( PositionNode.VIEW ) );
export const positionViewDirection = new ShaderNodeObject( new PositionNode( PositionNode.VIEW_DIRECTION ) );

export const PI = float( 3.141592653589793 );
export const PI2 = float( 6.283185307179586 );
export const PI_HALF = float( 1.5707963267948966 );
export const RECIPROCAL_PI = float( 0.3183098861837907 );
export const RECIPROCAL_PI2 = float( 0.15915494309189535 );
export const EPSILON = float( 1e-6 );

export const diffuseColor = new ShaderNodeObject( new PropertyNode( 'DiffuseColor', 'vec4' ) );
export const roughness = new ShaderNodeObject( new PropertyNode( 'Roughness', 'float' ) );
export const metalness = new ShaderNodeObject( new PropertyNode( 'Metalness', 'float' ) );
export const alphaTest = new ShaderNodeObject( new PropertyNode( 'AlphaTest', 'float' ) );
export const specularColor = new ShaderNodeObject( new PropertyNode( 'SpecularColor', 'color' ) );

export const abs = new ShaderNodeProxy( MathNode, 'abs' );
export const acos = new ShaderNodeProxy( MathNode, 'acos' );
export const asin = new ShaderNodeProxy( MathNode, 'asin' );
export const atan = new ShaderNodeProxy( MathNode, 'atan' );
export const ceil = new ShaderNodeProxy( MathNode, 'ceil' );
export const clamp = new ShaderNodeProxy( MathNode, 'clamp' );
export const cos = new ShaderNodeProxy( MathNode, 'cos' );
export const cross = new ShaderNodeProxy( MathNode, 'cross' );
export const degrees = new ShaderNodeProxy( MathNode, 'degrees' );
export const dFdx = new ShaderNodeProxy( MathNode, 'dFdx' );
export const dFdy = new ShaderNodeProxy( MathNode, 'dFdy' );
export const distance = new ShaderNodeProxy( MathNode, 'distance' );
export const dot = new ShaderNodeProxy( MathNode, 'dot' );
export const exp = new ShaderNodeProxy( MathNode, 'exp' );
export const exp2 = new ShaderNodeProxy( MathNode, 'exp2' );
export const faceforward = new ShaderNodeProxy( MathNode, 'faceforward' );
export const floor = new ShaderNodeProxy( MathNode, 'floor' );
export const fract = new ShaderNodeProxy( MathNode, 'fract' );
export const invert = new ShaderNodeProxy( MathNode, 'invert' );
export const inversesqrt = new ShaderNodeProxy( MathNode, 'inversesqrt' );
export const length = new ShaderNodeProxy( MathNode, 'length' );
export const log = new ShaderNodeProxy( MathNode, 'log' );
export const log2 = new ShaderNodeProxy( MathNode, 'log2' );
export const max = new ShaderNodeProxy( MathNode, 'max' );
export const min = new ShaderNodeProxy( MathNode, 'min' );
export const mix = new ShaderNodeProxy( MathNode, 'mix' );
export const mod = new ShaderNodeProxy( MathNode, 'mod' );
export const negate = new ShaderNodeProxy( MathNode, 'negate' );
export const normalize = new ShaderNodeProxy( MathNode, 'normalize' );
export const pow = new ShaderNodeProxy( MathNode, 'pow' );
export const pow2 = new ShaderNodeProxy( MathNode, 'pow', 2 );
export const pow3 = new ShaderNodeProxy( MathNode, 'pow', 3 );
export const pow4 = new ShaderNodeProxy( MathNode, 'pow', 4 );
export const radians = new ShaderNodeProxy( MathNode, 'radians' );
export const reflect = new ShaderNodeProxy( MathNode, 'reflect' );
export const refract = new ShaderNodeProxy( MathNode, 'refract' );
export const round = new ShaderNodeProxy( MathNode, 'round' );
export const saturate = new ShaderNodeProxy( MathNode, 'saturate' );
export const sign = new ShaderNodeProxy( MathNode, 'sign' );
export const sin = new ShaderNodeProxy( MathNode, 'sin' );
export const smoothstep = new ShaderNodeProxy( MathNode, 'smoothstep' );
export const sqrt = new ShaderNodeProxy( MathNode, 'sqrt' );
export const step = new ShaderNodeProxy( MathNode, 'step' );
export const tan = new ShaderNodeProxy( MathNode, 'tan' );
export const transformDirection = new ShaderNodeProxy( MathNode, 'transformDirection' );
