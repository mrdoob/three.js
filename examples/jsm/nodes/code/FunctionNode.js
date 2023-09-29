import CodeNode from './CodeNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class FunctionNode extends CodeNode {

	constructor( code = '', includes = [], language = '' ) {

		super( code, includes, language );

		this.keywords = {};

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

		let code = this.getNodeFunction( builder ).getCode( propertyName );

		const keywords = this.keywords;
		const keywordsProperties = Object.keys( keywords );

		if ( keywordsProperties.length > 0 ) {

			for ( const property of keywordsProperties ) {

				const propertyRegExp = new RegExp( `\\b${property}\\b`, 'g' );
				const nodeProperty = keywords[ property ].build( builder, 'property' );

				code = code.replace( propertyRegExp, nodeProperty );

			}

		}

		nodeCode.code = code;

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

export const func = ( code, includes ) => { // @deprecated, r154

	console.warn( 'TSL: func() is deprecated. Use nativeFn(), wgslFn() or glslFn() instead.' );

	return nodeObject( new FunctionNode( code, includes ) );

};

addNodeClass( 'FunctionNode', FunctionNode );
