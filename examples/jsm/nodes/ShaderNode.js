// core nodes
import PropertyNode from './core/PropertyNode.js';
import VarNode from './core/VarNode.js';
import AttributeNode from './core/AttributeNode.js';
import ConstNode from './core/ConstNode.js';
import UniformNode from './core/UniformNode.js';

// accessor nodes
import BufferNode from './accessors/BufferNode.js';
import PositionNode from './accessors/PositionNode.js';
import NormalNode from './accessors/NormalNode.js';
import CameraNode from './accessors/CameraNode.js';
import ModelNode from './accessors/ModelNode.js';
import TextureNode from './accessors/TextureNode.js';
import UVNode from './accessors/UVNode.js';

// math nodes
import OperatorNode from './math/OperatorNode.js';
import CondNode from './math/CondNode.js';
import MathNode from './math/MathNode.js';

// util nodes
import ArrayElementNode from './utils/ArrayElementNode.js';
import ConvertNode from './utils/ConvertNode.js';
import JoinNode from './utils/JoinNode.js';
import SplitNode from './utils/SplitNode.js';

// utils
import { getValueFromType } from './core/NodeUtils.js';

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

				return new ShaderNodeObject( new ArrayElementNode( node, uint( Number( prop ) ) ) );

			}

		}

		return node[ prop ];

	}

};

const nodeObjects = new WeakMap();

const ShaderNodeObject = function ( obj ) {

	const type = typeof obj;

	if ( ( type === 'number' ) || ( type === 'boolean' ) ) {

		return new ShaderNodeObject( getAutoTypedConstNode( obj ) );

	} else if ( type === 'object' ) {

		if ( obj.isNode === true ) {

			let nodeObject = nodeObjects.get( obj );

			if ( nodeObject === undefined ) {

				nodeObject = new Proxy( obj, NodeHandler );
				nodeObjects.set( obj, nodeObject );
				nodeObjects.set( nodeObject, nodeObject );

			}

			return nodeObject;

		}

	}

	return obj;

};

const ShaderNodeObjects = function ( objects ) {

	for ( const name in objects ) {

		objects[ name ] = new ShaderNodeObject( objects[ name ] );

	}

	return objects;

};

const getShaderNodeArray = ( array ) => {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = new ShaderNodeObject( array[ i ] );

	}

	return array;

};

const ShaderNodeProxy = function ( NodeClass, scope = null, factor = null ) {

	if ( scope === null ) {

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( ...getShaderNodeArray( params ) ) );

		};

	} else if ( factor === null ) {

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( scope, ...getShaderNodeArray( params ) ) );

		};

	} else {

		factor = new ShaderNodeObject( factor );

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( scope, ...getShaderNodeArray( params ), factor ) );

		};

	}

};

const ShaderNodeScript = function ( jsFunc ) {

	return ( inputs, builder ) => {

		new ShaderNodeObjects( inputs );

		return new ShaderNodeObject( jsFunc( inputs, builder ) );

	};

};

const bools = [ false, true ];
const uints = [ 0, 1, 2, 3 ];
const ints = [ -1, -2 ];
const floats = [ 0.5, 1.5, 1 / 3, 1e-6, 1e6, Math.PI, Math.PI * 2, 1 / Math.PI, 2 / Math.PI, 1 / ( Math.PI * 2), Math.PI / 2 ];

const boolsCacheMap = new Map();
for ( let bool of bools ) boolsCacheMap.set( bool, new ConstNode( bool ) );

const uintsCacheMap = new Map();
for ( let uint of uints ) uintsCacheMap.set( uint, new ConstNode( uint, 'uint' ) );

const intsCacheMap = new Map( [ ...uintsCacheMap ].map( el => new ConstNode( el.value, 'int' ) ) );
for ( let int of ints ) intsCacheMap.set( int, new ConstNode( int, 'int' ) );

const floatsCacheMap = new Map( [ ...intsCacheMap ].map( el => new ConstNode( el.value ) ) );
for ( let float of floats ) floatsCacheMap.set( float, new ConstNode( float ) );
for ( let float of floats ) floatsCacheMap.set( - float, new ConstNode( - float ) );

const constNodesCacheMap = new Map( [ ...boolsCacheMap, ...floatsCacheMap ] );

