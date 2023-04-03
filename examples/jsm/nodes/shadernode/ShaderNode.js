import Node, { addNodeClass } from '../core/Node.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import ConstNode from '../core/ConstNode.js';
import { getValueFromType, getValueType } from '../core/NodeUtils.js';

const NodeElements = new Map(); // @TODO: Currently only a few nodes are added, probably also add others

export function addNodeElement( name, nodeElement ) {

	if ( NodeElements.has( name ) ) throw new Error( `Redefinition of node element ${ name }` );
	if ( typeof nodeElement !== 'function' ) throw new Error( `Node element ${ name } is not a function` );

	NodeElements.set( name, nodeElement );

}

const shaderNodeHandler = {

	construct( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( nodeObjects( inputs ), ...params );

	},

	get: function ( node, prop, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			if ( NodeElements.has( prop ) ) {

				const nodeElement = NodeElements.get( prop );

				return ( ...params ) => nodeElement( nodeObj, ...params );

			} else if ( prop.endsWith( 'Assign' ) && NodeElements.has( prop.slice( 0, prop.length - 'Assign'.length ) ) ) {

				const nodeElement = NodeElements.get( prop.slice( 0, prop.length - 'Assign'.length ) );

				return ( ...params ) => nodeObj.assign( nodeElement( nodeObj, ...params ) );

			} else if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true ) {

				// accessing properties ( swizzle )

				prop = prop
					.replace( /r|s/g, 'x' )
					.replace( /g|t/g, 'y' )
					.replace( /b|p/g, 'z' )
					.replace( /a|q/g, 'w' );

				return nodeObject( new SplitNode( node, prop ) );

			} else if ( prop === 'width' || prop === 'height' ) {

				// accessing property

				return nodeObject( new SplitNode( node, prop === 'width' ? 'x' : 'y' ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return nodeObject( new ArrayElementNode( node, new ConstNode( Number( prop ), 'uint' ) ) );

			}

		}

		return node[ prop ];

	}

};

const nodeObjectsCacheMap = new WeakMap();

const ShaderNodeObject = function ( obj ) {

	const type = getValueType( obj );

	if ( type === 'node' ) {

		let nodeObject = nodeObjectsCacheMap.get( obj );

		if ( nodeObject === undefined ) {

			nodeObject = new Proxy( obj, shaderNodeHandler );
			nodeObjectsCacheMap.set( obj, nodeObject );
			nodeObjectsCacheMap.set( nodeObject, nodeObject );

		}

		return nodeObject;

	} else if ( ( type === 'float' ) || ( type === 'boolean' ) ) {

		return nodeObject( getAutoTypedConstNode( obj ) );

	} else if ( type && type !== 'string' ) {

		return nodeObject( new ConstNode( obj ) );

	}

	return obj;

};

const ShaderNodeObjects = function ( objects ) {

	for ( const name in objects ) {

		objects[ name ] = nodeObject( objects[ name ] );

	}

	return objects;

};

const ShaderNodeArray = function ( array ) {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = nodeObject( array[ i ] );

	}

	return array;

};

const ShaderNodeProxy = function ( NodeClass, scope = null, factor = null, settings = null ) {

	const assignNode = ( node ) => nodeObject( settings !== null ? Object.assign( node, settings ) : node );

	if ( scope === null ) {

		return ( ...params ) => {

			return assignNode( new NodeClass( ...nodeArray( params ) ) );

		};

	} else if ( factor !== null ) {

		factor = nodeObject( factor );

		return ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( params ), factor ) );

		};

	} else {

		return ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( params ) ) );

		};

	}

};

const ShaderNodeImmutable = function ( NodeClass, ...params ) {

	return nodeObject( new NodeClass( ...nodeArray( params ) ) );

};

class ShaderNodeInternal extends Node {

	constructor( jsFunc ) {

		super();

		this._jsFunc = jsFunc;

	}

	call( inputs, stack, builder ) {

		inputs = nodeObjects( inputs );

		return nodeObject( this._jsFunc( inputs, stack, builder ) );

	}

	getNodeType( builder ) {

		const { outputNode } = builder.getNodeProperties( this );

		return outputNode ? outputNode.getNodeType( builder ) : super.getNodeType( builder );

	}

	construct( builder ) {

		builder.addStack();

		builder.stack.outputNode = nodeObject( this._jsFunc( builder.stack, builder ) );

		return builder.removeStack();

	}

}

