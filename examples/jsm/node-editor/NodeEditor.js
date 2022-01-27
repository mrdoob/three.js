import { Styles, Canvas, CircleMenu, ButtonInput, ContextMenu, Tips, Search, Loader } from '../libs/flow.module.js';
import { BasicMaterialEditor } from './materials/BasicMaterialEditor.js';
import { StandardMaterialEditor } from './materials/StandardMaterialEditor.js';
import { PointsMaterialEditor } from './materials/PointsMaterialEditor.js';
import { OperatorEditor } from './math/OperatorEditor.js';
import { NormalizeEditor } from './math/NormalizeEditor.js';
import { InvertEditor } from './math/InvertEditor.js';
import { LimiterEditor } from './math/LimiterEditor.js';
import { DotEditor } from './math/DotEditor.js';
import { PowerEditor } from './math/PowerEditor.js';
import { AngleEditor } from './math/AngleEditor.js';
import { TrigonometryEditor } from './math/TrigonometryEditor.js';
import { FloatEditor } from './inputs/FloatEditor.js';
import { Vector2Editor } from './inputs/Vector2Editor.js';
import { Vector3Editor } from './inputs/Vector3Editor.js';
import { Vector4Editor } from './inputs/Vector4Editor.js';
import { SliderEditor } from './inputs/SliderEditor.js';
import { ColorEditor } from './inputs/ColorEditor.js';
import { BlendEditor } from './display/BlendEditor.js';
import { UVEditor } from './accessors/UVEditor.js';
import { PositionEditor } from './accessors/PositionEditor.js';
import { NormalEditor } from './accessors/NormalEditor.js';
import { TimerEditor } from './utils/TimerEditor.js';
import { OscillatorEditor } from './utils/OscillatorEditor.js';
import { SplitEditor } from './utils/SplitEditor.js';
import { JoinEditor } from './utils/JoinEditor.js';
import { CheckerEditor } from './procedural/CheckerEditor.js';
import { PointsEditor } from './scene/PointsEditor.js';
import { MeshEditor } from './scene/MeshEditor.js';
import { EventDispatcher } from 'three';

Styles.icons.unlink = 'ti ti-unlink';

export const NodeList = [
	{
		name: 'Inputs',
		icon: 'forms',
		children: [
			{
				name: 'Slider',
				icon: 'adjustments-horizontal',
				nodeClass: SliderEditor
			},
			{
				name: 'Float',
				icon: 'box-multiple-1',
				nodeClass: FloatEditor
			},
			{
				name: 'Vector 2',
				icon: 'box-multiple-2',
				nodeClass: Vector2Editor
			},
			{
				name: 'Vector 3',
				icon: 'box-multiple-3',
				nodeClass: Vector3Editor
			},
			{
				name: 'Vector 4',
				icon: 'box-multiple-4',
				nodeClass: Vector4Editor
			},
			{
				name: 'Color',
				icon: 'palette',
				nodeClass: ColorEditor
			}
		]
	},
	{
		name: 'Accessors',
		icon: 'vector-triangle',
		children: [
			{
				name: 'UV',
				icon: 'details',
				nodeClass: UVEditor
			},
			{
				name: 'Position',
				icon: 'hierarchy',
				nodeClass: PositionEditor
			},
			{
				name: 'Normal',
				icon: 'fold-up',
				nodeClass: NormalEditor
			}
		]
	},
	{
		name: 'Display',
		icon: 'brightness',
		children: [
			{
				name: 'Blend',
				icon: 'layers-subtract',
				nodeClass: BlendEditor
			}
		]
	},
	{
		name: 'Math',
		icon: 'calculator',
		children: [
			{
				name: 'Operator',
				icon: 'math-symbols',
				nodeClass: OperatorEditor
			},
			{
				name: 'Invert',
				icon: 'flip-vertical',
				tip: 'Negate',
				nodeClass: OperatorEditor
			},
			{
				name: 'Limiter',
				icon: 'arrow-bar-to-up',
				tip: 'Min / Max',
				nodeClass: LimiterEditor
			},
			{
				name: 'Dot Product',
				icon: 'arrows-up-left',
				nodeClass: DotEditor
			},
			{
				name: 'Power',
				icon: 'arrow-up-right',
				nodeClass: PowerEditor
			},
			{
				name: 'Trigonometry',
				icon: 'wave-sine',
				tip: 'Sin / Cos / Tan / ...',
				nodeClass: TrigonometryEditor
			},
			{
				name: 'Angle',
				icon: 'angle',
				tip: 'Degress / Radians',
				nodeClass: AngleEditor
			},
			{
				name: 'Normalize',
				icon: 'fold',
				nodeClass: NormalizeEditor
			}
		]
	},
	{
		name: 'Procedural',
		icon: 'infinity',
		children: [
			{
				name: 'Checker',
				icon: 'border-outer',
				nodeClass: CheckerEditor
			}
		]
	},
	{
		name: 'Utils',
		icon: 'apps',
		children: [
			{
				name: 'Timer',
				icon: 'clock',
				nodeClass: TimerEditor
			},
			{
				name: 'Oscillator',
				icon: 'wave-sine',
				nodeClass: OscillatorEditor
			},
			{
				name: 'Split',
				icon: 'arrows-split-2',
				nodeClass: SplitEditor
			},
			{
				name: 'Join',
				icon: 'arrows-join-2',
				nodeClass: JoinEditor
			}
		]
	},
	/*{
		name: 'Scene',
		icon: '3d-cube-sphere',
		children: [
			{
				name: 'Mesh',
				icon: '3d-cube-sphere',
				nodeClass: MeshEditor
			}
		]
	},*/
	{
		name: 'Material',
		icon: 'circles',
		children: [
			{
				name: 'Basic Material',
				icon: 'circle',
				nodeClass: BasicMaterialEditor
			},
			{
				name: 'Standard Material',
				icon: 'circle',
				nodeClass: StandardMaterialEditor
			},
			{
				name: 'Points Material',
				icon: 'circle-dotted',
				nodeClass: PointsMaterialEditor
			}
		]
	}
];

