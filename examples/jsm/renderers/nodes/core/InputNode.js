import Node from './Node.js';

class InputNode extends Node {

	constructor( inputType ) {

		super( inputType );

		this.inputType = inputType;

		this.constant = false;

	}

	setConst( value ) {

		this.constant = value;

		return this;

	}

	getConst() {

		return this.constant;

	}

	getInputType( /* builder */ ) {

		return this.inputType;

	}

	generateConst( builder ) {

		return builder.getConst( this.getNodeType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		if ( this.constant === true ) {

			return builder.format( this.generateConst( builder ), type, output );

		} else {

			const inputType = this.getInputType( builder );

			const nodeUniform = builder.getUniformFromNode( this, builder.shaderStage, inputType );
			const propertyName = builder.getPropertyName( nodeUniform );

			return builder.format( propertyName, type, output );

		}

	}

}

InputNode.prototype.isInputNode = true;

export default InputNode;
