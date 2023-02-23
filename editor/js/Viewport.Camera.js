import { UISelect } from './libs/ui.js';

function ViewportCamera( editor ) {

	const signals = editor.signals;

	//

	const select = new UISelect();
	select.setPosition( 'absolute' );
	select.setRight( '120px' );
	select.setTop( '10px' );
	select.onChange( function () {

		editor.setViewportCamera( this.getValue() );

	} );

	signals.cameraAdded.add( update );
	signals.cameraRemoved.add( update );

	update();

	//

	function update() {

		const options = {};

		const cameras = editor.cameras;

		for ( const key in cameras ) {

			const camera = cameras[ key ];
			options[ camera.uuid ] = camera.name;

		}

		select.setOptions( options );
		select.setValue( editor.viewportCamera.uuid );

	}

	return select;

}

export { ViewportCamera };
