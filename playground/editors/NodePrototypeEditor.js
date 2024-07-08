import { JavaScriptEditor } from './JavaScriptEditor.js';
import { ScriptableEditor } from './ScriptableEditor.js';
import { scriptable } from 'three/nodes';

const defaultCode = `// Addition Node Example
// Enjoy! :)

// layout must be the first variable.

layout = {
	name: "Custom Addition",
	outputType: 'node',
	icon: 'heart-plus',
	width: 200,
	elements: [
		{ name: 'A', inputType: 'node' },
		{ name: 'B', inputType: 'node' }
	]
};

// THREE and TSL (Three.js Shading Language) namespaces are available.
// main code must be in the output function.

const { add, float } = TSL;

function main() {

	const nodeA = parameters.get( 'A' ) || float();
	const nodeB = parameters.get( 'B' ) || float();

	return add( nodeA, nodeB );

}
`;

export class NodePrototypeEditor extends JavaScriptEditor {

	constructor( source = defaultCode ) {

		super( source );

		this.setName( 'Node Prototype' );

		this.nodeClass = new WeakMap();
		this.scriptableNode = scriptable( this.codeNode );

		this.instances = [];

		this.editorElement.addEventListener( 'change', () => {

			this.updatePrototypes();

		} );

		this._prototype = null;

		this.updatePrototypes();

	}

	serialize( data ) {

		super.serialize( data );

		data.source = this.source;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.source = data.source;

	}

	deserializeLib( data, lib ) {

		super.deserializeLib( data, lib );

		this.source = data.source;

		const nodePrototype = this.createPrototype();
		lib[ nodePrototype.name ] = nodePrototype.nodeClass;

	}

	setEditor( editor ) {

		if ( editor === null && this.editor ) {

			this.editor.removeClass( this._prototype );

		}

		super.setEditor( editor );

		if ( editor === null ) {

			for ( const proto of [ ...this.instances ] ) {

				proto.dispose();

			}

			this.instances = [];

		}

		this.updatePrototypes();

	}

	createPrototype() {

		if ( this._prototype !== null ) return this._prototype;

		const nodePrototype = this;
		const scriptableNode = this.scriptableNode;
		const editorElement = this.editorElement;

		const nodeClass = class extends ScriptableEditor {

			constructor() {

				super( scriptableNode.codeNode, false );

				this.serializePriority = - 1;

				this.onCode = this.onCode.bind( this );

			}

			onCode() {

				this.update();

			}

			setEditor( editor ) {

				super.setEditor( editor );

				const index = nodePrototype.instances.indexOf( this );

				if ( editor ) {

					if ( index === - 1 ) nodePrototype.instances.push( this );

					editorElement.addEventListener( 'change', this.onCode );

				} else {

					if ( index !== - 1 ) nodePrototype.instances.splice( index, 1 );

					editorElement.removeEventListener( 'change', this.onCode );

				}

			}

			get className() {

				return scriptableNode.getLayout().name;

			}

		};

		this._prototype = {
			get name() {

				return scriptableNode.getLayout().name;

			},
			get icon() {

				return scriptableNode.getLayout().icon;

			},
			nodeClass,
			reference: this,
			editor: this.editor
		};

		return this._prototype;

	}

	updatePrototypes() {

		if ( this._prototype !== null && this._prototype.editor !== null ) {

			this._prototype.editor.removeClass( this._prototype );

		}

		//

		const layout = this.scriptableNode.getLayout();

		if ( layout && layout.name ) {

			if ( this.editor ) {

				this.editor.addClass( this.createPrototype() );

			}

		}

	}

}
