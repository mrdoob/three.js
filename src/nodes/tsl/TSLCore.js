import Node from '../core/Node.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import SetNode from '../utils/SetNode.js';
import FlipNode from '../utils/FlipNode.js';
import ConstNode from '../core/ConstNode.js';
import MemberNode from '../utils/MemberNode.js';
import { getValueFromType, getValueType } from '../core/NodeUtils.js';

let currentStack = null;

const NodeElements = new Map();

export function addMethodChaining( name, nodeElement ) {

	if ( NodeElements.has( name ) ) {

		console.warn( `THREE.TSL: Redefinition of method chaining '${ name }'.` );
		return;

	}

	if ( typeof nodeElement !== 'function' ) throw new Error( `THREE.TSL: Node element ${ name } is not a function` );

	NodeElements.set( name, nodeElement );

}

const parseSwizzle = ( props ) => props.replace( /r|s/g, 'x' ).replace( /g|t/g, 'y' ).replace( /b|p/g, 'z' ).replace( /a|q/g, 'w' );
const parseSwizzleAndSort = ( props ) => parseSwizzle( props ).split( '' ).sort().join( '' );

const shaderNodeHandler = {

	setup( NodeClosure, params ) {

		const inputs = params.shift();

		return NodeClosure( nodeObjects( inputs ), ...params );

	},

	get( node, prop, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			if ( node.isStackNode !== true && prop === 'assign' ) {

				return ( ...params ) => {

					currentStack.assign( nodeObj, ...params );

					return nodeObj;

				};

			} else if ( NodeElements.has( prop ) ) {

				const nodeElement = NodeElements.get( prop );

				return node.isStackNode ? ( ...params ) => nodeObj.add( nodeElement( ...params ) ) : ( ...params ) => nodeElement( nodeObj, ...params );

			} else if ( prop === 'self' ) {

				return node;

			} else if ( prop.endsWith( 'Assign' ) && NodeElements.has( prop.slice( 0, prop.length - 'Assign'.length ) ) ) {

				const nodeElement = NodeElements.get( prop.slice( 0, prop.length - 'Assign'.length ) );

				return node.isStackNode ? ( ...params ) => nodeObj.assign( params[ 0 ], nodeElement( ...params ) ) : ( ...params ) => nodeObj.assign( nodeElement( nodeObj, ...params ) );

			} else if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true ) {

				// accessing properties ( swizzle )

				prop = parseSwizzle( prop );

				return nodeObject( new SplitNode( nodeObj, prop ) );

			} else if ( /^set[XYZWRGBASTPQ]{1,4}$/.test( prop ) === true ) {

				// set properties ( swizzle ) and sort to xyzw sequence

				prop = parseSwizzleAndSort( prop.slice( 3 ).toLowerCase() );

				return ( value ) => nodeObject( new SetNode( node, prop, value ) );

			} else if ( /^flip[XYZWRGBASTPQ]{1,4}$/.test( prop ) === true ) {

				// set properties ( swizzle ) and sort to xyzw sequence

				prop = parseSwizzleAndSort( prop.slice( 4 ).toLowerCase() );

				return () => nodeObject( new FlipNode( nodeObject( node ), prop ) );

			} else if ( prop === 'width' || prop === 'height' || prop === 'depth' ) {

				// accessing property

				if ( prop === 'width' ) prop = 'x';
				else if ( prop === 'height' ) prop = 'y';
				else if ( prop === 'depth' ) prop = 'z';

				return nodeObject( new SplitNode( node, prop ) );

			} else if ( /^\d+$/.test( prop ) === true ) {

				// accessing array

				return nodeObject( new ArrayElementNode( nodeObj, new ConstNode( Number( prop ), 'uint' ) ) );

			} else if ( /^get$/.test( prop ) === true ) {

				// accessing properties

				return ( value ) => nodeObject( new MemberNode( nodeObj, value ) );

			}

		}

		return Reflect.get( node, prop, nodeObj );

	},

	set( node, prop, value, nodeObj ) {

		if ( typeof prop === 'string' && node[ prop ] === undefined ) {

			// setting properties

			if ( /^[xyzwrgbastpq]{1,4}$/.test( prop ) === true || prop === 'width' || prop === 'height' || prop === 'depth' || /^\d+$/.test( prop ) === true ) {

				nodeObj[ prop ].assign( value );

				return true;

			}

		}

		return Reflect.set( node, prop, value, nodeObj );

	}

};

const nodeObjectsCacheMap = new WeakMap();
const nodeBuilderFunctionsCacheMap = new WeakMap();

