import { UIPanel, UIBreak, UISelect, UIButton, UIText, UINumber, UIRow } from './libs/ui.js';

function SidebarAnimation( editor ) {

	var strings = editor.strings;
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
			mixerTimeScaleNumber.setValue( mixer.timeScale );

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

	function changeTimeScale() {

		mixer.timeScale = mixerTimeScaleNumber.getValue();

	}

	var container = new UIPanel();
	container.setDisplay( 'none' );

	container.add( new UIText( strings.getKey( 'sidebar/animations' ) ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak() );
	container.add( new UIBreak() );

	//

	var animationsRow = new UIRow();

	var animationsSelect = new UISelect().setFontSize( '12px' );
	animationsRow.add( animationsSelect );
	animationsRow.add( new UIButton( strings.getKey( 'sidebar/animations/play' ) ).setMarginLeft( '4px' ).onClick( playAction ) );
	animationsRow.add( new UIButton( strings.getKey( 'sidebar/animations/stop' ) ).setMarginLeft( '4px' ).onClick( stopAction ) );

	container.add( animationsRow );

	//

	var mixerTimeScaleRow = new UIRow();
	var mixerTimeScaleNumber = new UINumber( 0.5 ).setWidth( '60px' ).setRange( - 10, 10 ).onChange( changeTimeScale );

	mixerTimeScaleRow.add( new UIText( strings.getKey( 'sidebar/animations/timescale' ) ).setWidth( '90px' ) );
	mixerTimeScaleRow.add( mixerTimeScaleNumber );

	container.add( mixerTimeScaleRow );

	return container;

}

export { SidebarAnimation };
