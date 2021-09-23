import Node from './Node.js';

class InputNode extends Node {

	constructor( nodeType ) {

		super( nodeType );

		this.constant = false;

	}

	setConst( value ) {

		this.constant = value;

		return this;

	}

	getConst() {

		return this.constant;

	}

	generateConst( builder ) {

		return builder.getConst( this.getNodeType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getNodeType( builder );

		if ( this.constant === true ) {

			return builder.format( this.generateConst( builder ), type, output );

		} else {

			const nodeUniform = builder.getUniformFromNode( this, builder.shaderStage, type );
			const propertyName = builder.getPropertyName( nodeUniform );

			return builder.format( propertyName, type, output );

		}

	}

}

InputNode.prototype.isInputNode = true;

export default InputNode;
