import { UIPanel, UIBreak, UIButton, UIDiv, UIText, UINumber, UIRow } from './libs/ui.js';

function SidebarAnimation( editor ) {

	const strings = editor.strings;
	const signals = editor.signals;
	const mixer = editor.mixer;

	function getButtonText( action ) {

		return action.isRunning()
			? strings.getKey( 'sidebar/animations/stop' )
			: strings.getKey( 'sidebar/animations/play' );

	}

	function Animation( animation, object ) {

		const action = mixer.clipAction( animation, object );

		const container = new UIRow();

		const name = new UIText( animation.name ).setWidth( '200px' );
		container.add( name );

		const button = new UIButton( getButtonText( action ) );
		button.onClick( function () {

			action.isRunning() ? action.stop() : action.play();
			button.setTextContent( getButtonText( action ) );

		} );

		container.add( button );

		return container;

	}

	signals.objectSelected.add( function ( object ) {

		if ( object !== null && object.animations.length > 0 ) {

			animationsList.clear();

			const animations = object.animations;

			for ( const animation of animations ) {

				animationsList.add( new Animation( animation, object ) );

			}

			container.setDisplay( '' );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.objectRemoved.add( function ( object ) {

		if ( object !== null && object.animations.length > 0 ) {

			mixer.uncacheRoot( object );

		}

	} );

	const container = new UIPanel();
	container.setDisplay( 'none' );

	container.add( new UIText( strings.getKey( 'sidebar/animations' ) ).setTextTransform( 'uppercase' ) );
	container.add( new UIBreak() );
	container.add( new UIBreak() );

	const animationsList = new UIDiv();
	container.add( animationsList );

	const mixerTimeScaleRow = new UIRow();
	const mixerTimeScaleNumber = new UINumber( 0.5 ).setWidth( '60px' ).setRange( - 10, 10 );
	mixerTimeScaleNumber.onChange( function () {

		mixer.timeScale = mixerTimeScaleNumber.getValue();

	} );

	mixerTimeScaleRow.add( new UIText( strings.getKey( 'sidebar/animations/timescale' ) ).setWidth( '90px' ) );
	mixerTimeScaleRow.add( mixerTimeScaleNumber );

	container.add( mixerTimeScaleRow );

	return container;

}

export { SidebarAnimation };
