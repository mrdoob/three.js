import { UIPanel, UIBreak, UISelect, UIButton, UIText, UINumber, UIRow } from './libs/ui.js';

function SidebarAnimation( editor ) {

	const strings = editor.strings;
	const signals = editor.signals;
	const mixer = editor.mixer;

	const actions = {};

	signals.objectSelected.add( function ( object ) {

		if ( object !== null && object.animations.length > 0 ) {

			const animations = object.animations;

			container.setDisplay( '' );

			const options = {};
			let firstAnimation;

			for ( const animation of animations ) {

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

		if ( object !== null && object.animations.length > 0 ) {

			mixer.uncacheRoot( object );

		}

	} );

	function playAction() {

		actions[ animationsSelect.getValue() ].play();

	}

	function stopAction() {

		actions[ animationsSelect.getValue() ].stop();

		signals.animationStopped.dispatch();

	}

	function changeTimeScale() {

		mixer.timeScale = mixerTimeScaleNumber.getValue();

	}

	const container = new UIPanel();
	container.setDisplay( 'none' );

	container.add( new UIText( strings.getKey( 'sidebar/animations' ) ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak() );
	container.add( new UIBreak() );

	//

	const animationsRow = new UIRow();

	const animationsSelect = new UISelect().setFontSize( '12px' );
	animationsRow.add( animationsSelect );
	animationsRow.add( new UIButton( strings.getKey( 'sidebar/animations/play' ) ).setMarginLeft( '4px' ).onClick( playAction ) );
	animationsRow.add( new UIButton( strings.getKey( 'sidebar/animations/stop' ) ).setMarginLeft( '4px' ).onClick( stopAction ) );

	container.add( animationsRow );

	//

	const mixerTimeScaleRow = new UIRow();
	const mixerTimeScaleNumber = new UINumber( 0.5 ).setWidth( '60px' ).setRange( - 10, 10 ).onChange( changeTimeScale );

	mixerTimeScaleRow.add( new UIText( strings.getKey( 'sidebar/animations/timescale' ) ).setWidth( '90px' ) );
	mixerTimeScaleRow.add( mixerTimeScaleNumber );

	container.add( mixerTimeScaleRow );

	return container;

}

export { SidebarAnimation };
