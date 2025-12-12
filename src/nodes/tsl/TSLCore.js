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
import { warn, error } from '../../utils.js';

let currentStack = null;

const NodeElements = new Map();

// Extend Node Class for TSL using prototype

export function addMethodChaining( name, nodeElement ) {

	if ( NodeElements.has( name ) ) {

		warn( `TSL: Redefinition of method chaining '${ name }'.` );
		return;

	}

	if ( typeof nodeElement !== 'function' ) throw new Error( `THREE.TSL: Node element ${ name } is not a function` );

	NodeElements.set( name, nodeElement );

	if ( name !== 'assign' ) {

		// Changing Node prototype to add method chaining

		Node.prototype[ name ] = function ( ...params ) {

			//if ( name === 'toVarIntent' ) return this;

			return this.isStackNode ? this.addToStack( nodeElement( ...params ) ) : nodeElement( this, ...params );

		};

		// Adding assign method chaining

		Node.prototype[ name + 'Assign' ] = function ( ...params ) {

			return this.isStackNode ? this.assign( params[ 0 ], nodeElement( ...params ) ) : this.assign( nodeElement( this, ...params ) );

		};

	}

}

const parseSwizzle = ( props ) => props.replace( /r|s/g, 'x' ).replace( /g|t/g, 'y' ).replace( /b|p/g, 'z' ).replace( /a|q/g, 'w' );
const parseSwizzleAndSort = ( props ) => parseSwizzle( props ).split( '' ).sort().join( '' );

Node.prototype.assign = function ( ...params ) {

	if ( this.isStackNode !== true ) {

		if ( currentStack !== null ) {

			currentStack.assign( this, ...params );

		} else {

			error( 'TSL: No stack defined for assign operation. Make sure the assign is inside a Fn().' );

		}

		return this;

	} else {

		const nodeElement = NodeElements.get( 'assign' );

		return this.addToStack( nodeElement( ...params ) );

	}

};

Node.prototype.toVarIntent = function () {

	return this;

};

Node.prototype.get = function ( value ) {

	return new MemberNode( this, value );

};

// Cache prototype for TSL

const proto = {};

// Set swizzle properties for xyzw, rgba, and stpq.

function setProtoSwizzle( property, altA, altB ) {

	// swizzle properties

	proto[ property ] = proto[ altA ] = proto[ altB ] = {

		get() {

			this._cache = this._cache || {};

			//

			let split = this._cache[ property ];

			if ( split === undefined ) {

				split = new SplitNode( this, property );

				this._cache[ property ] = split;

			}

			return split;

		},

		set( value ) {

			this[ property ].assign( nodeObject( value ) );

		}

	};

	// set properties ( swizzle ) and sort to xyzw sequence

	const propUpper = property.toUpperCase();
	const altAUpper = altA.toUpperCase();
	const altBUpper = altB.toUpperCase();

	// Set methods for swizzle properties

	Node.prototype[ 'set' + propUpper ] = Node.prototype[ 'set' + altAUpper ] = Node.prototype[ 'set' + altBUpper ] = function ( value ) {

		const swizzle = parseSwizzleAndSort( property );

		return new SetNode( this, swizzle, nodeObject( value ) );

	};

	// Set methods for flip properties

	Node.prototype[ 'flip' + propUpper ] = Node.prototype[ 'flip' + altAUpper ] = Node.prototype[ 'flip' + altBUpper ] = function () {

		const swizzle = parseSwizzleAndSort( property );

		return new FlipNode( this, swizzle );

	};

}

const swizzleA = [ 'x', 'y', 'z', 'w' ];
const swizzleB = [ 'r', 'g', 'b', 'a' ];
const swizzleC = [ 's', 't', 'p', 'q' ];

for ( let a = 0; a < 4; a ++ ) {

	let prop = swizzleA[ a ];
	let altA = swizzleB[ a ];
	let altB = swizzleC[ a ];

	setProtoSwizzle( prop, altA, altB );

	for ( let b = 0; b < 4; b ++ ) {

		prop = swizzleA[ a ] + swizzleA[ b ];
		altA = swizzleB[ a ] + swizzleB[ b ];
		altB = swizzleC[ a ] + swizzleC[ b ];

		setProtoSwizzle( prop, altA, altB );

		for ( let c = 0; c < 4; c ++ ) {

			prop = swizzleA[ a ] + swizzleA[ b ] + swizzleA[ c ];
			altA = swizzleB[ a ] + swizzleB[ b ] + swizzleB[ c ];
			altB = swizzleC[ a ] + swizzleC[ b ] + swizzleC[ c ];

			setProtoSwizzle( prop, altA, altB );

			for ( let d = 0; d < 4; d ++ ) {

				prop = swizzleA[ a ] + swizzleA[ b ] + swizzleA[ c ] + swizzleA[ d ];
				altA = swizzleB[ a ] + swizzleB[ b ] + swizzleB[ c ] + swizzleB[ d ];
				altB = swizzleC[ a ] + swizzleC[ b ] + swizzleC[ c ] + swizzleC[ d ];

				setProtoSwizzle( prop, altA, altB );

			}

		}

	}

}

