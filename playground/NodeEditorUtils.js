import { StringInput, NumberInput, ColorInput, Element, LabelElement } from 'flow';
import { string, float, vec2, vec3, vec4, color } from 'three/nodes';

export function exportJSON( object, name ) {

	const json = JSON.stringify( object );

	const a = document.createElement( 'a' );
	const file = new Blob( [ json ], { type: 'text/plain' } );

	a.href = URL.createObjectURL( file );
	a.download = name + '.json';
	a.click();

}

export function disposeScene( scene ) {

	scene.traverse( object => {

		if ( ! object.isMesh ) return;

		object.geometry.dispose();

		if ( object.material.isMaterial ) {

			disposeMaterial( object.material );

		} else {

			for ( const material of object.material ) {

				disposeMaterial( material );

			}

		}

	} );

}

export function disposeMaterial( material )	{

	material.dispose();

	for ( const key of Object.keys( material ) ) {

		const value = material[ key ];

		if ( value && typeof value === 'object' && typeof value.dispose === 'function' ) {

			value.dispose();

		}

	}

}

export const colorLib = {
	// gpu
	string: '#ff0000',
	// cpu
	Material: '#228b22',
	Object3D: '#00a1ff',
	CodeNode: '#ff00ff',
	Texture: '#ffa500',
	URL: '#ff0080',
	String: '#ff0000'
};

export function getColorFromType( type ) {

	return colorLib[ type ];

}

export function getTypeFromValue( value ) {

	if ( value && value.isScriptableValueNode ) value = value.value;
	if ( ! value ) return;

	if ( value.isNode && value.nodeType === 'string' ) return 'string';
	if ( value.isNode && value.nodeType === 'ArrayBuffer' ) return 'URL';

	for ( const type of Object.keys( colorLib ).reverse() ) {

		if ( value[ 'is' + type ] === true ) return type;

	}

}

export function getColorFromValue( value ) {

	const type = getTypeFromValue( value );

	return getColorFromType( type );

}

export const createColorInput = ( node, element ) => {

	const input = new ColorInput().onChange( () => {

		node.value.setHex( input.getValue() );

		element.dispatchEvent( new Event( 'changeInput' ) );

	} );

	element.add( input );

};

export const createFloatInput = ( node, element ) => {

	const input = new NumberInput().onChange( () => {

		node.value = input.getValue();

		element.dispatchEvent( new Event( 'changeInput' ) );

	} );

	element.add( input );

};

export const createStringInput = ( node, element, settings = {} ) => {

	const input = new StringInput().onChange( () => {

		let value = input.getValue();

		if ( settings.transform === 'lowercase' ) value = value.toLowerCase();
		else if ( settings.transform === 'uppercase' ) value = value.toUpperCase();

		node.value = value;

		element.dispatchEvent( new Event( 'changeInput' ) );

	} );

	element.add( input );

	if ( settings.options ) {

		for ( const option of settings.options ) {

			input.addOption( option );

		}

	}

	const field = input.getInput();

	if ( settings.allows ) field.addEventListener( 'input', () => field.value = field.value.replace( new RegExp( '[^\\s' + settings.allows + ']', 'gi' ), '' ) );
	if ( settings.maxLength ) field.maxLength = settings.maxLength;
	if ( settings.transform ) field.style[ 'text-transform' ] = settings.transform;

};

export const createVector2Input = ( node, element ) => {

	const onUpdate = () => {

		node.value.x = fieldX.getValue();
		node.value.y = fieldY.getValue();

		element.dispatchEvent( new Event( 'changeInput' ) );

	};

	const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
	const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );

	element.add( fieldX ).add( fieldY );

};

export const createVector3Input = ( node, element ) => {

	const onUpdate = () => {

		node.value.x = fieldX.getValue();
		node.value.y = fieldY.getValue();
		node.value.z = fieldZ.getValue();

		element.dispatchEvent( new Event( 'changeInput' ) );

	};

	const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
	const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );
	const fieldZ = new NumberInput().setTagColor( 'blue' ).onChange( onUpdate );

	element.add( fieldX ).add( fieldY ).add( fieldZ );

};

