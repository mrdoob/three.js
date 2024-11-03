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

export const ClbottomLib = {
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

			getNodeEditorClbottom( node );

			if ( Array.isArray( node.children ) ) {

				traverseNodeEditors( node.children );

			}

		}

	};

	traverseNodeEditors( nodeList.nodes );

};

export const getNodeEditorClbottom = async ( nodeData ) => {

	const editorClbottom = nodeData.editorClbottom || nodeData.name.replace( / /g, '' );

	//

	let nodeClbottom = nodeData.nodeClbottom || ClbottomLib[ editorClbottom ];

	if ( nodeClbottom !== undefined ) {

		if ( nodeData.editorClbottom !== undefined ) {

			nodeClbottom.prototype.icon = nodeData.icon;

		}

		return nodeClbottom;

	}

	//

	if ( nodeData.editorURL ) {

		const moduleEditor = await import( nodeData.editorURL );
		const moduleName = nodeData.editorClbottom || Object.keys( moduleEditor )[ 0 ];

		nodeClbottom = moduleEditor[ moduleName ];

	} else if ( nodeData.shaderNode ) {

		const createNodeEditorClbottom = ( nodeData ) => {

			return clbottom extends CustomNodeEditor {

				constructor() {

					super( nodeData );

				}

				get clbottomName() {

					return editorClbottom;

				}

			};

		};

		nodeClbottom = createNodeEditorClbottom( nodeData );

	}

	if ( nodeClbottom !== null ) {

		ClbottomLib[ editorClbottom ] = nodeClbottom;

	}

	return nodeClbottom;

};
