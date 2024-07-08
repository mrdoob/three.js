export const typeToLengthLib = {
	// gpu
	string: 1,
	float: 1,
	bool: 1,
	vec2: 2,
	vec3: 3,
	vec4: 4,
	color: 3,
	mat2: 1,
	mat3: 1,
	mat4: 1,
	// cpu
	String: 1,
	Number: 1,
	Vector2: 2,
	Vector3: 3,
	Vector4: 4,
	Color: 3,
	// cpu: other stuff
	Material: 1,
	Object3D: 1,
	CodeNode: 1,
	Texture: 1,
	URL: 1,
	node: 1
};

export const defaultLength = 1;

export function getLengthFromType( type ) {

	return typeToLengthLib[ type ] || defaultLength;

}

export function getLengthFromNode( value ) {

	const type = getTypeFromNode( value );

	return getLengthFromType( type );

}

export const typeToColorLib = {
	// gpu
	string: '#ff0000',
	float: '#eeeeee',
	bool: '#0060ff',
	mat2: '#d0dc8b',
	mat3: '#d0dc8b',
	mat4: '#d0dc8b',
	// cpu
	String: '#ff0000',
	Number: '#eeeeee',
	// cpu: other stuff
	Material: '#228b22',
	Object3D: '#00a1ff',
	CodeNode: '#ff00ff',
	Texture: '#ffa500',
	URL: '#ff0080'
};

export function getColorFromType( type ) {

	return typeToColorLib[ type ] || null;

}

export function getColorFromNode( value ) {

	const type = getTypeFromNode( value );

	return getColorFromType( type );

}

function getTypeFromNode( value ) {

	if ( value ) {

		if ( value.isMaterial ) return 'Material';

		return value.nodeType === 'ArrayBuffer' ? 'URL' : ( value.nodeType || getTypeFromValue( value.value ) );

	}

}

function getTypeFromValue( value ) {

	if ( value && value.isScriptableValueNode ) value = value.value;
	if ( ! value ) return;

	if ( value.isNode && value.nodeType === 'string' ) return 'string';
	if ( value.isNode && value.nodeType === 'ArrayBuffer' ) return 'URL';

	for ( const type of Object.keys( typeToLengthLib ).reverse() ) {

		if ( value[ 'is' + type ] === true ) return type;

	}

}

export function setInputAestheticsFromType( element, type ) {

	element.setInput( getLengthFromType( type ) );

	const color = getColorFromType( type );

	if ( color ) {

		element.setInputColor( color );

	}

	return element;

}

export function setOutputAestheticsFromNode( element, node ) {

	if ( ! node ) {

		element.setOutput( 0 );

		return element;

	}

	return setOutputAestheticsFromType( element, getTypeFromNode( node ) );

}

export function setOutputAestheticsFromType( element, type ) {

	if ( ! type ) {

		element.setOutput( 1 );

		return element;

	}

	if ( type == 'void' ) {

		element.setOutput( 0 );

		return element;

	}

	element.setOutput( getLengthFromType( type ) );

	const color = getColorFromType( type );

	if ( color ) {

		element.setOutputColor( color );

	}

	return element;

}