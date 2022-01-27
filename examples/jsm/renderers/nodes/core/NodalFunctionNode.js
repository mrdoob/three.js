import { ShaderNode } from '../ShaderNode.js';
import CodeNode from './CodeNode.js';
import ExpressionNode from './ExpressionNode.js';
import FunctionCallNode from './FunctionCallNode.js';

class NodalFunctionNode extends CodeNode {

	constructor( name, type, inputs, body, precision = '' ) {

		super( '', type );

		this.name = name;
		this.inputs = inputs;
		this.precision = precision;

		this.body = new ShaderNode( body );

		this.useKeywords = true;

	}

	getInputs( /* builder */ ) {

		return this.inputs;

	}

	/**
	 *
	 * @param {NodeBuilder} builder
	 * @returns
	 */

	getNodeFunction( builder ) {

		const nodeData = builder.getDataFromNode( this );

		let nodeFunction = nodeData.nodeFunction;

		if ( nodeFunction === undefined ) {

			const inputs = this.getInputs().reduce( ( out, { name, type } )=> {

				if ( out[ name ] !== undefined ) {

					console.warn( `NodalFunction: param ${name} of function ${this.name} is defined more than once` );

				}

				out[ name ] = new ExpressionNode( name, type );

				return out;

			}, {} );


			const flow = builder.flowChildNode( this.body( inputs, builder ) );

			nodeFunction = builder.parser.createNodeFunction();
			nodeFunction.set( this.getNodeType(), this.getInputs(), `{\n\t${flow.code}\n\treturn ${flow.result};\n}\n`, this.name, this.precision );

			nodeData.nodeFunction = nodeFunction;

		}

		return nodeFunction;

	}


	call( parameters = {} ) {

		return new FunctionCallNode( this, parameters );

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

		nodeCode.code = nodeFunction.getCode( propertyName );

		if ( output === 'property' ) {

			return propertyName;

		} else {

			return builder.format( `${ propertyName }()`, type, output );

		}

	}

}

export default NodalFunctionNode;
