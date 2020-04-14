/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIButton } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

var Toolbar = function ( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setId( 'toolbar' );
	container.setDisplay( 'none' );

	var buttons = new UIPanel();
	container.add( buttons );

	// translate / rotate / scale

	var translate = new UIButton( strings.getKey( 'toolbar/translate' ) );
	translate.dom.className = 'Button selected';
	translate.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	buttons.add( translate );

	var rotate = new UIButton( strings.getKey( 'toolbar/rotate' ) );
	rotate.onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	buttons.add( rotate );

	var scale = new UIButton( strings.getKey( 'toolbar/scale' ) );
	scale.onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	buttons.add( scale );

	var local = new UIBoolean( false, strings.getKey( 'toolbar/local' ) );
	local.onChange( function () {

		signals.spaceChanged.dispatch( this.getValue() === true ? 'local' : 'world' );

	} );
	buttons.add( local );

	//

	signals.objectSelected.add( function ( object ) {

		container.setDisplay( object === null ? 'none' : '' );

	} );

	signals.transformModeChanged.add( function ( mode ) {

		translate.dom.classList.remove( 'selected' );
		rotate.dom.classList.remove( 'selected' );
		scale.dom.classList.remove( 'selected' );

		switch ( mode ) {

			case 'translate': translate.dom.classList.add( 'selected' ); break;
			case 'rotate': rotate.dom.classList.add( 'selected' ); break;
			case 'scale': scale.dom.classList.add( 'selected' ); break;

		}

	} );

	return container;

};

export { Toolbar };
