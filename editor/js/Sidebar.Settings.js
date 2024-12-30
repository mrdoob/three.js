import { UIPanel, UIRow, UISelect, UISpan, UIText } from './libs/ui.js';

import { SidebarSettingsShortcuts } from './Sidebar.Settings.Shortcuts.js';
import { SidebarSettingsHistory } from './Sidebar.Settings.History.js';

function SidebarSettings( editor ) {

	const config = editor.config;
	const strings = editor.strings;

	const container = new UISpan();

	const settings = new UIPanel();
	settings.setBorderTop( '0' );
	settings.setPaddingTop( '20px' );
	container.add( settings );

	// language

	const options = Object.fromEntries( [ 'en', 'fr', 'zh', 'ja', 'ko', 'fa' ].map( locale => {

		return [ locale, new Intl.DisplayNames( locale, { type: 'language' } ).of( locale ) ];

	} ) );

	const languageRow = new UIRow();
	const language = new UISelect().setWidth( '150px' );
	language.setOptions( options );

	if ( config.getKey( 'language' ) !== undefined ) {

		language.setValue( config.getKey( 'language' ) );

	}

	language.onChange( function () {

		const value = this.getValue();

		editor.config.setKey( 'language', value );

	} );

	languageRow.add( new UIText( strings.getKey( 'sidebar/settings/language' ) ).setClass( 'Label' ) );
	languageRow.add( language );

	settings.add( languageRow );

	//

	container.add( new SidebarSettingsShortcuts( editor ) );
	container.add( new SidebarSettingsHistory( editor ) );

	return container;

}

export { SidebarSettings };
