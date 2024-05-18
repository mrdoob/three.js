import { UIHorizontalRule, UIPanel, UIRow } from './libs/ui.js';

function MenubarView( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/view' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Fullscreen

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/view/fullscreen' ) );
	option.onClick( function () {

		if ( document.fullscreenElement === null ) {

			document.documentElement.requestFullscreen();

		} else if ( document.exitFullscreen ) {

			document.exitFullscreen();

		}

		// Safari

		if ( document.webkitFullscreenElement === null ) {

			document.documentElement.webkitRequestFullscreen();

		} else if ( document.webkitExitFullscreen ) {

			document.webkitExitFullscreen();

		}

	} );
	options.add( option );

	// XR (Work in progress)

	if ( 'xr' in navigator ) {

		if ( 'offerSession' in navigator.xr ) {

			signals.offerXR.dispatch( 'immersive-ar' );

		} else {

			navigator.xr.isSessionSupported( 'immersive-ar' )
				.then( function ( supported ) {

					if ( supported ) {

						const option = new UIRow();
						option.setClass( 'option' );
						option.setTextContent( 'AR' );
						option.onClick( function () {

							signals.enterXR.dispatch( 'immersive-ar' );

						} );
						options.add( option );

					} else {

						navigator.xr.isSessionSupported( 'immersive-vr' )
							.then( function ( supported ) {

								if ( supported ) {

									const option = new UIRow();
									option.setClass( 'option' );
									option.setTextContent( 'VR' );
									option.onClick( function () {

										signals.enterXR.dispatch( 'immersive-vr' );

									} );
									options.add( option );

								}

							} );

					}

				} );

		}

	}

	//

	options.add( new UIHorizontalRule() );

	// Appearance

	const appearanceStates = {

		gridHelper: true,
		cameraHelpers: true,
		lightHelpers: true,
		skeletonHelpers: true

	};

	const appearanceSubmenuTitle = new UIRow().setTextContent( 'Appearance' ).addClass( 'option' ).addClass( 'submenu-title' );
	appearanceSubmenuTitle.onMouseOver( function () {

		const { top, right } = appearanceSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle( this.dom );
		appearanceSubmenu.setLeft( right + 'px' );
		appearanceSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
		appearanceSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
		appearanceSubmenu.setDisplay( 'block' );

	} );
	appearanceSubmenuTitle.onMouseOut( function () {

		appearanceSubmenu.setDisplay( 'none' );

	} );
	options.add( appearanceSubmenuTitle );

	const appearanceSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
	appearanceSubmenuTitle.add( appearanceSubmenu );

	// Appearance / Grid Helper

	option = new UIRow().addClass( 'option' ).addClass( 'toggle' ).setTextContent( 'Grid Helper' ).onClick( function () {

		appearanceStates.gridHelper = ! appearanceStates.gridHelper;

		this.toggleClass( 'toggle-on', appearanceStates.gridHelper );

		signals.showHelpersChanged.dispatch( appearanceStates );

	} ).toggleClass( 'toggle-on', appearanceStates.gridHelper );

	appearanceSubmenu.add( option );

	// Appearance / Camera Helpers

	option = new UIRow().addClass( 'option' ).addClass( 'toggle' ).setTextContent( 'Camera Helpers' ).onClick( function () {

		appearanceStates.cameraHelpers = ! appearanceStates.cameraHelpers;

		this.toggleClass( 'toggle-on', appearanceStates.cameraHelpers );

		signals.showHelpersChanged.dispatch( appearanceStates );

	} ).toggleClass( 'toggle-on', appearanceStates.cameraHelpers );

	appearanceSubmenu.add( option );

	// Appearance / Light Helpers

	option = new UIRow().addClass( 'option' ).addClass( 'toggle' ).setTextContent( 'Light Helpers' ).onClick( function () {

		appearanceStates.lightHelpers = ! appearanceStates.lightHelpers;

		this.toggleClass( 'toggle-on', appearanceStates.lightHelpers );

		signals.showHelpersChanged.dispatch( appearanceStates );

	} ).toggleClass( 'toggle-on', appearanceStates.lightHelpers );

	appearanceSubmenu.add( option );

	// Appearance / Skeleton Helpers

	option = new UIRow().addClass( 'option' ).addClass( 'toggle' ).setTextContent( 'Skeleton Helpers' ).onClick( function () {

		appearanceStates.skeletonHelpers = ! appearanceStates.skeletonHelpers;

		this.toggleClass( 'toggle-on', appearanceStates.skeletonHelpers );

		signals.showHelpersChanged.dispatch( appearanceStates );

	} ).toggleClass( 'toggle-on', appearanceStates.skeletonHelpers );

	appearanceSubmenu.add( option );

	//

	return container;

}

export { MenubarView };
