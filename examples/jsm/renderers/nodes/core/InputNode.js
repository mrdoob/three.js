import Node from './Node.js';

class InputNode extends Node {

	constructor( type ) {

		super( type );

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

		return builder.getConst( this.getType( builder ), this.value );

	}

	generate( builder, output ) {

		const type = this.getType( builder );

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
