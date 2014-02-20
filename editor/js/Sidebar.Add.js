Sidebar.Add = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.add( new UI.Text( 'ADD' ) );
	container.add( new UI.Break(), new UI.Break() );


	return container;
}
