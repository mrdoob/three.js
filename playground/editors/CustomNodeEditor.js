import { LabelElement } from 'flow';
import { Color, Vector2, Vector3, Vector4 } from 'three';
import * as Nodes from 'three/nodes';
import { uniform } from 'three/nodes';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { createInputLib } from '../NodeEditorUtils.js';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

const typeToValue = {
	'color': Color,
	'vec2': Vector2,
	'vec3': Vector3,
	'vec4': Vector4
};

const createElementFromProperty = ( node, property ) => {

	const nodeType = property.nodeType;
	const defaultValue = uniform( typeToValue[ nodeType ] ? new typeToValue[ nodeType ]() : 0 );

	let label = property.label;

	if ( label === undefined ) {

		label = property.name;

		if ( label.endsWith( 'Node' ) === true ) {

			label = label.slice( 0, label.length - 4 );

		}

	}

	node[ property.name ] = defaultValue;

	const element = setInputAestheticsFromType( new LabelElement( label ), nodeType );

	if ( createInputLib[ nodeType ] !== undefined ) {

		createInputLib[ nodeType ]( defaultValue, element );

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

		node.nodeType = node.nodeType || settings.nodeType;

		super( settings.name, node, 300 );

		this.title.setIcon( 'ti ti-' + settings.icon );

		for ( const element of elements ) {

			this.add( element );

		}

	}

}
