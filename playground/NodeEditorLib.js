import { NodePrototypeEditor } from './editors/NodePrototypeEditor.js';
import { ScriptableEditor } from './editors/ScriptableEditor.js';
import { BasicMaterialEditor } from './editors/BasicMaterialEditor.js';
import { StandardMaterialEditor } from './editors/StandardMaterialEditor.js';
import { PointsMaterialEditor } from './editors/PointsMaterialEditor.js';
import { FloatEditor } from './editors/FloatEditor.js';
import { Vector2Editor } from './editors/Vector2Editor.js';
import { Vector3Editor } from './editors/Vector3Editor.js';
import { Vector4Editor } from './editors/Vector4Editor.js';
import { SliderEditor } from './editors/SliderEditor.js';
import { ColorEditor } from './editors/ColorEditor.js';
import { TextureEditor } from './editors/TextureEditor.js';
import { UVEditor } from './editors/UVEditor.js';
import { PreviewEditor } from './editors/PreviewEditor.js';
import { TimerEditor } from './editors/TimerEditor.js';
import { SplitEditor } from './editors/SplitEditor.js';
import { SwizzleEditor } from './editors/SwizzleEditor.js';
import { JoinEditor } from './editors/JoinEditor.js';
import { StringEditor } from './editors/StringEditor.js';
import { FileEditor } from './editors/FileEditor.js';
import { CustomNodeEditor } from './editors/CustomNodeEditor.js';

export const ClassLib = {
	BasicMaterialEditor,
	StandardMaterialEditor,
	PointsMaterialEditor,
	FloatEditor,
	Vector2Editor,
	Vector3Editor,
	Vector4Editor,
	SliderEditor,
	ColorEditor,
	TextureEditor,
	UVEditor,
	TimerEditor,
	SplitEditor,
	SwizzleEditor,
	JoinEditor,
	StringEditor,
	FileEditor,
	ScriptableEditor,
	PreviewEditor,
	NodePrototypeEditor
};

let nodeList = null;
let nodeListLoading = false;

export const getNodeList = async () => {

	if ( nodeList === null ) {

		if ( nodeListLoading === false ) {

			nodeListLoading = true;

			const response = await fetch( './Nodes.json' );
			nodeList = await response.json();

		} else {

			await new Promise( res => {

				const verifyNodeList = () => {

					if ( nodeList !== null ) {

						res();

					} else {

						window.requestAnimationFrame( verifyNodeList );

					}

				};

				verifyNodeList();

			} );

		}

	}

	return nodeList;

};

export const init = async () => {

	const nodeList = await getNodeList();

	const traverseNodeEditors = ( list ) => {

		for ( const node of list ) {

			getNodeEditorClass( node );

			if ( Array.isArray( node.children ) ) {

				traverseNodeEditors( node.children );

			}

		}

	};

	traverseNodeEditors( nodeList.nodes );

};

export const getNodeEditorClass = async ( nodeData ) => {

	const editorClass = nodeData.editorClass || nodeData.name.replace( / /g, '' );

	//

	let nodeClass = nodeData.nodeClass || ClassLib[ editorClass ];

	if ( nodeClass !== undefined ) {

		if ( nodeData.editorClass !== undefined ) {

			nodeClass.prototype.icon = nodeData.icon;

		}

		return nodeClass;

	}

	//

	if ( nodeData.editorURL ) {

		const moduleEditor = await import( nodeData.editorURL );
		const moduleName = nodeData.editorClass || Object.keys( moduleEditor )[ 0 ];

		nodeClass = moduleEditor[ moduleName ];

	} else if ( nodeData.shaderNode ) {

		const createNodeEditorClass = ( nodeData ) => {

			return class extends CustomNodeEditor {

				constructor() {

					super( nodeData );

				}

				get className() {

					return editorClass;

				}

			};

		};

		nodeClass = createNodeEditorClass( nodeData );

	}

	if ( nodeClass !== null ) {

		ClassLib[ editorClass ] = nodeClass;

	}

	return nodeClass;

};