export const createVector4Input = ( node, element ) => {

	const onUpdate = () => {

		node.value.x = fieldX.getValue();
		node.value.y = fieldY.getValue();
		node.value.z = fieldZ.getValue();
		node.value.w = fieldZ.getValue();

		element.dispatchEvent( new Event( 'changeInput' ) );

	};

	const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
	const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );
	const fieldZ = new NumberInput().setTagColor( 'blue' ).onChange( onUpdate );
	const fieldW = new NumberInput( 1 ).setTagColor( 'white' ).onChange( onUpdate );

	element.add( fieldX ).add( fieldY ).add( fieldZ ).add( fieldW );

};


export const createInputLib = {
	// gpu
	string: createStringInput,
	float: createFloatInput,
	vec2: createVector2Input,
	vec3: createVector3Input,
	vec4: createVector4Input,
	color: createColorInput,
	// cpu
	Number: createFloatInput,
	String: createStringInput,
	Vector2: createVector2Input,
	Vector3: createVector3Input,
	Vector4: createVector4Input,
	Color: createColorInput
};

export const inputNodeLib = {
	// gpu
	string,
	float,
	vec2,
	vec3,
	vec4,
	color,
	// cpu
	Number: float,
	String: string,
	Vector2: vec2,
	Vector3: vec3,
	Vector4: vec4,
	Color: color
};

export function createElementFromJSON( json ) {

	const { inputType, outputType, nullable } = json;

	const id = json.id || json.name;
	const element = json.name ? new LabelElement( json.name ) : new Element();
	const field = nullable !== true && json.field !== false;

	//

	let inputNode = null;

	if ( nullable !== true && inputNodeLib[ inputType ] !== undefined ) {

		inputNode = inputNodeLib[ inputType ]();

	}

	element.value = inputNode;

	//

	if ( json.height ) element.setHeight( json.height );

	if ( inputType ) {

		if ( field && createInputLib[ inputType ] ) {

			createInputLib[ inputType ]( inputNode, element, json );

		}

		element.onConnect( () => {

			const externalNode = element.getLinkedObject();

			element.setEnabledInputs( externalNode === null );

			element.value = externalNode || inputNode;

		} );

	}

	//

	if ( inputType && json.inputConnection !== false ) {

		element.setInputColor( getColorFromType( inputType ) );
		//element.setInputStyle( 'dotted' ); // 'border-style: dotted;'
		element.setInput( 1 );

		element.onValid( onValidType( inputType ) );

	}

	if ( outputType ) {

		element.setInputColor( getColorFromType( outputType ) );
		//element.setInputStyle( 'dotted' ); // 'border-style: dotted;'
		element.setOutput( 1 );

	}

	return { id, element, inputNode, inputType, outputType };

}

export function isGPUNode( object ) {

	return object && object.isNode === true && object.isCodeNode !== true && object.nodeType !== 'string' && object.nodeType !== 'ArrayBuffer';

}

export function isValidTypeToType( sourceType, targetType ) {

	if ( sourceType === targetType ) return true;

	return false;

}

export const onValidNode = onValidType();

export function onValidType( types = 'node', node = null ) {

	return ( source, target, stage ) => {

		const targetObject = target.getObject();

		if ( targetObject ) {

			for ( const type of types.split( '|' ) ) {

				let object = targetObject;

				if ( object.isScriptableValueNode ) {

					if ( object.outputType ) {

						if ( isValidTypeToType( object.outputType, type ) ) {

							return true;

						}

					}

					object = object.value;

				}

				if ( object === null || object === undefined ) continue;

				let isValid = false;

				if ( type === 'any' ) {

					isValid = true;

				} else if ( type === 'node' ) {

					isValid = isGPUNode( object );

				} else if ( type === 'string' || type === 'String' ) {

					isValid = object.nodeType === 'string';

				} else if ( type === 'Number' ) {

					isValid = object.isInputNode && typeof object.value === 'number';

				} else if ( type === 'URL' ) {

					isValid = object.nodeType === 'string' || object.nodeType === 'ArrayBuffer';

				} else if ( object[ 'is' + type ] === true ) {

					isValid = true;

				}

				if ( isValid ) return true;

			}

			if ( node !== null && stage === 'dragged' ) {

				const name = target.node.getName();

				node.editor.tips.error( `"${name}" is not a "${types}".` );

			}

			return false;

		}

	};

}
