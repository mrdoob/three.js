import { UIPanel, UIText, UIRow } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';


function SidebarSettingsViewport( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/settings/viewport' ).toUpperCase() ) );
	container.add( headerRow );

	// grid

	const showGridRow = new UIRow();

	showGridRow.add( new UIText( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	const showGrid = new UIBoolean( true ).onChange( function () {

		signals.showGridChanged.dispatch( showGrid.getValue() );

	} );
	showGridRow.add( showGrid );
	container.add( showGridRow );

	// helpers

	const showHelpersRow = new UIRow();

	showHelpersRow.add( new UIText( strings.getKey( 'sidebar/settings/viewport/helpers' ) ).setWidth( '90px' ) );

	const showHelpers = new UIBoolean( true ).onChange( function () {

		signals.showHelpersChanged.dispatch( showHelpers.getValue() );

	} );
	showHelpersRow.add( showHelpers );
	container.add( showHelpersRow );

	return container;

}

export { SidebarSettingsViewport };
