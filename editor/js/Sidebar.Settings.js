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
		en: 'English',
		zh: '中文'
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

	container.add( new Sidebar.Settings.Shortcuts( editor ) );
	container.add( new Sidebar.Settings.Viewport( editor ) );

	return container;

};
