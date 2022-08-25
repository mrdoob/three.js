import Node from './Node.js';
import { getValueType, getValueFromType } from './NodeUtils.js';

class InputNode extends Node {

	constructor( value, nodeType = null ) {

		super( nodeType );

		this.isInputNode = true;

		this.value = value;

	}

	getNodeType( /*builder*/ ) {

		if ( this.nodeType === null ) {

			return getValueType( this.value );

		}

		return this.nodeType;

	}

	getInputType( builder ) {

		return this.getNodeType( builder );

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value?.toArray?.() || this.value;
		data.valueType = getValueType( this.value );
		data.nodeType = this.nodeType;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.nodeType = data.nodeType;
		this.value = getValueFromType( data.valueType );
		this.value = this.value?.fromArray?.( data.value ) || data.value;

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

}

export default InputNode;
