/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Div, Break, UIText } from './libs/ui.js';
import { Boolean } from './libs/ui.three.js';

var SidebarSettingsViewport = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new Div();
	container.add( new Break() );

	container.add( new UIText( strings.getKey( 'sidebar/settings/viewport/grid' ) ).setWidth( '90px' ) );

	var show = new Boolean( true ).onChange( update );
	container.add( show );

	/*
	var snapSize = new UINumber( 25 ).setWidth( '40px' ).onChange( update );
	container.add( snapSize );

	var snap = new THREE.Boolean( false, 'snap' ).onChange( update );
	container.add( snap );
	*/

	function update() {

		signals.showGridChanged.dispatch( show.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	return container;

};

export { SidebarSettingsViewport };
