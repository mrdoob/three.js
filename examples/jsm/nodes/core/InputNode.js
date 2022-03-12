import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';
import Node from './Node.js';

function getValueType( value ) {

	if ( typeof value === 'number' ) {

		return 'float';

	} else if ( typeof value === 'boolean' ) {

		return 'bool';

	} else if ( value?.isVector2 === true ) {

		return 'vec2';

	} else if ( value?.isVector3 === true ) {

		return 'vec3';

	} else if ( value?.isVector4 === true ) {

		return 'vec4';

	} else if ( value?.isMatrix3 === true ) {

		return 'mat3';

	} else if ( value?.isMatrix4 === true ) {

		return 'mat4';

	} else if ( value?.isColor === true ) {

		return 'color';

	}

	return null;

}

function getValueFromType( type ) {

	if ( type === 'color' ) {

		return new Color();

	} else if ( type === 'vec2' ) {

		return new Vector2();

	} else if ( type === 'vec3' ) {

		return new Vector3();

	} else if ( type === 'vec4' ) {

		return new Vector4();

	} else if ( type === 'mat3' ) {

		return new Matrix3();

	} else if ( type === 'mat4' ) {

		return new Matrix4();

	}

	return null;

}

class InputNode extends Node {

	constructor( value, nodeType = null ) {

		super( nodeType );

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

		console.warn('Abstract function.');

	}

}

InputNode.prototype.isInputNode = true;

export default InputNode;