export const ClassLib = {
	BasicMaterialEditor,
	StandardMaterialEditor,
	PointsMaterialEditor,
	PointsEditor,
	MeshEditor,
	OperatorEditor,
	NormalizeEditor,
	InvertEditor,
	LimiterEditor,
	DotEditor,
	PowerEditor,
	AngleEditor,
	TrigonometryEditor,
	FloatEditor,
	Vector2Editor,
	Vector3Editor,
	Vector4Editor,
	SliderEditor,
	ColorEditor,
	BlendEditor,
	UVEditor,
	PositionEditor,
	NormalEditor,
	TimerEditor,
	OscillatorEditor,
	SplitEditor,
	JoinEditor,
	CheckerEditor
};

export class NodeEditor extends EventDispatcher {

	constructor( scene = null ) {

		super();

		const domElement = document.createElement( 'flow' );
		const canvas = new Canvas();

		domElement.append( canvas.dom );

		this.scene = scene;

		this.canvas = canvas;
		this.domElement = domElement;

		this.nodesContext = null;
		this.examplesContext = null;

		this._initTips();
		this._initMenu();
		this._initSearch();
		this._initNodesContext();
		this._initExamplesContext();

	}

	centralizeNode( node ) {

		const canvas = this.canvas;
		const canvasRect = canvas.rect;

		const nodeRect = node.dom.getBoundingClientRect();

		const defaultOffsetX = nodeRect.width;
		const defaultOffsetY = nodeRect.height;

		node.setPosition(
			( canvas.relativeX + ( canvasRect.width / 2 ) ) - defaultOffsetX,
			( canvas.relativeY + ( canvasRect.height / 2 ) ) - defaultOffsetY
		);

	}

	add( node ) {

		const onRemove = () => {

			node.removeEventListener( 'remove', onRemove );

			node.setEditor( null );

		};

		node.setEditor( this );
		node.addEventListener( 'remove', onRemove );

		this.canvas.add( node );

		this.dispatchEvent( { type: 'add', node } );

		return this;

	}

	get nodes() {

		return this.canvas.nodes;

	}

	newProject() {

		this.canvas.clear();

		this.dispatchEvent( { type: 'new' } );

	}

	loadJSON( json ) {

		this.canvas.clear();

		this.canvas.deserialize( json );

		for ( const node of this.canvas.nodes ) {

			this.add( node );

		}

		this.dispatchEvent( { type: 'load' } );

	}

	_initTips() {

		this.tips = new Tips();

		this.domElement.append( this.tips.dom );

	}

	_initMenu() {

		const menu = new CircleMenu();

		const menuButton = new ButtonInput().setIcon( 'ti ti-apps' ).setToolTip( 'Add' );
		const examplesButton = new ButtonInput().setIcon( 'ti ti-file-symlink' ).setToolTip( 'Examples' );
		const newButton = new ButtonInput().setIcon( 'ti ti-file' ).setToolTip( 'New' );
		const openButton = new ButtonInput().setIcon( 'ti ti-upload' ).setToolTip( 'Open' );
		const saveButton = new ButtonInput().setIcon( 'ti ti-download' ).setToolTip( 'Save' );

		menuButton.onClick( () => this.nodesContext.open() );
		examplesButton.onClick( () => this.examplesContext.open() );

		newButton.onClick( () => {

			if ( confirm( 'Are you sure?' ) === true ) {

				this.newProject();

			}

		} );

		openButton.onClick( () => {

			const input = document.createElement( 'input' );
			input.type = 'file';

			input.onchange = e => {

				const file = e.target.files[ 0 ];

				const reader = new FileReader();
				reader.readAsText( file, 'UTF-8' );

				reader.onload = readerEvent => {

					const loader = new Loader( Loader.OBJECTS );
					const json = loader.parse( JSON.parse( readerEvent.target.result ), ClassLib );

					this.loadJSON( json );

				};

			};

			input.click();

		} );

		saveButton.onClick( () => {

			const json = JSON.stringify( this.canvas.toJSON() );

			const a = document.createElement( 'a' );
			const file = new Blob( [ json ], { type: 'text/plain' } );

			a.href = URL.createObjectURL( file );
			a.download = 'node_editor.json';
			a.click();

		} );

		menu.add( examplesButton )
			.add( menuButton )
			.add( newButton )
			.add( openButton )
			.add( saveButton );

		this.domElement.append( menu.dom );

		this.menu = menu;

	}

