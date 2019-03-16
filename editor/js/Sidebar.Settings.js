/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setPaddingBottom( '20px' );

	// language

	var options = {
		'en': 'English',
		'zh': '中文'
	};

	var languageRow = new UI.Row();
	var language = new UI.Select().setWidth( '150px' );
	language.setOptions( options );

	if ( config.getKey( 'language' ) !== undefined ) {

		language.setValue( config.getKey( 'language' ) );

	}

	language.onChange( function () {

		var value = this.getValue();

		editor.config.setKey( 'language', value );

	} );

	languageRow.add( new UI.Text( strings.getKey( 'sidebar/settings/language' ) ).setWidth( '90px' ) );
	languageRow.add( language );

	container.add( languageRow );

	// theme

	var options = {
		'css/light.css': strings.getKey( 'sidebar/settings/theme/light' ),
		'css/dark.css': strings.getKey( 'sidebar/settings/theme/dark' )
	};

	var themeRow = new UI.Row();
	var theme = new UI.Select().setWidth( '150px' );
	theme.setOptions( options );

	if ( config.getKey( 'theme' ) !== undefined ) {

		theme.setValue( config.getKey( 'theme' ) );

	}

	theme.onChange( function () {

		var value = this.getValue();

		editor.setTheme( value );
		editor.config.setKey( 'theme', value );

	} );

	themeRow.add( new UI.Text( strings.getKey( 'sidebar/settings/theme' ) ).setWidth( '90px' ) );
	themeRow.add( theme );

	container.add( themeRow );

	// scene camera position

	var sceneCameraRow = new UI.Row();
	container.add( sceneCameraRow );

	var sceneCameraSelection = new UI.Select().setWidth( '150px' );
	sceneCameraSelection.setOptions( {
		topLeft: 'Top Left',
		bottomLeft: 'Bottom Left',
		topRight: 'Top Right',
		bottomRight: 'Bottom Right'
	} );

	if ( config.getKey( 'project/renderer/sceneCameras' ) !== undefined ) {

		sceneCameraSelection.setValue( config.getKey( 'project/renderer/sceneCameras' ) );

	}

	sceneCameraSelection.onChange( function () {

		config.setKey( 'project/renderer/sceneCameras', this.getValue() );
		signals.sceneCamerasChanged.dispatch();

	} );

	sceneCameraRow.add( new UI.Text( strings.getKey( 'sidebar/settings/sceneCameras' ) ).setWidth( '90px' ), sceneCameraSelection );

	// scene camera visible

	var sceneShowCameraRow = new UI.Row();
	container.add( sceneShowCameraRow );

	var sceneCameraCheckbox = new UI.Checkbox( true ).onChange( function () {

		config.setKey( 'project/renderer/showSceneCameras', this.getValue() );
		signals.sceneCamerasChanged.dispatch();

	} );

	sceneShowCameraRow.add( new UI.Text( strings.getKey( 'sidebar/settings/showSceneCameras' ) ).setWidth( '90px' ), sceneCameraCheckbox );

	container.add( new Sidebar.Settings.Shortcuts( editor ) );
	container.add( new Sidebar.Settings.Viewport( editor ) );

	return container;

};
