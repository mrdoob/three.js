import { NodePrototypeEditor } from './nodes/NodePrototypeEditor.js';
import { ScriptableEditor } from './nodes/ScriptableEditor.js';
import { BasicMaterialEditor } from './nodes/BasicMaterialEditor.js';
import { StandardMaterialEditor } from './nodes/StandardMaterialEditor.js';
import { PointsMaterialEditor } from './nodes/PointsMaterialEditor.js';
import { FloatEditor } from './nodes/FloatEditor.js';
import { Vector2Editor } from './nodes/Vector2Editor.js';
import { Vector3Editor } from './nodes/Vector3Editor.js';
import { Vector4Editor } from './nodes/Vector4Editor.js';
import { SliderEditor } from './nodes/SliderEditor.js';
import { ColorEditor } from './nodes/ColorEditor.js';
import { TextureEditor } from './nodes/TextureEditor.js';
import { UVEditor } from './nodes/UVEditor.js';
import { PreviewEditor } from './nodes/PreviewEditor.js';
import { TimerEditor } from './nodes/TimerEditor.js';
import { SplitEditor } from './nodes/SplitEditor.js';
import { JoinEditor } from './nodes/JoinEditor.js';
import { StringEditor } from './nodes/StringEditor.js';
import { FileEditor } from './nodes/FileEditor.js';
import { CustomNodeEditor } from './nodes/CustomNodeEditor.js';

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
	JoinEditor,
	StringEditor,
	FileEditor,
	ScriptableEditor,
	PreviewEditor,
	NodePrototypeEditor
};

let nodeList = null;

export const getNodeList = async () => {

	if ( nodeList === null ) {

		const response = await fetch( './jsm/node-editor/Nodes.json' );
		nodeList = await response.json();

	}

	return nodeList;

}

export const init = async () => {

	const nodeList = await getNodeList();

	const traverseNodeEditors = ( list ) => {

		for( const node of list ) {

			getNodeEditorClass( node );

			if ( Array.isArray( node.children ) ) {

				traverseNodeEditors( node.children );
	
			}

		}

	};

	traverseNodeEditors( nodeList.nodes );

}

export const getNodeEditorClass = async ( nodeData ) => {

	const editorClass = nodeData.editorClass || nodeData.name.replace( / /g, '' );

	if ( ClassLib[ editorClass ] !== undefined ) return ClassLib[ editorClass ];

	//

	let nodeClass = null;

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

	if ( nodeClass !== null) {

		ClassLib[ editorClass ] = nodeClass;

	}

	return nodeClass;

};
