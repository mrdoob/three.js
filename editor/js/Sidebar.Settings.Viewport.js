/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings.Viewport = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;
	var config = editor.config;

	var container = new UI.Div();
	container.add( new UI.Break() );

	container.add( new UI.Text( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	var show = new UI.THREE.Boolean( true ).onChange( update );
	container.add( show, new UI.Break() );

	container.add( new UI.Text( strings.getKey( 'sidebar/settings/viewport/view' ) ).setWidth( '90px' ) );

	var sceneViewOptions = new UI.Select().setOptions( {
		left: 'left',
		right: 'right',
		top: 'top',
		bottom: 'bottom'
	} );

	if ( config.getKey( 'sceneCameraView' ) !== undefined ) {

		sceneViewOptions.setValue( config.getKey( 'sceneCameraView' ) );

	} else {

		sceneViewOptions.setValue( 'left' );

	}

	sceneViewOptions.onChange( function () {

		config.setKey( 'sceneCameraView', sceneViewOptions.getValue() );
		signals.sceneGraphChanged.dispatch();

	} );
	container.add( sceneViewOptions );

	/*
	var snapSize = new UI.Number( 25 ).setWidth( '40px' ).onChange( update );
	container.add( snapSize );

	var snap = new UI.THREE.Boolean( false, 'snap' ).onChange( update );
	container.add( snap );
	*/

	function update() {

		signals.showGridChanged.dispatch( show.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	return container;

};
