import { Canvas, CircleMenu, ButtonInput, ContextMenu, Loader } from '../libs/flow.module.js';
import { StandardMaterialEditor } from './materials/StandardMaterialEditor.js';
import { OperatorEditor } from './math/OperatorEditor.js';
import { NormalizeEditor } from './math/NormalizeEditor.js';
import { InvertEditor } from './math/InvertEditor.js';
import { LimiterEditor } from './math/LimiterEditor.js';
import { DotEditor } from './math/DotEditor.js';
import { PowerEditor } from './math/PowerEditor.js';
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
import { CheckerEditor } from './procedural/CheckerEditor.js';

import { EventDispatcher } from '../../../build/three.module.js';

export const ClassLib = {
	StandardMaterialEditor,
	OperatorEditor,
	NormalizeEditor,
	InvertEditor,
	LimiterEditor,
	DotEditor,
	PowerEditor,
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
	CheckerEditor
};

export class NodeEditor extends EventDispatcher {

	constructor() {

		super();

		const domElement = document.createElement( 'flow' );
		const canvas = new Canvas();

		domElement.appendChild( canvas.dom );

		this.canvas = canvas;
		this.domElement = domElement;

		this.nodesContext = null;
		this.examplesContext = null;

		this._initMenu();
		this._initNodesContext();
		this._initExamplesContext();

	}

	add( node ) {

		this.canvas.add( node );

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

		this.dispatchEvent( { type: 'load' } );

	}

	_initMenu() {

		const menu = new CircleMenu();

		const menuButton = new ButtonInput().setIcon( 'ti ti-menu-2' );
		const examplesButton = new ButtonInput().setIcon( 'ti ti-file-symlink' ).setToolTip( 'Examples' );
		const newButton = new ButtonInput().setIcon( 'ti ti-file' ).setToolTip( 'New' );
		const openButton = new ButtonInput().setIcon( 'ti ti-upload' ).setToolTip( 'Open' );
		const saveButton = new ButtonInput().setIcon( 'ti ti-download' ).setToolTip( 'Save' );

		const hideContext = () => {

			this.examplesContext.hide();
			this.nodesContext.hide();

		};

		menuButton.onClick( () => {

			this.nodesContext.show( 60, 50 );

		} );

		examplesButton.onClick( () => {

			this.examplesContext.show( 60, 175 );

		} );

		newButton.onClick( () => {

			hideContext();

			this.newProject();

		} );

		openButton.onClick( () => {

			hideContext();

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

			hideContext();

			const json = JSON.stringify( this.canvas.toJSON() );

			const a = document.createElement( 'a' );
			const file = new Blob( [ json ], { type: 'text/plain' } );

			a.href = URL.createObjectURL( file );
			a.download = 'node_editor.json';
			a.click();

		} );

		menu.add( menuButton )
			.add( newButton )
			.add( examplesButton )
			.add( openButton )
			.add( saveButton );

		this.domElement.appendChild( menu.dom );

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

		this.domElement.appendChild( context.dom );

		this.examplesContext = context;

	}

