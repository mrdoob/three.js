/**
 * @author mrdoob / http://mrdoob.com/
 */

import * as THREE from '../../build/three.module.js';

import { UIPanel, UIText } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function MenubarStatus( editor ) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu right' );

	var autosave = new UIBoolean( editor.config.getKey( 'autosave' ), strings.getKey( 'menubar/status/autosave' ) );
	autosave.text.setColor( '#888' );
	autosave.onChange( function () {

		var value = this.getValue();

		editor.config.setKey( 'autosave', value );

		if ( value === true ) {

			editor.signals.sceneGraphChanged.dispatch();

		}

	} );
	container.add( autosave );

	editor.signals.savingStarted.add( function () {

		autosave.text.setTextDecoration( 'underline' );

	} );

	editor.signals.savingFinished.add( function () {

		autosave.text.setTextDecoration( 'none' );

	} );

	var version = new UIText( 'r' + THREE.REVISION );
	version.setClass( 'title' );
	version.setOpacity( 0.5 );
	container.add( version );

	return container;

}

export { MenubarStatus };
