import { LabelElement, NumberInput } from '../../libs/flow.module.js';
import { Vector3, Vector4 } from 'three';
import * as Nodes from 'three/nodes';
import { uniform } from 'three/nodes';
import { BaseNodeEditor } from '../BaseNodeEditor.js';

const createFloatInput = ( node, element ) => {

	element.add( new NumberInput().onChange( ( field ) => {

		node.value = field.getValue();

	} ) );

};

const createVector3Inputs = ( node, element ) => {

	const onUpdate = () => {

		node.value.x = fieldX.getValue();
		node.value.y = fieldY.getValue();
		node.value.z = fieldZ.getValue();

	};

	const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
	const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );
	const fieldZ = new NumberInput().setTagColor( 'blue' ).onChange( onUpdate );

	element.add( fieldX ).add( fieldY ).add( fieldZ );

};

const createVector4Inputs = ( node, element ) => {

	const onUpdate = () => {

		node.value.x = fieldX.getValue();
		node.value.y = fieldY.getValue();
		node.value.z = fieldZ.getValue();
		node.value.w = fieldW.getValue();

	};

	const fieldX = new NumberInput().setTagColor( 'red' ).onChange( onUpdate );
	const fieldY = new NumberInput().setTagColor( 'green' ).onChange( onUpdate );
	const fieldZ = new NumberInput().setTagColor( 'blue' ).onChange( onUpdate );
	const fieldW = new NumberInput().setTagColor( 'white' ).onChange( onUpdate );

	element.add( fieldX ).add( fieldY ).add( fieldZ ).add( fieldW );

};

const valueToInputs = {
	'vec3': createVector3Inputs,
	'vec4': createVector4Inputs,
	'float': createFloatInput
};

const typeToValue = {
	'vec3': Vector3,
	'vec4': Vector4
};

const createElementFromProperty = ( node, property ) => {

	const nodeType = property.nodeType;
	const defaultValue = uniform( typeToValue[ nodeType ] ? new typeToValue[ nodeType ] : 0 );

	let label = property.label;

	if ( label === undefined ) {

		label = property.name;

		if ( label.endsWith( 'Node' ) === true ) {

			label = label.slice( 0, label.length - 4 );

		}

	}

	node[ property.name ] = defaultValue;

	const element = new LabelElement( label ).setInput( property.defaultLength || 1 );

	if ( valueToInputs[ nodeType ] !== undefined ) {

		valueToInputs[ nodeType ]( defaultValue, element );

	}

	element.onConnect( ( elmt ) => {

		elmt.setEnabledInputs( ! elmt.getLinkedObject() );

		node[ property.name ] = elmt.getLinkedObject() || defaultValue;

	} );

	return element;

};

export class CustomNodeEditor extends BaseNodeEditor {

	constructor( settings ) {

		const shaderNode = Nodes[ settings.shaderNode ];

		let node = null;

		const elements = [];

		if ( settings.properties !== undefined ) {

			node = shaderNode();

			for ( const property of settings.properties ) {

				elements.push( createElementFromProperty( node, property ) );

			}

		} else {

			node = shaderNode;

		}

		super( settings.name, node, 300 );

		this.title.setIcon( 'ti ti-' + settings.icon );

		for ( const element of elements ) {

			this.add( element );

		}

	}

}
