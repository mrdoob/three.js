import CodeNode from './CodeNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

/**
 * This class represents a native shader function. It can be used to implement
 * certain aspects of a node material with native shader code. There are two predefined
 * TSL functions for easier usage.
 *
 * - `wgslFn`: Creates a WGSL function node.
 * - `glslFn`: Creates a GLSL function node.
 *
 * A basic example with one include looks like so:
 *
 * ```js
 * const desaturateWGSLFn = wgslFn( `
 *	fn desaturate( color:vec3<f32> ) -> vec3<f32> {
 *		let lum = vec3<f32>( 0.299, 0.587, 0.114 );
 *		return vec3<f32>( dot( lum, color ) );
 *	}`
 *);
 * const someWGSLFn = wgslFn( `
 *	fn someFn( color:vec3<f32> ) -> vec3<f32> {
 * 		return desaturate( color );
 * 	}
 * `, [ desaturateWGSLFn ] );
 * material.colorNode = someWGSLFn( { color: texture( map ) } );
 *```
 * @augments CodeNode
 */
class FunctionNode extends CodeNode {

	static get type() {

		return 'FunctionNode';

	}

	/**
	 * Constructs a new function node.
	 *
	 * @param {String} [code=''] - The native code.
	 * @param {Array<Node>} [includes=[]] - An array of includes.
	 * @param {('js'|'wgsl'|'glsl')} [language=''] - The used language.
	 */
	constructor( code = '', includes = [], language = '' ) {

		super( code, includes, language );

	}

	getNodeType( builder ) {

		return this.getNodeFunction( builder ).type;

	}

	/**
	 * Returns the inputs of this function node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Array<NodeFunctionInput>} The inputs.
	 */
	getInputs( builder ) {

		return this.getNodeFunction( builder ).inputs;

	}

	/**
	 * Returns the node function for this function node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {NodeFunction} The node function.
	 */
	getNodeFunction( builder ) {

		const nodeData = builder.getDataFromNode( this );

		let nodeFunction = nodeData.nodeFunction;

		if ( nodeFunction === undefined ) {

			nodeFunction = builder.parser.parseFunction( this.code );

			nodeData.nodeFunction = nodeFunction;

		}

		return nodeFunction;

	}

	generate( builder, output ) {

		super.generate( builder );

		const nodeFunction = this.getNodeFunction( builder );

		const name = nodeFunction.name;
		const type = nodeFunction.type;

		const nodeCode = builder.getCodeFromNode( this, type );

		if ( name !== '' ) {

			// use a custom property name

			nodeCode.name = name;

		}

		const propertyName = builder.getPropertyName( nodeCode );

		const code = this.getNodeFunction( builder ).getCode( propertyName );

		nodeCode.code = code + '\n';

		if ( output === 'property' ) {

			return propertyName;

		} else {

			return builder.format( `${ propertyName }()`, type, output );

		}

	}

}

export default FunctionNode;

const nativeFn = ( code, includes = [], language = '' ) => {

	for ( let i = 0; i < includes.length; i ++ ) {

		const include = includes[ i ];

		// TSL Function: glslFn, wgslFn

		if ( typeof include === 'function' ) {

			includes[ i ] = include.functionNode;

		}

	}

	const functionNode = nodeObject( new FunctionNode( code, includes, language ) );

	const fn = ( ...params ) => functionNode.call( ...params );
	fn.functionNode = functionNode;

	return fn;

};

export const glslFn = ( code, includes ) => nativeFn( code, includes, 'glsl' );
export const wgslFn = ( code, includes ) => nativeFn( code, includes, 'wgsl' );
