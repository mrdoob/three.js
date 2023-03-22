import { StringInput, NumberInput, Element, LabelElement } from 'flow';
import { float, string } from 'three/nodes';

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

export const createFloatInput = ( node, element ) => {

	const input = new NumberInput().onChange( () => {

		node.value = input.getValue();

		element.dispatchEvent( new Event( 'changeInput' ) );

	} );

	element.add( input );

};

export const createStringInput = ( node, element, settings = {} ) => {

	const input = new StringInput().onChange( () => {

		node.value = input.getValue();

		element.dispatchEvent( new Event( 'changeInput' ) );

	} );

	element.add( input );

	if ( settings.options ) {

		for ( const option of settings.options ) {

			input.addOption( option );

		}

	}

};

export const createInputLib = {
	// gpu
	string: createStringInput,
	float: createFloatInput,
	// cpu
	Number: createFloatInput,
	String: createStringInput
};

export const inputNodeLib = {
	// gpu
	node: float,
	float,
	string,
	// cpu
	Number: float,
	String: string
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

	if ( inputType ) {

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

/*
export function onValidNode( source, target ) {

	const object = target.getObject();

	if ( ! object || ! object.isNode || object.isCodeNode ) {

		return false;

	}

}
*/

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

				} else {

					//console.log( object );

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

				node.editor.tips.error( `"${name}" is not a "${type}".` );

			}

			return false;

		}

	};

}

