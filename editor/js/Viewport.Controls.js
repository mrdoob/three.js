import { UIPanel, UISelect } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function ViewportControls( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setPosition( 'absolute' );
	container.setRight( '10px' );
	container.setTop( '10px' );
	container.setColor( '#ffffff' );

	// grid

	const gridCheckbox = new UIBoolean( true, strings.getKey( 'viewport/controls/grid' ) );
	gridCheckbox.onChange( function () {

		signals.showGridChanged.dispatch( this.getValue() );

	} );
	container.add( gridCheckbox );

	// helpers

	const helpersCheckbox = new UIBoolean( true, strings.getKey( 'viewport/controls/helpers' ) );
	helpersCheckbox.onChange( function () {

		signals.showHelpersChanged.dispatch( this.getValue() );

	} );
	container.add( helpersCheckbox );

	// camera

	const cameraSelect = new UISelect();
	cameraSelect.setMarginLeft( '10px' );
	cameraSelect.setMarginRight( '10px' );
	cameraSelect.onChange( function () {

		editor.setViewportCamera( this.getValue() );

	} );
	container.add( cameraSelect );

	signals.cameraAdded.add( update );
	signals.cameraRemoved.add( update );

	// shading

	const shadingSelect = new UISelect();
	shadingSelect.setOptions( { 'realistic': 'realistic', 'solid': 'solid', 'normals': 'normals', 'wireframe': 'wireframe' } );
	shadingSelect.setValue( 'solid' );
	shadingSelect.onChange( function () {

		editor.setViewportShading( this.getValue() );

	} );
	container.add( shadingSelect );

	signals.editorCleared.add( function () {

		shadingSelect.setValue( 'solid' );
		editor.setViewportShading( shadingSelect.getValue() );

	} );

	update();

	//

	function update() {

		const options = {};

		const cameras = editor.cameras;

		for ( const key in cameras ) {

			const camera = cameras[ key ];
			options[ camera.uuid ] = camera.name;

		}

		cameraSelect.setOptions( options );
		cameraSelect.setValue( editor.viewportCamera.uuid );

	}

	return container;

}

export { ViewportControls };
