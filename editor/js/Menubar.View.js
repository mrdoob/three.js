Menubar.View = function ( editor ) {
	
	var menuConfig,
		optionsPanel,
		createOption,
		createDivider;

	function onLightThemeOptionClick () {

		editor.setTheme( 'css/light.css' );
		editor.config.setKey( 'theme', 'css/light.css' );

	}

	function onDarkThemeOptionClick () {

		editor.setTheme( 'css/dark.css' );
		editor.config.setKey( 'theme', 'css/dark.css' );

	}
	

	// configure menu contents

	createOption  = UI.MenubarHelper.createOption;
	createDivider = UI.MenubarHelper.createDivider;

	menuConfig    = [
		createOption( 'Light theme', onLightThemeOptionClick ),
		createOption( 'Dark theme', onDarkThemeOptionClick )
	];

	optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

	return UI.MenubarHelper.createMenuContainer( 'View', optionsPanel );

}
