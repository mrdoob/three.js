Menubar.Help = function ( editor ) {

	var menuConfig,
		optionsPanel;

	// event handlers

	function onSourcecodeOptionClick () {

		window.open( 'https://github.com/mrdoob/three.js/tree/master/editor', '_blank' )

	}

	function onAboutOptionClick () {

		window.open( 'http://threejs.org', '_blank' );

	}

	// configure menu contents

	with(UI.MenubarHelper) {

		menuConfig = [
			createOption( 'Source code', onSourcecodeOptionClick ),
			createOption( 'About', onAboutOptionClick )
		];

	}

	optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

	return UI.MenubarHelper.createMenuContainer( 'Help', optionsPanel );
}
