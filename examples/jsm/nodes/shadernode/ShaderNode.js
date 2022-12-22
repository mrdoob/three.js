import Node from '../core/Node.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import ConstNode from '../core/ConstNode.js';
import StackNode from '../core/StackNode.js';
import { getValueFromType } from '../core/NodeUtils.js';

import * as NodeElements from './ShaderNodeElements.js';

const shaderNodeHandler = {

	construct( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( nodeObjects( inputs ), ...params );

	},

	get: function ( node, prop, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true ) {

				// accessing properties ( swizzle )

				prop = prop
					.replace( /r|s/g, 'x' )
					.replace( /g|t/g, 'y' )
					.replace( /b|p/g, 'z' )
					.replace( /a|q/g, 'w' );

				return nodeObject( new SplitNode( node, prop ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return nodeObject( new ArrayElementNode( node, new ConstNode( Number( prop ), 'uint' ) ) );

			} else if ( NodeElements[ prop ] ) {

				const nodeElement = NodeElements[ prop ];

				return ( ...params ) => nodeElement( nodeObj, ...params );

			}

		}

		return node[ prop ];

	}

};

const nodeObjectsCacheMap = new WeakMap();

const ShaderNodeObject = function ( obj ) {

	const type = typeof obj;

	if ( ( type === 'number' ) || ( type === 'boolean' ) ) {

		return nodeObject( getAutoTypedConstNode( obj ) );

	} else if ( type === 'object' ) {

		if ( obj?.isNode === true ) {

			let nodeObject = nodeObjectsCacheMap.get( obj );

			if ( nodeObject === undefined ) {

				nodeObject = new Proxy( obj, shaderNodeHandler );
				nodeObjectsCacheMap.set( obj, nodeObject );
				nodeObjectsCacheMap.set( nodeObject, nodeObject );

			}

			return nodeObject;

		}

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

	call( inputs, builder ) {

		inputs = nodeObjects( inputs );

		return nodeObject( this._jsFunc( inputs, builder ) );

	}

	getNodeType( builder ) {

		const { outputNode } = builder.getNodeProperties( this );

		return outputNode ? outputNode.getNodeType( builder ) : super.getNodeType( builder );

	}

	construct( builder ) {

		const stackNode = new StackNode();
		stackNode.outputNode = this.call( {}, stackNode, builder );

		return stackNode;

	}

}

const ShaderNodeScript = function ( jsFunc ) {

	return new ShaderNodeInternal( jsFunc );

};

export const ShaderNode = new Proxy( ShaderNodeScript, shaderNodeHandler );

export const nodeObject = ( val ) => /* new */ ShaderNodeObject( val );
export const nodeObjects = ( val ) => new ShaderNodeObjects( val );
export const nodeArray = ( val ) => new ShaderNodeArray( val );
export const nodeProxy = ( ...val ) => new ShaderNodeProxy( ...val );
export const nodeImmutable = ( ...val ) => new ShaderNodeImmutable( ...val );

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

export const cacheMaps = { bool: boolsCacheMap, uint: uintsCacheMap, ints: intsCacheMap, float: floatsCacheMap };

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

export const ConvertType = function ( type, cacheMap = null ) {

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

				return nodeObject( nodes[ 0 ].nodeType === type ? nodes[ 0 ] : new ConvertNode( nodes[ 0 ], type ) );

			}

			return nodeObject( new JoinNode( nodes, type ) );

		}

	};

};

export const getConstNodeType = ( value ) => value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null );
