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

}

function getValueFromType( type ) {

	if ( type === 'color' ) {

		return new Color();

	} else if ( type.includes( 'vec2' ) ) {

		return new Vector2();

	} else if ( type.includes( 'vec3' ) ) {

		return new Vector3();

	} else if ( type.includes( 'vec4' ) ) {

		return new Vector4();

	} else if ( type.includes( 'mat3' ) ) {

		return new Matrix3();

	} else if ( type.includes( 'mat4' ) ) {

		return new Matrix4();

	}

}

class InputNode extends Node {

	constructor( value, nodeType ) {

		if ( nodeType === undefined ) {

			nodeType = getValueType( value );

		}

		super( nodeType );

		this.value = value;

	}

	serialize( data ) {

		super.serialize( data );

		data.value = this.value?.toArray?.() || this.value;
		data.nodeType = this.nodeType;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.nodeType = data.nodeType;
		this.value = getValueFromType( this.nodeType );
		this.value = this.value?.fromArray?.( data.value ) || data.value;

	}

	generate( /*builder, output*/ ) {

		console.warn('Abstract function.');

	}

}

InputNode.prototype.isInputNode = true;

export default InputNode;
