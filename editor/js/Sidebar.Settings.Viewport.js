import { UIDiv, UIText, UIRow } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';


function SidebarSettingsViewport( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIDiv();

	// grid

	var showGridRow = new UIRow();

	showGridRow.add( new UIText( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	var showGrid = new UIBoolean( true ).onChange( function () {

		signals.showGridChanged.dispatch( showGrid.getValue() );

	} );
	showGridRow.add( showGrid );
	container.add( showGridRow );

	// helpers

	var showHelpersRow = new UIRow();

	showHelpersRow.add( new UIText( strings.getKey( 'sidebar/settings/viewport/helpers' ) ).setWidth( '90px' ) );

	var showHelpers = new UIBoolean( true ).onChange( function () {

		signals.showHelpersChanged.dispatch( showHelpers.getValue() );

	} );
	showHelpersRow.add( showHelpers );
	container.add( showHelpersRow );

	return container;

}

export { SidebarSettingsViewport };
