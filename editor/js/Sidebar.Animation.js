/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIDiv, UIBreak, UISelect, UIButton, UIText } from './libs/ui.js';

var SidebarAnimation = function ( editor ) {

	var signals = editor.signals;
	var mixer = editor.mixer;

	var actions = {};

	signals.objectSelected.add( function ( object ) {

		var animations = editor.animations[ object !== null ? object.uuid : '' ];

		if ( animations !== undefined ) {

			container.setDisplay( '' );

			var options = {};
			var firstAnimation;

			for ( var animation of animations ) {

				if ( firstAnimation === undefined ) firstAnimation = animation.name;

				actions[ animation.name ] = mixer.clipAction( animation, object );
				options[ animation.name ] = animation.name;

			}

			animationsSelect.setOptions( options );
			animationsSelect.setValue( firstAnimation );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.objectRemoved.add( function ( object ) {

		var animations = editor.animations[ object !== null ? object.uuid : '' ];

		if ( animations !== undefined ) {

			mixer.uncacheRoot( object );

		}

	} );

	function playAction() {

		actions[ animationsSelect.getValue() ].play();

	}

	function stopAction() {

		actions[ animationsSelect.getValue() ].stop();

	}

	var container = new UIPanel();
	container.setDisplay( 'none' );

	container.add( new UIText( 'Animations' ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak() );
	container.add( new UIBreak() );

	var div = new UIDiv();
	container.add( div );

	var animationsSelect = new UISelect().setFontSize( '12px' );
	div.add( animationsSelect );
	div.add( new UIButton( 'Play' ).setMarginLeft( '4px' ).onClick( playAction ) );
	div.add( new UIButton( 'Stop' ).setMarginLeft( '4px' ).onClick( stopAction ) );

	return container;

};

export { SidebarAnimation };