const ShaderNodeObject = function ( obj, altType = null ) {

	const type = getValueType( obj );

	if ( type === 'node' ) {

		let nodeObject = nodeObjectsCacheMap.get( obj );

		if ( nodeObject === undefined ) {

			nodeObject = new Proxy( obj, shaderNodeHandler );

			nodeObjectsCacheMap.set( obj, nodeObject );
			nodeObjectsCacheMap.set( nodeObject, nodeObject );

		}

		return nodeObject;

	} else if ( ( altType === null && ( type === 'float' || type === 'boolean' ) ) || ( type && type !== 'shader' && type !== 'string' ) ) {

		return nodeObject( getConstNode( obj, altType ) );

	} else if ( type === 'shader' ) {

		return Fn( obj );

	}

	return obj;

};

const ShaderNodeObjects = function ( objects, altType = null ) {

	for ( const name in objects ) {

		objects[ name ] = nodeObject( objects[ name ], altType );

	}

	return objects;

};

const ShaderNodeArray = function ( array, altType = null ) {

	const len = array.length;

	for ( let i = 0; i < len; i ++ ) {

		array[ i ] = nodeObject( array[ i ], altType );

	}

	return array;

};

const ShaderNodeProxy = function ( NodeClass, scope = null, factor = null, settings = null ) {

	const assignNode = ( node ) => nodeObject( settings !== null ? Object.assign( node, settings ) : node );

	let fn, name = scope, minParams, maxParams;

	function verifyParamsLimit( params ) {

		let tslName;

		if ( name ) tslName = /[a-z]/i.test( name ) ? name + '()' : name;
		else tslName = NodeClass.type;

		if ( minParams !== undefined && params.length < minParams ) {

			console.error( `THREE.TSL: "${ tslName }" parameter length is less than minimum required.` );

			return params.concat( new Array( minParams - params.length ).fill( 0 ) );

		} else if ( maxParams !== undefined && params.length > maxParams ) {

			console.error( `THREE.TSL: "${ tslName }" parameter length exceeds limit.` );

			return params.slice( 0, maxParams );

		}

		return params;

	}

	if ( scope === null ) {

		fn = ( ...params ) => {

			return assignNode( new NodeClass( ...nodeArray( verifyParamsLimit( params ) ) ) );

		};

	} else if ( factor !== null ) {

		factor = nodeObject( factor );

		fn = ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( verifyParamsLimit( params ) ), factor ) );

		};

	} else {

		fn = ( ...params ) => {

			return assignNode( new NodeClass( scope, ...nodeArray( verifyParamsLimit( params ) ) ) );

		};

	}

	fn.setParameterLength = ( ...params ) => {

		if ( params.length === 1 ) minParams = maxParams = params[ 0 ];
		else if ( params.length === 2 ) [ minParams, maxParams ] = params;

		return fn;

	};

	fn.setName = ( value ) => {

		name = value;

		return fn;

	};

	return fn;

};

const ShaderNodeImmutable = function ( NodeClass, ...params ) {

	return nodeObject( new NodeClass( ...nodeArray( params ) ) );

};

class ShaderCallNodeInternal extends Node {

	constructor( shaderNode, inputNodes ) {

		super();

		this.shaderNode = shaderNode;
		this.inputNodes = inputNodes;

		this.isShaderCallNodeInternal = true;

	}

	getNodeType( builder ) {

		return this.shaderNode.nodeType || this.getOutputNode( builder ).getNodeType( builder );

	}

	getMemberType( builder, name ) {

		return this.getOutputNode( builder ).getMemberType( builder, name );

	}

	call( builder ) {

		const { shaderNode, inputNodes } = this;

		const properties = builder.getNodeProperties( shaderNode );
		if ( properties.onceOutput ) return properties.onceOutput;

		//

		let result = null;

		if ( shaderNode.layout ) {

			let functionNodesCacheMap = nodeBuilderFunctionsCacheMap.get( builder.constructor );

			if ( functionNodesCacheMap === undefined ) {

				functionNodesCacheMap = new WeakMap();

				nodeBuilderFunctionsCacheMap.set( builder.constructor, functionNodesCacheMap );

			}

			let functionNode = functionNodesCacheMap.get( shaderNode );

			if ( functionNode === undefined ) {

				functionNode = nodeObject( builder.buildFunctionNode( shaderNode ) );

				functionNodesCacheMap.set( shaderNode, functionNode );

			}

			builder.addInclude( functionNode );

			result = nodeObject( functionNode.call( inputNodes ) );

		} else {

			const jsFunc = shaderNode.jsFunc;
			const outputNode = inputNodes !== null || jsFunc.length > 1 ? jsFunc( inputNodes || [], builder ) : jsFunc( builder );

			result = nodeObject( outputNode );

		}

		if ( shaderNode.once ) {

			properties.onceOutput = result;

		}

		return result;

	}

