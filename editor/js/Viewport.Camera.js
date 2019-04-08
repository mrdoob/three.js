/**
 * @author mrdoob / http://mrdoob.com/
 */

Viewport.Camera = function ( editor ) {

	var signals = editor.signals;

	//

	var cameraSelect = new UI.Select();
	cameraSelect.setPosition( 'absolute' );
	cameraSelect.setRight( '10px' );
	cameraSelect.setTop( '10px' );
	cameraSelect.onChange( function () {

		editor.setViewportCameraByUUID( this.getValue() );

	} );

	signals.cameraAdded.add( update );
	signals.cameraRemoved.add( function ( camera ) {

		delete editor.cameras[ camera.uuid ];
		if ( editor.viewportCamera === camera ) {

			editor.setViewportCameraByUUID( editor.camera.uuid );

		}
		update();

	} );
	signals.editorCleared.add( function () {

		editor.cameras = {};
		editor.addCamera( editor.camera );
		editor.setViewportCameraByUUID( editor.camera.uuid );
		update();

	} );

	update();

	//

	function update() {

		var options = {};

		var cameras = editor.cameras;

		var validViewport = false;
		for ( var key in cameras ) {

			var camera = cameras[ key ];
			options[ camera.uuid ] = camera.name;
			if ( editor.viewportCamera === camera ) {

				validViewport = true;

			}

		}

		cameraSelect.setOptions( options );
		if ( validViewport === false ) {

			editor.setViewportCameraByUUID( editor.camera.uuid );

		}
		cameraSelect.setValue( editor.viewportCamera.uuid );

	}

	return cameraSelect;

};