	_initExamplesContext() {

		const context = new ContextMenu();

		//**************//
		// MAIN
		//**************//

		const onClickExample = async ( button ) => {

			this.examplesContext.hide();

			const filename = button.getExtra();

			const loader = new Loader( Loader.OBJECTS );
			const json = await loader.load( `./jsm/node-editor/examples/${filename}.json`, ClassLib );

			this.loadJSON( json );

		};

		const addExample = ( context, name, filename = null ) => {

			filename = filename || name.replaceAll( ' ', '-' ).toLowerCase();

			context.add( new ButtonInput( name )
				.setIcon( 'ti ti-file-symlink' )
				.onClick( onClickExample )
				.setExtra( filename )
			);

		};

		//**************//
		// EXAMPLES
		//**************//

		const basicContext = new ContextMenu();
		const advancedContext = new ContextMenu();

		addExample( basicContext, 'Animate UV' );
		addExample( basicContext, 'Fake top light' );
		addExample( basicContext, 'Oscillator color' );

		addExample( advancedContext, 'Rim' );

		//**************//
		// MAIN
		//**************//

		context.add( new ButtonInput( 'Basic' ), basicContext );
		context.add( new ButtonInput( 'Advanced' ), advancedContext );

		this.examplesContext = context;

	}

	_initSearch() {

		const traverseNodeEditors = ( item ) => {

			if ( item.nodeClass ) {

				const button = new ButtonInput( item.name );
				button.setIcon( `ti ti-${item.icon}` );
				button.addEventListener( 'complete', () => {

					const node = new item.nodeClass();

					this.add( node );

					this.centralizeNode( node );

				} );

				search.add( button );

			}

			if ( item.children ) {

				for ( const subItem of item.children ) {

					traverseNodeEditors( subItem );

				}

			}

		};

		const search = new Search();
		search.forceAutoComplete = true;

		search.onFilter( () => {

			search.clear();

			for ( const item of NodeList ) {

				traverseNodeEditors( item );

			}

			const object3d = this.scene;

			if ( object3d !== null ) {

				object3d.traverse( ( obj3d ) => {

					if ( obj3d.isMesh === true || obj3d.isPoints === true ) {

						let prefix = null;
						let icon = null;
						let editorClass = null;

						if ( obj3d.isMesh === true ) {

							prefix = 'Mesh';
							icon = 'ti ti-3d-cube-sphere';
							editorClass = MeshEditor;

						} else if ( obj3d.isPoints === true ) {

							prefix = 'Points';
							icon = 'ti ti-border-none';
							editorClass = PointsEditor;

						}

						const button = new ButtonInput( `${prefix} - ${obj3d.name}` );
						button.setIcon( icon );
						button.addEventListener( 'complete', () => {

							for ( const node of this.canvas.nodes ) {

								if ( node.value === obj3d ) {

									// prevent duplicated node

									this.canvas.select( node );

									return;

								}

							}

							const node = new editorClass( obj3d );

							this.add( node );

							this.centralizeNode( node );

						} );

						search.add( button );

					}

				} );

			}

		} );

		search.onSubmit( () => {

			if ( search.currentFiltered !== null ) {

				search.currentFiltered.button.dispatchEvent( new Event( 'complete' ) );

			}

		} );

		this.domElement.append( search.dom );

	}

	_initNodesContext() {

		const context = new ContextMenu( this.domElement );

		let isContext = false;
		const contextPosition = {};

		const add = ( node ) => {

			if ( isContext ) {

				node.setPosition(
					contextPosition.x,
					contextPosition.y
				);

			} else {

				this.centralizeNode( node );

			}

			context.hide();

			this.add( node );

			this.canvas.select( node );

			isContext = false;

		};

		context.onContext( () => {

			isContext = true;

			const { relativeClientX, relativeClientY } = this.canvas;

			contextPosition.x = relativeClientX;
			contextPosition.y = relativeClientY;

		} );

		//**************//
		// INPUTS
		//**************//

		const createButtonMenu = ( item ) => {

			const button = new ButtonInput( item.name );
			button.setIcon( `ti ti-${item.icon}` );

			let context = null;

			if ( item.nodeClass ) {

				button.onClick( () => add( new item.nodeClass() ) );

			}

			if ( item.tip ) {

				button.setToolTip( item.tip );

			}

			if ( item.children ) {

				context = new ContextMenu();

				for ( const subItem of item.children ) {

					const buttonMenu = createButtonMenu( subItem );

					context.add( buttonMenu.button, buttonMenu.context );

				}

			}

			return { button, context };

		};

		for ( const item of NodeList ) {

			const buttonMenu = createButtonMenu( item );

			context.add( buttonMenu.button, buttonMenu.context );

		}

		this.nodesContext = context;

	}

}