const getAutoTypedConstNode = ( value ) => {

	if ( constNodesCacheMap.has( value ) ) {

		return constNodesCacheMap.get( value );

	} else if ( value.isNode === true ) {

		return value;

	} else {

		return new ConstNode( value );

	}

};

const ConvertType = function ( type, cacheMap = null ) {

	return ( ...params ) => {

		if ( params.length === 0 ) {

			return nodeObject( new ConstNode( getValueFromType( type ), type ) );

		} else {

			if ( type === 'color' && params[ 0 ].isNode !== true ) {

				params = [ getValueFromType( type, ...params ) ];

			}

			if ( params.length === 1 && cacheMap !== null && cacheMap.has( params[ 0 ] ) ) {

				return cacheMap.get( params[ 0 ] );

			}

			const nodes = params.map( getAutoTypedConstNode );

			return nodeObject( new ConvertNode( nodes.length === 1 ? nodes[ 0 ] : new JoinNode( nodes ), type ) );

		}

	};

};

//
// Node Material Shader Syntax
//

export const ShaderNode = new Proxy( ShaderNodeScript, NodeHandler );

export const nodeObject = ( val ) => {

	return new ShaderNodeObject( val );

};

export const uniform = ( value ) => {

	// TODO: get ConstNode from .traverse() in the future
	value = value.isNode === true ? value.node?.value || value.value : value;

	return nodeObject( new UniformNode( value, value.nodeType ) );

};

export const label = ( node, name ) => {

	node = nodeObject( node );

	if ( node.isVarNode === true ) {

		node.name = name;

		return node;

	}

	return nodeObject( new VarNode( node, name ) );

};

export const temp = ( node ) => nodeObject( new VarNode( nodeObject( node ) ) );

export const color = new ConvertType( 'color' );

export const float = new ConvertType( 'float', floatsCacheMap );
export const int = new ConvertType( 'int', intsCacheMap );
export const uint = new ConvertType( 'uint', uintsCacheMap );
export const bool = new ConvertType( 'bool', boolsCacheMap );

export const vec2 = new ConvertType( 'vec2' );
export const ivec2 = new ConvertType( 'ivec2' );
export const uvec2 = new ConvertType( 'uvec2' );
export const bvec2 = new ConvertType( 'bvec2' );

export const vec3 = new ConvertType( 'vec3' );
export const ivec3 = new ConvertType( 'ivec3' );
export const uvec3 = new ConvertType( 'uvec3' );
export const bvec3 = new ConvertType( 'bvec3' );

export const vec4 = new ConvertType( 'vec4' );
export const ivec4 = new ConvertType( 'ivec4' );
export const uvec4 = new ConvertType( 'uvec4' );
export const bvec4 = new ConvertType( 'bvec4' );

export const mat3 = new ConvertType( 'mat3' );
export const imat3 = new ConvertType( 'imat3' );
export const umat3 = new ConvertType( 'umat3' );
export const bmat3 = new ConvertType( 'bmat3' );

export const mat4 = new ConvertType( 'mat4' );
export const imat4 = new ConvertType( 'imat4' );
export const umat4 = new ConvertType( 'umat4' );
export const bmat4 = new ConvertType( 'bmat4' );

export const join = ( ...params ) => nodeObject( new JoinNode( getShaderNodeArray( params ) ) );

export const uv = ( ...params ) => nodeObject( new UVNode( ...params ) );
export const attribute = ( ...params ) => nodeObject( new AttributeNode( ...params ) );
export const buffer = ( ...params ) => nodeObject( new BufferNode( ...params ) );
export const texture = ( ...params ) => nodeObject( new TextureNode( ...params ) );
export const sampler = ( texture ) => nodeObject( new ConvertNode( texture.isNode === true ? texture : new TextureNode( texture ), 'sampler' ) );

export const cond = ( ...params ) => nodeObject( new CondNode( ...getShaderNodeArray( params ) ) );

export const addTo = ( varNode, ...params ) => {

	varNode.node = add( varNode.node, ...getShaderNodeArray( params ) );

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

export const viewMatrix = new ShaderNodeObject( new ModelNode( ModelNode.VIEW_MATRIX ) );

export const cameraPosition = new ShaderNodeObject( new CameraNode( CameraNode.POSITION ) );

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

export const EPSILON = float( 1e-6 );
export const INFINITY = float( 1e6 );
