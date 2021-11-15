import { Canvas, CircleMenu, ButtonInput, ContextMenu, Loader } from '../libs/flow.module.js';
import { StandardMaterialEditor } from './materials/StandardMaterialEditor.js';
import { OperatorEditor } from './math/OperatorEditor.js';
import { FloatEditor } from './inputs/FloatEditor.js';
import { ColorEditor } from './inputs/ColorEditor.js';
import { UVEditor } from './accessors/UVEditor.js';
import { PositionEditor } from './accessors/PositionEditor.js';
import { NormalEditor } from './accessors/NormalEditor.js';
import { CheckerEditor } from './procedural/CheckerEditor.js';
import { EventDispatcher } from 'three';

export const ClassLib = {
	'StandardMaterialEditor': StandardMaterialEditor,
	'OperatorEditor': OperatorEditor,
	'FloatEditor': FloatEditor,
	'ColorEditor': ColorEditor,
	'UVEditor': UVEditor,
	'PositionEditor': PositionEditor,
	'NormalEditor': NormalEditor,
	'CheckerEditor': CheckerEditor
};

export class NodeEditor extends EventDispatcher {

	constructor() {

		super();

		const domElement = document.createElement( 'flow' );
		const canvas = new Canvas();

		domElement.appendChild( canvas.dom );

		this.canvas = canvas;
		this.domElement = domElement;

		this._initMenu();
		this._initContextMenu();

	}

	add( node ) {

		this.canvas.add( node );

		return this;

	}

	get nodes() {

		return this.canvas.nodes;

	}

	_initMenu() {

		const menu = new CircleMenu();

		const menuButton = new ButtonInput().setIcon( 'ti ti-menu-2' );
		const newButton = new ButtonInput().setIcon( 'ti ti-file' ).setToolTip( 'New' );
		const openButton = new ButtonInput().setIcon( 'ti ti-upload' ).setToolTip( 'Open' );
		const saveButton = new ButtonInput().setIcon( 'ti ti-download' ).setToolTip( 'Save' );

		menuButton.onClick( () => {

			this.context.show( 50, 50 );

		} );

		newButton.onClick( () => {

			this.canvas.clear();

			this.dispatchEvent( { type: 'new' } );

		} );

		openButton.onClick( () => {

			this.context.hide();

			const input = document.createElement( 'input' );
			input.type = 'file';

			input.onchange = e => {

				const file = e.target.files[ 0 ];

				const reader = new FileReader();
				reader.readAsText( file, 'UTF-8' );

				reader.onload = readerEvent => {

					const json = Loader.parseObjects( JSON.parse( readerEvent.target.result ), ClassLib );

					this.canvas.clear();

					this.canvas.deserialize( json );

					this.dispatchEvent( { type: 'load' } );

				};

			};

			input.click();

		} );

		saveButton.onClick( () => {

			this.context.hide();

			const json = JSON.stringify( this.canvas.toJSON() );

			const a = document.createElement( 'a' );
			const file = new Blob( [ json ], { type: 'text/plain' } );

			a.href = URL.createObjectURL( file );
			a.download = 'node_editor.json';
			a.click();

		} );

		menu.add( menuButton );
		menu.add( newButton );
		menu.add( openButton );
		menu.add( saveButton );

		this.domElement.appendChild( menu.dom );

		this.menu = menu;

	}

	_initContextMenu() {

		const context = new ContextMenu( this.domElement );

		const add = ( node ) => {

			const canvas = this.canvas;
			const canvasRect = canvas.rect;

			node.setPosition(
				( canvas.relativeX + ( canvasRect.width / 2 ) ) - ( 350 / 2 ),
				( canvas.relativeY + ( canvasRect.height / 2 ) ) - 20
			);

			context.hide();

			this.add( node );

			this.canvas.select( node );

		};

		//**************//
		//* INPUTS
		//**************//

		const inputsContext = new ContextMenu();

		const floatInput = new ButtonInput( 'Float' ).setIcon( 'ti ti-box-multiple-1' )
			.onClick( () => add( new FloatEditor() ) );

		//const vec2Input = new ButtonInput( 'Vector 2' ).setIcon( 'ti ti-box-multiple-2' );
		//const vec3Input = new ButtonInput( 'Vector 3' ).setIcon( 'ti ti-box-multiple-3' );
		//const vec4Input = new ButtonInput( 'Vector 4' ).setIcon( 'ti ti-box-multiple-4' );

		const colorInput = new ButtonInput( 'Color' ).setIcon( 'ti ti-palette' )
			.onClick( () => add( new ColorEditor() ) );

		//const mapInput = new ButtonInput( 'Map' ).setIcon( 'ti ti-photo' );
		//const cubeMapInput = new ButtonInput( 'Cube Map' ).setIcon( 'ti ti-box' );
		//const sliderInput = new ButtonInput( 'Slider' ).setIcon( 'ti ti-adjustments-horizontal' );
		//const integerInput = new ButtonInput( 'Integer' ).setIcon( 'ti ti-list-numbers' );

		inputsContext
			.add( floatInput )
			//.add( vec2Input )
			//.add( vec3Input )
			//.add( vec4Input )
			.add( colorInput );
		//.add( sliderInput );

		//**************//
		//* MATH
		//**************//

		const mathContext = new ContextMenu();
		const operatorsNode = new ButtonInput( 'Operators' ).setIcon( 'ti ti-math-symbols' )
			.onClick( () => add( new OperatorEditor() ) );

		mathContext
			.add( operatorsNode );

		//**************//
		//* ACCESSORS
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
		//* PROCEDURAL
		//**************//

		const proceduralContext = new ContextMenu();

		const checkerNode = new ButtonInput( 'Checker' ).setIcon( 'ti ti-border-outer' )
			.onClick( () => add( new CheckerEditor() ) );

		proceduralContext
			.add( checkerNode );

		//**************//
		//* MAIN
		//**************//

		context.add( new ButtonInput( 'Inputs' ).setIcon( 'ti ti-forms' ), inputsContext );
		context.add( new ButtonInput( 'Accessors' ).setIcon( 'ti ti-vector-triangle' ), accessorsContext );
		context.add( new ButtonInput( 'Math' ).setIcon( 'ti ti-calculator' ), mathContext );
		context.add( new ButtonInput( 'Procedural' ).setIcon( 'ti ti-infinity' ), proceduralContext );

		this.domElement.appendChild( context.dom );

		this.context = context;

	}

}
