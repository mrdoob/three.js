import Node from './Node.js';

class InputNode extends Node {

	constructor( nodeType, value = null ) {

		super( nodeType );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value?.toArray?.() || this.value;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.value = this.value?.fromArray?.( data.value ) || data.value;

	}

	generate( /*builder, output*/ ) {

		console.warn('Abstract function.');

	}

}

InputNode.prototype.isInputNode = true;

export default InputNode;
