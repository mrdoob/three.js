import { UIPanel, UIRow, UISelect, UIText, UIInteger } from './libs/ui.js';

import { SidebarSettingsViewport } from './Sidebar.Settings.Viewport.js';
import { SidebarSettingsShortcuts } from './Sidebar.Settings.Shortcuts.js';

function SidebarSettings( editor ) {

	var config = editor.config;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setPaddingBottom( '20px' );

	// language

	var options = {
		en: 'English',
		fr: 'Français',
		zh: '中文'
	};

	var languageRow = new UIRow();
	var language = new UISelect().setWidth( '150px' );
	language.setOptions( options );

	if ( config.getKey( 'language' ) !== undefined ) {

		language.setValue( config.getKey( 'language' ) );

	}

	language.onChange( function () {

		var value = this.getValue();

		editor.config.setKey( 'language', value );

	} );

	languageRow.add( new UIText( strings.getKey( 'sidebar/settings/language' ) ).setWidth( '90px' ) );
	languageRow.add( language );

	container.add( languageRow );

	// export precision

	var exportPrecisionRow = new UIRow();
	var exportPrecision = new UIInteger( config.getKey( 'exportPrecision' ) ).setRange( 2, Infinity );

	exportPrecision.onChange( function () {

		var value = this.getValue();

		editor.config.setKey( 'exportPrecision', value );

	} );

	exportPrecisionRow.add( new UIText( strings.getKey( 'sidebar/settings/exportPrecision' ) ).setWidth( '90px' ) );
	exportPrecisionRow.add( exportPrecision );

	container.add( exportPrecisionRow );

	//

	container.add( new SidebarSettingsShortcuts( editor ) );
	container.add( new SidebarSettingsViewport( editor ) );

	return container;

}

export { SidebarSettings };
