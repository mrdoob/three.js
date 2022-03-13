import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';

export const getNodesKeys = ( object ) => {

	const props = [];

	for ( const name in object ) {

		const value = object[ name ];

		if ( value && value.isNode === true ) {

			props.push( name );

		}

	}

	return props;

};

export const getValueType = ( value ) => {

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

};

export const getValueFromType = ( type ) => {

	const last4 = type?.slice( -4 );

	if ( type === 'color' ) {

		return new Color();

	} else if ( last4 === 'vec2' ) {

		return new Vector2();

	} else if ( last4 === 'vec3' ) {

		return new Vector3();

	} else if ( last4 === 'vec4' ) {

		return new Vector4();

	} else if ( last4 === 'mat3' ) {

		return new Matrix3();

	} else if ( last4 === 'mat4' ) {

		return new Matrix4();

	}

	return null;

};
