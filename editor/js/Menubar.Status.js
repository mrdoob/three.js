Menubar.Status = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu right' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( '...' );
	container.add( title );

	editor.signals.savingStarted.add( function () {

		title.setTextContent( 'Saving' );

	} );

	editor.signals.savingFinished.add( function () {

		title.setTextContent( 'Saved' );

	} );

	return container;

};
