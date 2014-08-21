Menubar.Play = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Play' );
	title.onClick( function () {

		var player = new Player( editor.scene.toJSON() );
		player.setSize( 800, 600 );
		player.play();

		var popup = window.open( '', 'preview', 'width=800,height=600' );
		popup.addEventListener( 'beforeunload', function () {
			player.stop();
		} );
		popup.document.body.style.margin = 0;
		popup.document.body.appendChild( player.dom );

	} );
	container.add( title );

	return container;

};