// Set/get static properties for array elements (0-31).

for ( let i = 0; i < 32; i ++ ) {

	proto[ i ] = {

		get() {

			this._cache = this._cache || {};

			//

			let element = this._cache[ i ];

			if ( element === undefined ) {

				element = new ArrayElementNode( this, new ConstNode( i, 'uint' ) );

				this._cache[ i ] = element;

			}

			return element;

		},

		set( value ) {

			this[ i ].assign( nodeObject( value ) );

		}

	};

}

/*
// Set properties for width, height, and depth.

function setProtoProperty( property, target ) {

	proto[ property ] = {

		get() {

			this._cache = this._cache || {};

			//

			let split = this._cache[ target ];

			if ( split === undefined ) {

				split = new SplitNode( this, target );

				this._cache[ target ] = split;

			}

			return split;

		},

		set( value ) {

			this[ target ].assign( nodeObject( value ) );

		}

	};

}

setProtoProperty( 'width', 'x' );
setProtoProperty( 'height', 'y' );
setProtoProperty( 'depth', 'z' );
*/

Object.defineProperties( Node.prototype, proto );

// --- FINISH ---

const nodeBuilderFunctionsCacheMap = new WeakMap();

const ShaderNodeObject = function ( obj, altType = null ) {

	const type = getValueType( obj );

	if ( type === 'node' ) {

		return obj;

	} else if ( ( altType === null && ( type === 'float' || type === 'boolean' ) ) || ( type && type !== 'shader' && type !== 'string' ) ) {

		return nodeObject( getConstNode( obj, altType ) );

	} else if ( type === 'shader' ) {

		return obj.isFn ? obj : Fn( obj );

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

	function assignNode( node ) {

		if ( settings !== null ) {

			node = nodeObject( Object.assign( node, settings ) );

			if ( settings.intent === true ) {

				node = node.toVarIntent();

			}

		} else {

			node = nodeObject( node );

		}

		return node;


	}

	let fn, name = scope, minParams, maxParams;

	function verifyParamsLimit( params ) {

		let tslName;

		if ( name ) tslName = /[a-z]/i.test( name ) ? name + '()' : name;
		else tslName = NodeClass.type;

		if ( minParams !== undefined && params.length < minParams ) {

			error( `TSL: "${ tslName }" parameter length is less than minimum required.` );

			return params.concat( new Array( minParams - params.length ).fill( 0 ) );

		} else if ( maxParams !== undefined && params.length > maxParams ) {

			error( `TSL: "${ tslName }" parameter length exceeds limit.` );

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

	return new NodeClass( ...nodeArray( params ) );

};

class ShaderCallNodeInternal extends Node {

	constructor( shaderNode, rawInputs ) {

		super();

		this.shaderNode = shaderNode;
		this.rawInputs = rawInputs;

		this.isShaderCallNodeInternal = true;

	}

	getNodeType( builder ) {

		return this.shaderNode.nodeType || this.getOutputNode( builder ).getNodeType( builder );

	}

	getElementType( builder ) {

		return this.getOutputNode( builder ).getElementType( builder );

	}

	getMemberType( builder, name ) {

		return this.getOutputNode( builder ).getMemberType( builder, name );

	}

	call( builder ) {

		const { shaderNode, rawInputs } = this;

		const properties = builder.getNodeProperties( shaderNode );

		const subBuild = builder.getClosestSubBuild( shaderNode.subBuilds ) || '';
		const subBuildProperty = subBuild || 'default';

		if ( properties[ subBuildProperty ] ) {

			return properties[ subBuildProperty ];

		}

		//

		const previousSubBuildFn = builder.subBuildFn;
		const previousFnCall = builder.fnCall;

		builder.subBuildFn = subBuild;
		builder.fnCall = this;

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

			//

			const inputs = rawInputs ? getLayoutParameters( rawInputs ) : null;

			result = nodeObject( functionNode.call( inputs ) );

		} else {

			const secureNodeBuilder = new Proxy( builder, {

				get: ( target, property, receiver ) => {

					let value;

					if ( Symbol.iterator === property ) {

						value = function* () {

							yield undefined;

						};

					} else {

						value = Reflect.get( target, property, receiver );

					}

					return value;

				}

			} );

			//

			const inputs = rawInputs ? getProxyParameters( rawInputs ) : null;

			const hasParameters = Array.isArray( rawInputs ) ? rawInputs.length > 0 : rawInputs !== null;

			const jsFunc = shaderNode.jsFunc;
			const outputNode = hasParameters || jsFunc.length > 1 ? jsFunc( inputs, secureNodeBuilder ) : jsFunc( secureNodeBuilder );

			result = nodeObject( outputNode );

		}

		builder.subBuildFn = previousSubBuildFn;
		builder.fnCall = previousFnCall;

		if ( shaderNode.once ) {

			properties[ subBuildProperty ] = result;

		}

		return result;

	}

	setupOutput( builder ) {

		builder.addStack();

		builder.stack.outputNode = this.call( builder );

		return builder.removeStack();

	}

	getOutputNode( builder ) {

		const properties = builder.getNodeProperties( this );
		const subBuildOutput = builder.getSubBuildOutput( this );

		properties[ subBuildOutput ] = properties[ subBuildOutput ] || this.setupOutput( builder );
		properties[ subBuildOutput ].subBuild = builder.getClosestSubBuild( this );

		return properties[ subBuildOutput ];

	}

	build( builder, output = null ) {

		let result = null;

		const buildStage = builder.getBuildStage();
		const properties = builder.getNodeProperties( this );

		const subBuildOutput = builder.getSubBuildOutput( this );
		const outputNode = this.getOutputNode( builder );

		const previousFnCall = builder.fnCall;

		builder.fnCall = this;

		if ( buildStage === 'setup' ) {

			const subBuildInitialized = builder.getSubBuildProperty( 'initialized', this );

			if ( properties[ subBuildInitialized ] !== true ) {

				properties[ subBuildInitialized ] = true;

				properties[ subBuildOutput ] = this.getOutputNode( builder );
				properties[ subBuildOutput ].build( builder );

				// If the shaderNode has subBuilds, add them to the chaining nodes
				// so they can be built later in the build process.

				if ( this.shaderNode.subBuilds ) {

					for ( const node of builder.chaining ) {

						const nodeData = builder.getDataFromNode( node, 'any' );
						nodeData.subBuilds = nodeData.subBuilds || new Set();

						for ( const subBuild of this.shaderNode.subBuilds ) {

							nodeData.subBuilds.add( subBuild );

						}

						//builder.getDataFromNode( node ).subBuilds = nodeData.subBuilds;

					}

				}

			}

			result = properties[ subBuildOutput ];

		} else if ( buildStage === 'analyze' ) {

			outputNode.build( builder, output );

		} else if ( buildStage === 'generate' ) {

			result = outputNode.build( builder, output ) || '';

		}

		builder.fnCall = previousFnCall;

		return result;

	}

}

function getLayoutParameters( params ) {

	let output;

	nodeObjects( params );

	const isArrayAsParameter = params[ 0 ] && ( params[ 0 ].isNode || Object.getPrototypeOf( params[ 0 ] ) !== Object.prototype );

	if ( isArrayAsParameter ) {

		output = [ ...params ];

	} else {

		output = params[ 0 ];

	}

	return output;

}

function getProxyParameters( params ) {

	let index = 0;

	nodeObjects( params );

	return new Proxy( params, {

		get: ( target, property, receiver ) => {

			let value;

			if ( property === 'length' ) {

				value = params.length;

				return value;

			}

			if ( Symbol.iterator === property ) {

				value = function* () {

					for ( const inputNode of params ) {

						yield nodeObject( inputNode );

					}

				};

			} else {

				if ( params.length > 0 ) {

					if ( Object.getPrototypeOf( params[ 0 ] ) === Object.prototype ) {

						const objectTarget = params[ 0 ];

						if ( objectTarget[ property ] === undefined ) {

							value = objectTarget[ index ++ ];

						} else {

							value = Reflect.get( objectTarget, property, receiver );

						}

					} else if ( params[ 0 ] instanceof Node ) {

						if ( params[ property ] === undefined ) {

							value = params[ index ++ ];

						} else {

							value = Reflect.get( params, property, receiver );

						}

					}

				} else {

					value = Reflect.get( target, property, receiver );

				}

				value = nodeObject( value );

			}

			return value;

		}

	} );

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

	getLayout() {

		return this.layout;

	}

	call( rawInputs = null ) {

		return new ShaderCallNodeInternal( this, rawInputs );

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

const ConvertType = function ( type, cacheMap = null ) {

	return ( ...params ) => {

		for ( const param of params ) {

			if ( param === undefined ) {

				error( `TSL: Invalid parameter for the type "${ type }".` );

				return new ConstNode( 0, type );

			}

		}

		if ( params.length === 0 || ( ! [ 'bool', 'float', 'int', 'uint' ].includes( type ) && params.every( param => {

			const paramType = typeof param;

			return paramType !== 'object' && paramType !== 'function';

		} ) ) ) {

			params = [ getValueFromType( type, ...params ) ];

		}

		if ( params.length === 1 && cacheMap !== null && cacheMap.has( params[ 0 ] ) ) {

			return nodeObjectIntent( cacheMap.get( params[ 0 ] ) );

		}

		if ( params.length === 1 ) {

			const node = getConstNode( params[ 0 ], type );
			if ( node.nodeType === type ) return nodeObjectIntent( node );
			return nodeObjectIntent( new ConvertNode( node, type ) );

		}

		const nodes = params.map( param => getConstNode( param ) );
		return nodeObjectIntent( new JoinNode( nodes, type ) );

	};

};

// exports

export const defined = ( v ) => typeof v === 'object' && v !== null ? v.value : v; // TODO: remove boolean conversion and defined function

// utils

export const getConstNodeType = ( value ) => ( value !== undefined && value !== null ) ? ( value.nodeType || value.convertTo || ( typeof value === 'string' ? value : null ) ) : null;

// shader node base

export function ShaderNode( jsFunc, nodeType ) {

	return new ShaderNodeInternal( jsFunc, nodeType );

}

export const nodeObject = ( val, altType = null ) => /* new */ ShaderNodeObject( val, altType );
export const nodeObjectIntent = ( val, altType = null ) => /* new */ nodeObject( val, altType ).toVarIntent();
export const nodeObjects = ( val, altType = null ) => new ShaderNodeObjects( val, altType );
export const nodeArray = ( val, altType = null ) => new ShaderNodeArray( val, altType );
export const nodeProxy = ( NodeClass, scope = null, factor = null, settings = null ) => new ShaderNodeProxy( NodeClass, scope, factor, settings );
export const nodeImmutable = ( NodeClass, ...params ) => new ShaderNodeImmutable( NodeClass, ...params );
export const nodeProxyIntent = ( NodeClass, scope = null, factor = null, settings = {} ) => new ShaderNodeProxy( NodeClass, scope, factor, { ...settings, intent: true } );

let fnId = 0;

class FnNode extends Node {

	constructor( jsFunc, layout = null ) {

		super();

		let nodeType = null;

		if ( layout !== null ) {

			if ( typeof layout === 'object' ) {

				nodeType = layout.return;

			} else {

				if ( typeof layout === 'string' ) {

					nodeType = layout;

				} else {

					error( 'TSL: Invalid layout type.' );

				}

				layout = null;

			}

		}

		this.shaderNode = new ShaderNode( jsFunc, nodeType );

		if ( layout !== null ) {

			this.setLayout( layout );

		}

		this.isFn = true;

	}

	setLayout( layout ) {

		const nodeType = this.shaderNode.nodeType;

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

		this.shaderNode.setLayout( layout );

		return this;

	}

	getNodeType( builder ) {

		return this.shaderNode.getNodeType( builder ) || 'float';

	}

	call( ...params ) {

		const fnCall = this.shaderNode.call( params );

		if ( this.shaderNode.nodeType === 'void' ) fnCall.toStack();

		return fnCall.toVarIntent();

	}

	once( subBuilds = null ) {

		this.shaderNode.once = true;
		this.shaderNode.subBuilds = subBuilds;

		return this;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		error( 'TSL: "Fn()" was declared but not invoked. Try calling it like "Fn()( ...params )".' );

		return builder.generateConst( type );

	}

}

export function Fn( jsFunc, layout = null ) {

	const instance = new FnNode( jsFunc, layout );

	return new Proxy( () => {}, {

		apply( target, thisArg, params ) {

			return instance.call( ...params );

		},

		get( target, prop, receiver ) {

			return Reflect.get( instance, prop, receiver );

		},

		set( target, prop, value, receiver ) {

			return Reflect.set( instance, prop, value, receiver );

		}

	} );

}

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

	if ( currentStack ) currentStack.addToStack( node );

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

export const string = ( value = '' ) => new ConstNode( value, 'string' );
export const arrayBuffer = ( value ) => new ConstNode( value, 'ArrayBuffer' );

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

	warn( 'TSL: append() has been renamed to Stack().' );
	return Stack( node );

};

addMethodChaining( 'append', ( node ) => { // @deprecated, r176

	warn( 'TSL: .append() has been renamed to .toStack().' );
	return Stack( node );

} );
