import { registerNode } from '../core/Node.js';
import CodeNode from './CodeNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

class FunctionNode extends CodeNode {

	constructor( code = '', includes = [], language = '' ) {

		super( code, includes, language );

	}

	getNodeType( builder ) {

		return this.getNodeFunction( builder ).type;

	}

	getInputs( builder ) {

		return this.getNodeFunction( builder ).inputs;

	}

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

FunctionNode.type = /*@__PURE__*/ registerNode( 'Function', FunctionNode );

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
