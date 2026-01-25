import { UIButton, UIDiv, UIText, UINumber, UIRow, UITabbedPanel, UIPanel } from './libs/ui.js';

function SidebarObjectAnimation( editor ) {

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

	const morphsUIElements = [];

	function Morph( index, name, morphTargetInfluences ) {

		const container = new UIRow();

		const morphName = new UIText( name ).setWidth( '200px' );
		container.add( morphName );

		const morphInfluence = new UINumber().setWidth( '60px' ).setRange( 0, 1 ).onChange( function updateMorphInfluence() {

			morphTargetInfluences[ index ] = morphInfluence.getValue();
			signals.objectChanged.dispatch( editor.selected );

		} );
		morphInfluence.setValue( morphTargetInfluences[ index ] );

		container.add( morphInfluence );
		morphsUIElements.push( morphInfluence );

		return container;

	}

	signals.objectSelected.add( function ( object ) {

		animationsList.clear();
		morphsList.clear();
		morphsUIElements.length = 0;

		clipsTab.setDisplay( 'none' );
		morphsTab.setDisplay( 'none' );

		if ( object !== null ) {

			let hasAnimations = false;
			let hasMorphs = false;

			if ( object.animations.length > 0 ) {

				hasAnimations = true;

				const animations = object.animations;

				for ( const animation of animations ) {

					animationsList.add( new Animation( animation, object ) );

				}

				clipsTab.setDisplay( '' );

			}

			if ( object.morphTargetInfluences ) {

				hasMorphs = true;

				const morphTargetDictionary = object.morphTargetDictionary;
				const morphTargetInfluences = object.morphTargetInfluences;
				const morphNames = Object.keys( morphTargetDictionary );

				for ( let i = 0; i < morphNames.length; i ++ ) {

					const name = morphNames[ i ];

					morphsList.add( new Morph( i, name, morphTargetInfluences ) );

				}

				morphsTab.setDisplay( '' );

			}

			if ( hasAnimations || hasMorphs ) container.setDisplay( '' );


		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.objectRemoved.add( function ( object ) {

		if ( object !== null && object.animations.length > 0 ) {

			mixer.uncacheRoot( object );

		}

	} );

	signals.morphTargetsUpdated.add( function () {

		// refresh UI

		const object = editor.selected;

		if ( object !== null && object.morphTargetInfluences ) {

			for ( let i = 0; i < morphsUIElements.length; i ++ ) {

				const element = morphsUIElements[ i ];
				element.setValue( object.morphTargetInfluences[ i ] );

			}

		}

	} );

	const container = new UITabbedPanel();
	container.setMarginTop( '20px' );

	const clipsTab = new UIPanel();
	const morphsTab = new UIPanel();

	container.addTab( 'clips', strings.getKey( 'sidebar/objects/animations/clips' ), clipsTab );
	container.addTab( 'morphs', strings.getKey( 'sidebar/objects/animations/morphs' ), morphsTab );

	const animationsList = new UIDiv();
	clipsTab.add( animationsList );

	const morphsList = new UIDiv();
	morphsTab.add( morphsList );

	const mixerTimeScaleRow = new UIRow();
	const mixerTimeScaleNumber = new UINumber( 1 ).setWidth( '60px' ).setRange( - 10, 10 );
	mixerTimeScaleNumber.onChange( function () {

		mixer.timeScale = mixerTimeScaleNumber.getValue();

	} );

	mixerTimeScaleRow.add( new UIText( strings.getKey( 'sidebar/animations/timescale' ) ).setClass( 'Label' ) );
	mixerTimeScaleRow.add( mixerTimeScaleNumber );

	clipsTab.add( mixerTimeScaleRow );

	container.select( 'clips' );

	return container;

}

export { SidebarObjectAnimation };