const bools = [ false, true ];
const uints = [ 0, 1, 2, 3 ];
const ints = [ - 1, - 2 ];
const floats = [ 0.5, 1.5, 1 / 3, 1e-6, 1e6, Math.PI, Math.PI * 2, 1 / Math.PI, 2 / Math.PI, 1 / ( Math.PI * 2 ), Math.PI / 2 ];

const boolsCacheMap = new Map();
for ( const bool of bools ) boolsCacheMap.set( bool, new ConstNode( bool ) );

const uintsCacheMap = new Map();
for ( const uint of uints ) uintsCacheMap.set( uint, new ConstNode( uint, 'uint' ) );

const intsCacheMap = new Map( [ ...uintsCacheMap ].map( el => new ConstNode( el.value, 'int' ) ) );
for ( const int of ints ) intsCacheMap.set( int, new ConstNode( int, 'int' ) );

const floatsCacheMap = new Map( [ ...intsCacheMap ].map( el => new ConstNode( el.value ) ) );
for ( const float of floats ) floatsCacheMap.set( float, new ConstNode( float ) );
for ( const float of floats ) floatsCacheMap.set( - float, new ConstNode( - float ) );

const cacheMaps = { bool: boolsCacheMap, uint: uintsCacheMap, ints: intsCacheMap, float: floatsCacheMap };

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

			if ( nodes.length === 1 ) {

				return nodeObject( nodes[ 0 ].nodeType === type || getValueType( nodes[ 0 ].value ) === type ? nodes[ 0 ] : new ConvertNode( nodes[ 0 ], type ) );

			}

			return nodeObject( new JoinNode( nodes, type ) );

		}

	};

};

// exports

// utils

export const getConstNodeType = ( value ) => ( value !== undefined && value !== null ) ? ( value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null ) ) : null;

// shader node base

export function ShaderNode( jsFunc ) {

	return new Proxy( new ShaderNodeInternal( jsFunc ), shaderNodeHandler );

}

export const nodeObject = ( val ) => /* new */ ShaderNodeObject( val );
export const nodeObjects = ( val ) => new ShaderNodeObjects( val );
export const nodeArray = ( val ) => new ShaderNodeArray( val );
export const nodeProxy = ( ...val ) => new ShaderNodeProxy( ...val );
export const nodeImmutable = ( ...val ) => new ShaderNodeImmutable( ...val );

export const shader = ( ...val ) => new ShaderNode( ...val );

addNodeClass( ShaderNode );

// types
// @TODO: Maybe export from ConstNode.js?

export const color = new ConvertType( 'color' );

export const float = new ConvertType( 'float', cacheMaps.float );
export const int = new ConvertType( 'int', cacheMaps.int );
export const uint = new ConvertType( 'uint', cacheMaps.uint );
export const bool = new ConvertType( 'bool', cacheMaps.bool );

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

export const string = ( value = '' ) => nodeObject( new ConstNode( value, 'string' ) );
export const arrayBuffer = ( value ) => nodeObject( new ConstNode( value, 'ArrayBuffer' ) );

addNodeElement( 'color', color );
addNodeElement( 'float', float );
addNodeElement( 'int', int );
addNodeElement( 'uint', uint );
addNodeElement( 'bool', bool );
addNodeElement( 'vec2', vec2 );
addNodeElement( 'ivec2', ivec2 );
addNodeElement( 'uvec2', uvec2 );
addNodeElement( 'bvec2', bvec2 );
addNodeElement( 'vec3', vec3 );
addNodeElement( 'ivec3', ivec3 );
addNodeElement( 'uvec3', uvec3 );
addNodeElement( 'bvec3', bvec3 );
addNodeElement( 'vec4', vec4 );
addNodeElement( 'ivec4', ivec4 );
addNodeElement( 'uvec4', uvec4 );
addNodeElement( 'bvec4', bvec4 );
addNodeElement( 'mat3', mat3 );
addNodeElement( 'imat3', imat3 );
addNodeElement( 'umat3', umat3 );
addNodeElement( 'bmat3', bmat3 );
addNodeElement( 'mat4', mat4 );
addNodeElement( 'imat4', imat4 );
addNodeElement( 'umat4', umat4 );
addNodeElement( 'bmat4', bmat4 );
addNodeElement( 'string', string );
addNodeElement( 'arrayBuffer', arrayBuffer );

// basic nodes
// HACK - we cannot export them from the corresponding files because of the cyclic dependency
export const element = nodeProxy( ArrayElementNode );
export const convert = ( node, types ) => nodeObject( new ConvertNode( nodeObject( node ), types ) );
export const split = ( node, channels ) => nodeObject( new SplitNode( nodeObject( node ), channels ) );

addNodeElement( 'element', element );
addNodeElement( 'convert', convert );
