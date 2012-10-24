var Menubar = function ( signals ) {

	var container = new UI.Panel( 'absolute' );
	container.setBackgroundColor( '#eee' );
	container.setPadding( '0px' ).setMargin( '0px' );

	var options = new UI.Panel();
	options.setBackgroundColor( '#eee' );
	options.setPadding( '0px' ).setMargin( '0px' );

	// File

	var optionFile = new UI.Text().setValue( 'File' ).setDisplay( 'inline-block' ).setColor( '#666' ).setPadding( '8px 15px' ).onMouseOver( onOptionFileClick ).onMouseOver( onFileMouseOver ).onMouseOut( onFileMouseOut );
	options.add( optionFile );

	var optionFileMenu = new Menubar.File().setTop( '32px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionFileMenu );

	// Edit

	var optionEdit = new UI.Text().setValue( 'Edit' ).setDisplay( 'inline-block' ).setColor( '#666' ).setPadding( '8px 15px' ).onMouseOver( onOptionEditClick ).onMouseOver( onEditMouseOver ).onMouseOut( onEditMouseOut );
	options.add( optionEdit );

	var optionEditMenu = new Menubar.Edit().setTop( '32px' ).setLeft( '50px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionEditMenu );

	// Add

	var optionAdd = new UI.Text().setValue( 'Add' ).setDisplay( 'inline-block' ).setColor( '#666' ).setPadding( '8px 15px' ).onMouseOver( onOptionAddClick ).onMouseOver( onAddMouseOver ).onMouseOut( onAddMouseOut );
	options.add( optionAdd );

	var optionAddMenu = new Menubar.Add().setTop( '32px' ).setLeft( '90px' ).setDisplay( 'none' ).onMouseOut( closeAll );
	container.add( optionAddMenu );


	// Help

	var optionHelp = new UI.Text().setValue( 'Help' ).setDisplay( 'inline-block' ).setColor( '#666' ).setPadding( '8px 15px' ).onMouseOver( onOptionHelpClick ).onMouseOver( onHelpMouseOver ).onMouseOut( onHelpMouseOut );
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

	function setStyleOver( item ) {

		item.dom.style.background = "#444";
		item.dom.style.color = "#eee";

	}

	function setStyleOut( item ) {

		item.dom.style.background = "transparent";
		item.dom.style.color = "#000";

	}

	function onFileMouseOver() {

		setStyleOver( optionFile );

	}

	function onFileMouseOut() {

		setStyleOut( optionFile );

	}

	function onEditMouseOver() {

		setStyleOver( optionEdit );

	}

	function onEditMouseOut() {

		setStyleOut( optionEdit );

	}

	function onAddMouseOver() {

		setStyleOver( optionAdd );

	}

	function onAddMouseOut() {

		setStyleOut( optionAdd );

	}

	function onHelpMouseOver() {

		setStyleOver( optionHelp );

	}

	function onHelpMouseOut() {

		setStyleOut( optionHelp );

	}

	return container;

}
