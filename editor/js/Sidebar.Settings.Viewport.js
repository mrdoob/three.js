/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIDiv, UIBreak, UIText } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';


function SidebarSettingsViewport( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIDiv();
	container.add( new UIBreak() );

	container.add( new UIText( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	var show = new UIBoolean( true ).onChange( update );
	container.add( show );

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

}

export { SidebarSettingsViewport };
