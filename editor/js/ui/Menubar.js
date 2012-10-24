var Menubar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );

	var options = new UI.Panel();
	options.setMargin( '8px' );

	// File

	var optionFile = new UI.Text().setValue( 'File' ).setColor( '#666' ).setMarginRight( '20px' ).onMouseOver( onOptionFileClick );
	options.add( optionFile );

	var optionFileMenu = new Menubar.File().setTop( '32px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionFileMenu );

	// Edit

	var optionEdit = new UI.Text().setValue( 'Edit' ).setColor( '#666' ).setMarginRight( '20px' ).onMouseOver( onOptionEditClick );
	options.add( optionEdit );

	var optionEditMenu = new Menubar.Edit().setTop( '32px' ).setLeft( '50px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionEditMenu );

	// Add

	var optionAdd = new UI.Text().setValue( 'Add' ).setColor( '#666' ).setMarginRight( '20px' ).onMouseOver( onOptionAddClick );
	options.add( optionAdd );

	var optionAddMenu = new Menubar.Add().setTop( '32px' ).setLeft( '90px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionAddMenu );


	// Help

	var optionHelp = new UI.Text().setValue( 'Help' ).setColor( '#666' ).setMarginRight( '20px' ).onMouseOver( onOptionHelpClick );
	options.add( optionHelp );

	var optionHelpMenu = new Menubar.Help().setTop( '32px' ).setLeft( '140px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionHelpMenu );


	//

	container.add( options );

	function closeAll() {

		optionFileMenu.setDisplay( 'none' );
		optionEditMenu.setDisplay( 'none' );
		optionAddMenu.setDisplay( 'none' );
		optionHelpMenu.setDisplay( 'none' );

	}

	function onOptionFileClick() {

		closeAll();
		optionFileMenu.setDisplay( '' );

	}

	function onOptionEditClick() {

		closeAll();
		optionEditMenu.setDisplay( '' );

	}

	function onOptionAddClick() {

		closeAll();
		optionAddMenu.setDisplay( '' );

	}

	function onOptionHelpClick() {

		closeAll();
		optionHelpMenu.setDisplay( '' );

	}

	return container;

}