	_initNodesContext() {

		const context = new ContextMenu( this.domElement );

		let isContext = false;
		const contextPosition = {};

		const add = ( node ) => {

			const canvas = this.canvas;
			const canvasRect = canvas.rect;

			if ( isContext ) {

				node.setPosition(
					contextPosition.x,
					contextPosition.y
				);

			} else {

				const defaultOffsetX = 350 / 2;
				const defaultOffsetY = 20;

				node.setPosition(
					( canvas.relativeX + ( canvasRect.width / 2 ) ) - defaultOffsetX,
					( canvas.relativeY + ( canvasRect.height / 2 ) ) - defaultOffsetY
				);

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

		const inputsContext = new ContextMenu();

		const sliderInput = new ButtonInput( 'Slider' ).setIcon( 'ti ti-adjustments-horizontal' )
			.onClick( () => add( new SliderEditor() ) );

		const floatInput = new ButtonInput( 'Float' ).setIcon( 'ti ti-box-multiple-1' )
			.onClick( () => add( new FloatEditor() ) );

		const vector2Input = new ButtonInput( 'Vector 2' ).setIcon( 'ti ti-box-multiple-2' )
			.onClick( () => add( new Vector2Editor() ) );

		const vector3Input = new ButtonInput( 'Vector 3' ).setIcon( 'ti ti-box-multiple-3' )
			.onClick( () => add( new Vector3Editor() ) );

		const vector4Input = new ButtonInput( 'Vector 4' ).setIcon( 'ti ti-box-multiple-4' )
			.onClick( () => add( new Vector4Editor() ) );

		const colorInput = new ButtonInput( 'Color' ).setIcon( 'ti ti-palette' )
			.onClick( () => add( new ColorEditor() ) );

		//const mapInput = new ButtonInput( 'Map' ).setIcon( 'ti ti-photo' );
		//const cubeMapInput = new ButtonInput( 'Cube Map' ).setIcon( 'ti ti-box' );
		//const integerInput = new ButtonInput( 'Integer' ).setIcon( 'ti ti-list-numbers' );

		inputsContext
			.add( sliderInput )
			.add( floatInput )
			.add( vector2Input )
			.add( vector3Input )
			.add( vector4Input )
			.add( colorInput );

		//**************//
		// MATH
		//**************//

		const mathContext = new ContextMenu();

		const operatorsNode = new ButtonInput( 'Operator' ).setIcon( 'ti ti-math-symbols' )
			.onClick( () => add( new OperatorEditor() ) );

		const normalizeNode = new ButtonInput( 'Normalize' ).setIcon( 'ti ti-fold' )
			.onClick( () => add( new NormalizeEditor() ) );

		const invertNode = new ButtonInput( 'Invert' ).setToolTip( 'Negate' ).setIcon( 'ti ti-flip-vertical' )
			.onClick( () => add( new InvertEditor() ) );

		const limiterNode = new ButtonInput( 'Limiter' ).setToolTip( 'Min / Max' ).setIcon( 'ti ti-arrow-bar-to-up' )
			.onClick( () => add( new LimiterEditor() ) );

		const dotNode = new ButtonInput( 'Dot Product' ).setIcon( 'ti ti-arrows-up-left' )
			.onClick( () => add( new DotEditor() ) );

		const powNode = new ButtonInput( 'Power' ).setIcon( 'ti ti-arrow-up-right' )
			.onClick( () => add( new PowerEditor() ) );

		const triNode = new ButtonInput( 'Trigonometry' ).setToolTip( 'Sin / Cos / Tan' ).setIcon( 'ti ti-wave-sine' )
			.onClick( () => add( new TrigonometryEditor() ) );

		mathContext
			.add( operatorsNode )
			.add( invertNode )
			.add( limiterNode )
			.add( dotNode )
			.add( powNode )
			.add( triNode )
			.add( normalizeNode );

		//**************//
		// ACCESSORS
		//**************//

		const accessorsContext = new ContextMenu();

		const uvNode = new ButtonInput( 'UV' ).setIcon( 'ti ti-details' )
			.onClick( () => add( new UVEditor() ) );

		const positionNode = new ButtonInput( 'Position' ).setIcon( 'ti ti-hierarchy' )
			.onClick( () => add( new PositionEditor() ) );

		const normalNode = new ButtonInput( 'Normal' ).setIcon( 'ti ti-fold-up' )
			.onClick( () => add( new NormalEditor() ) );

		accessorsContext
			.add( uvNode )
			.add( positionNode )
			.add( normalNode );

		//**************//
		// PROCEDURAL
		//**************//

		const proceduralContext = new ContextMenu();

		const checkerNode = new ButtonInput( 'Checker' ).setIcon( 'ti ti-border-outer' )
			.onClick( () => add( new CheckerEditor() ) );

		proceduralContext
			.add( checkerNode );

		//**************//
		// DISPLAY
		//**************//

		const displayContext = new ContextMenu();

		const blendNode = new ButtonInput( 'Blend' ).setIcon( 'ti ti-layers-subtract' )
			.onClick( () => add( new BlendEditor() ) );

		displayContext
			.add( blendNode );

		//**************//
		// UTILS
		//**************//

		const utilsContext = new ContextMenu();

		const timerNode = new ButtonInput( 'Timer' ).setIcon( 'ti ti-clock' )
			.onClick( () => add( new TimerEditor() ) );

		const oscNode = new ButtonInput( 'Oscillator' ).setIcon( 'ti ti-wave-sine' )
			.onClick( () => add( new OscillatorEditor() ) );

		utilsContext
			.add( timerNode )
			.add( oscNode );

		//**************//
		// MAIN
		//**************//

		context.add( new ButtonInput( 'Inputs' ).setIcon( 'ti ti-forms' ), inputsContext );
		context.add( new ButtonInput( 'Accessors' ).setIcon( 'ti ti-vector-triangle' ), accessorsContext );
		context.add( new ButtonInput( 'Display' ).setIcon( 'ti ti-brightness' ), displayContext );
		context.add( new ButtonInput( 'Math' ).setIcon( 'ti ti-calculator' ), mathContext );
		context.add( new ButtonInput( 'Procedural' ).setIcon( 'ti ti-infinity' ), proceduralContext );
		context.add( new ButtonInput( 'Utils' ).setIcon( 'ti ti-apps' ), utilsContext );

		this.nodesContext = context;

	}

}
