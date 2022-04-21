import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import ConstNode from '../core/ConstNode.js';
import { getValueFromType } from '../core/NodeUtils.js';

export const shaderNodeHandler = {

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

				return new ShaderNodeObject( new ArrayElementNode( node, new ConstNode( Number( prop ), 'uint' ) ) );

			}

		}

		return node[ prop ];

	}

};

const nodeObjectsCacheMap = new WeakMap();

const ShaderNodeObject = function ( obj ) {

	const type = typeof obj;

	if ( ( type === 'number' ) || ( type === 'boolean' ) ) {

		return new ShaderNodeObject( getAutoTypedConstNode( obj ) );

	} else if ( type === 'object' ) {

		if ( obj.isNode === true ) {

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

		objects[ name ] = new ShaderNodeObject( objects[ name ] );

	}

	return objects;

};

const ShaderNodeArray = function ( array ) {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = new ShaderNodeObject( array[ i ] );

	}

	return array;

};

const ShaderNodeProxy = function ( NodeClass, scope = null, factor = null ) {

	if ( scope === null ) {

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( ...( new ShaderNodeArray( params ) ) ) );

		};

	} else if ( factor === null ) {

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( scope, ...( new ShaderNodeArray( params ) ) ) );

		};

	} else {

		factor = new ShaderNodeObject( factor );

		return ( ...params ) => {

			return new ShaderNodeObject( new NodeClass( scope, ...( new ShaderNodeArray( params ) ), factor ) );

		};

	}

};

export const ShaderNodeScript = function ( jsFunc ) {

	//@TODO: Move this to Node extended class

	const self =
	{
		build: ( builder ) => {

			self.call( {}, builder );

			return '';

		},

		call: ( inputs, builder ) => {

			inputs = new ShaderNodeObjects( inputs );

			return new ShaderNodeObject( jsFunc( inputs, builder ) );

		}
	};

	return self;

};

export const nodeObject = ( val ) => new ShaderNodeObject( val );
export const nodeObjects = ( val ) => new ShaderNodeObjects( val );
export const nodeArray = ( val ) => new ShaderNodeArray( val );
export const nodeProxy = ( ...val ) => new ShaderNodeProxy( ...val );

const bools = [ false, true ];
const uints = [ 0, 1, 2, 3 ];
const ints = [ - 1, - 2 ];
const floats = [ 0.5, 1.5, 1 / 3, 1e-6, 1e6, Math.PI, Math.PI * 2, 1 / Math.PI, 2 / Math.PI, 1 / ( Math.PI * 2 ), Math.PI / 2 ];

const boolsCacheMap = new Map();
for ( let bool of bools ) boolsCacheMap.set( bool, new ConstNode( bool ) );

const uintsCacheMap = new Map();
for ( let uint of uints ) uintsCacheMap.set( uint, new ConstNode( uint, 'uint' ) );

const intsCacheMap = new Map( [ ...uintsCacheMap ].map( el => new ConstNode( el.value, 'int' ) ) );
for ( let int of ints ) intsCacheMap.set( int, new ConstNode( int, 'int' ) );

const floatsCacheMap = new Map( [ ...intsCacheMap ].map( el => new ConstNode( el.value ) ) );
for ( let float of floats ) floatsCacheMap.set( float, new ConstNode( float ) );
for ( let float of floats ) floatsCacheMap.set( - float, new ConstNode( - float ) );

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

			return nodeObject( new ConvertNode( new JoinNode( nodes ), type ) );

		}

	};

};
