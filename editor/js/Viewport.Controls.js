import { UIPanel, UISelect } from './libs/ui.js';

function ViewportControls( editor ) {

	const signals = editor.signals;

	const container = new UIPanel();
	container.setPosition( 'absolute' );
	container.setRight( '10px' );
	container.setTop( '10px' );

	// camera

	const cameraSelect = new UISelect();
	cameraSelect.setMarginRight( '10px' );
	cameraSelect.onChange( function () {

		editor.setViewportCamera( this.getValue() );

	} );
	container.add( cameraSelect );

	signals.cameraAdded.add( update );
	signals.cameraRemoved.add( update );

	// shading

	const shadingSelect = new UISelect();
	shadingSelect.setOptions( { 'default': 'default', 'normals': 'normals', 'wireframe': 'wireframe' } );
	shadingSelect.setValue( 'default' );
	shadingSelect.onChange( function () {

		editor.setViewportShading( this.getValue() );

	} );
	container.add( shadingSelect );

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