	getOutputNode( builder ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode === null ) {

			properties.outputNode = this.setupOutput( builder );

		}

		return properties.outputNode;

	}

	setup( builder ) {

		return this.getOutputNode( builder );

	}

	setupOutput( builder ) {

		builder.addStack();

		builder.stack.outputNode = this.call( builder );

		return builder.removeStack();

	}

	generate( builder, output ) {

		const outputNode = this.getOutputNode( builder );

		return outputNode.build( builder, output );

	}

}

class ShaderNodeInternal extends Node {

	constructor( jsFunc, nodeType ) {

		super( nodeType );

		this.jsFunc = jsFunc;
		this.layout = null;

		this.global = true;

		this.once = false;

	}

	setLayout( layout ) {

		this.layout = layout;

		return this;

	}

	call( inputs = null ) {

		nodeObjects( inputs );

		return nodeObject( new ShaderCallNodeInternal( this, inputs ) );

	}

	setup() {

		return this.call();

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

const getConstNode = ( value, type ) => {

	if ( constNodesCacheMap.has( value ) ) {

		return constNodesCacheMap.get( value );

	} else if ( value.isNode === true ) {

		return value;

	} else {

		return new ConstNode( value, type );

	}

};

const safeGetNodeType = ( node ) => {

	try {

		return node.getNodeType();

	} catch ( _ ) {

		return undefined;

	}

};

const ConvertType = function ( type, cacheMap = null ) {

	return ( ...params ) => {

		if ( params.length === 0 || ( ! [ 'bool', 'float', 'int', 'uint' ].includes( type ) && params.every( param => typeof param !== 'object' ) ) ) {

			params = [ getValueFromType( type, ...params ) ];

		}

		if ( params.length === 1 && cacheMap !== null && cacheMap.has( params[ 0 ] ) ) {

			return nodeObject( cacheMap.get( params[ 0 ] ) );

		}

		if ( params.length === 1 ) {

			const node = getConstNode( params[ 0 ], type );
			if ( safeGetNodeType( node ) === type ) return nodeObject( node );
			return nodeObject( new ConvertNode( node, type ) );

		}

		const nodes = params.map( param => getConstNode( param ) );
		return nodeObject( new JoinNode( nodes, type ) );

	};

};

// exports

export const defined = ( v ) => typeof v === 'object' && v !== null ? v.value : v; // TODO: remove boolean conversion and defined function

// utils

export const getConstNodeType = ( value ) => ( value !== undefined && value !== null ) ? ( value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null ) ) : null;

// shader node base

export function ShaderNode( jsFunc, nodeType ) {

	return new Proxy( new ShaderNodeInternal( jsFunc, nodeType ), shaderNodeHandler );

}

export const nodeObject = ( val, altType = null ) => /* new */ ShaderNodeObject( val, altType );
export const nodeObjects = ( val, altType = null ) => new ShaderNodeObjects( val, altType );
export const nodeArray = ( val, altType = null ) => new ShaderNodeArray( val, altType );
export const nodeProxy = ( ...params ) => new ShaderNodeProxy( ...params );
export const nodeImmutable = ( ...params ) => new ShaderNodeImmutable( ...params );

let fnId = 0;

export const Fn = ( jsFunc, layout = null ) => {

	let nodeType = null;

	if ( layout !== null ) {

		if ( typeof layout === 'object' ) {

			nodeType = layout.return;

		} else {

			if ( typeof layout === 'string' ) {

				nodeType = layout;

			} else {

				console.error( 'THREE.TSL: Invalid layout type.' );

			}

			layout = null;

		}

	}

	const shaderNode = new ShaderNode( jsFunc, nodeType );

	const fn = ( ...params ) => {

		let inputs;

		nodeObjects( params );

		if ( params[ 0 ] && params[ 0 ].isNode ) {

			inputs = [ ...params ];

		} else {

			inputs = params[ 0 ];

		}

		const fnCall = shaderNode.call( inputs );

		if ( nodeType === 'void' ) fnCall.toStack();

		return fnCall;

	};

	fn.shaderNode = shaderNode;

	fn.setLayout = ( layout ) => {

		shaderNode.setLayout( layout );

		return fn;

	};

	fn.once = () => {

		shaderNode.once = true;

		return fn;

	};

	if ( layout !== null ) {

		if ( typeof layout.inputs !== 'object' ) {

			const fullLayout = {
				name: 'fn' + fnId ++,
				type: nodeType,
				inputs: []
			};

			for ( const name in layout ) {

				if ( name === 'return' ) continue;

				fullLayout.inputs.push( {
					name: name,
					type: layout[ name ]
				} );

			}

			layout = fullLayout;

		}

		fn.setLayout( layout );

	}

	return fn;

};

//

addMethodChaining( 'toGlobal', ( node ) => {

	node.global = true;

	return node;

} );

//

export const setCurrentStack = ( stack ) => {

	if ( currentStack === stack ) {

		//throw new Error( 'Stack already defined.' );

	}

	currentStack = stack;

};

export const getCurrentStack = () => currentStack;

/**
 * Represent a conditional node using if/else statements.
 *
 * ```js
 * If( condition, function )
 * 	.ElseIf( condition, function )
 * 	.Else( function )
 * ```
 * @tsl
 * @function
 * @param {...any} params - The parameters for the conditional node.
 * @returns {StackNode} The conditional node.
 */
export const If = ( ...params ) => currentStack.If( ...params );

/**
 * Represent a conditional node using switch/case statements.
 *
 * ```js
 * Switch( value )
 * 	.Case( 1, function )
 * 	.Case( 2, 3, 4, function )
 * 	.Default( function )
 * ```
 * @tsl
 * @function
 * @param {...any} params - The parameters for the conditional node.
 * @returns {StackNode} The conditional node.
 */
export const Switch = ( ...params ) => currentStack.Switch( ...params );

/**
 * Add the given node to the current stack.
 *
 * @param {Node} node - The node to add.
 * @returns {Node} The node that was added to the stack.
 */
export function Stack( node ) {

	if ( currentStack ) currentStack.add( node );

	return node;

}

addMethodChaining( 'toStack', Stack );

// types

export const color = new ConvertType( 'color' );

export const float = new ConvertType( 'float', cacheMaps.float );
export const int = new ConvertType( 'int', cacheMaps.ints );
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

export const mat2 = new ConvertType( 'mat2' );
export const mat3 = new ConvertType( 'mat3' );
export const mat4 = new ConvertType( 'mat4' );

export const string = ( value = '' ) => nodeObject( new ConstNode( value, 'string' ) );
export const arrayBuffer = ( value ) => nodeObject( new ConstNode( value, 'ArrayBuffer' ) );

addMethodChaining( 'toColor', color );
addMethodChaining( 'toFloat', float );
addMethodChaining( 'toInt', int );
addMethodChaining( 'toUint', uint );
addMethodChaining( 'toBool', bool );
addMethodChaining( 'toVec2', vec2 );
addMethodChaining( 'toIVec2', ivec2 );
addMethodChaining( 'toUVec2', uvec2 );
addMethodChaining( 'toBVec2', bvec2 );
addMethodChaining( 'toVec3', vec3 );
addMethodChaining( 'toIVec3', ivec3 );
addMethodChaining( 'toUVec3', uvec3 );
addMethodChaining( 'toBVec3', bvec3 );
addMethodChaining( 'toVec4', vec4 );
addMethodChaining( 'toIVec4', ivec4 );
addMethodChaining( 'toUVec4', uvec4 );
addMethodChaining( 'toBVec4', bvec4 );
addMethodChaining( 'toMat2', mat2 );
addMethodChaining( 'toMat3', mat3 );
addMethodChaining( 'toMat4', mat4 );

// basic nodes

export const element = /*@__PURE__*/ nodeProxy( ArrayElementNode ).setParameterLength( 2 );
export const convert = ( node, types ) => nodeObject( new ConvertNode( nodeObject( node ), types ) );
export const split = ( node, channels ) => nodeObject( new SplitNode( nodeObject( node ), channels ) );

addMethodChaining( 'element', element );
addMethodChaining( 'convert', convert );

// deprecated

/**
 * @tsl
 * @function
 * @deprecated since r176. Use {@link Stack} instead.
 *
 * @param {Node} node - The node to add.
 * @returns {Function}
 */
export const append = ( node ) => { // @deprecated, r176

	console.warn( 'THREE.TSL: append() has been renamed to Stack().' );
	return Stack( node );

};

addMethodChaining( 'append', ( node ) => { // @deprecated, r176

	console.warn( 'THREE.TSL: .append() has been renamed to .toStack().' );
	return Stack( node );

} );

/**
 * @tsl
 * @function
 * @deprecated since r168. Use {@link Fn} instead.
 *
 * @param {...any} params
 * @returns {Function}
 */
export const tslFn = ( ...params ) => { // @deprecated, r168

	console.warn( 'THREE.TSL: tslFn() has been renamed to Fn().' );
	return Fn( ...params );

};
