Menubar.Status = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu right' );

	var checkbox = new UI.Checkbox( editor.config.getKey( 'autosave' ) );
	checkbox.onChange( function () {

		editor.config.setKey( 'autosave', this.getValue() );

	} );
	container.add( checkbox );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Autosave' );
	container.add( title );

	editor.signals.savingStarted.add( function () {

		title.setTextDecoration( 'underline' );

	} );

	editor.signals.savingFinished.add( function () {

		title.setTextDecoration( 'none' );

	} );

	return container;

};
