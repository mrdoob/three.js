Sidebar.Rift = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	var viewport = document.querySelector('#viewport canvas');

	container.addStatic( new UI.Text( 'RIFT' ) );
	container.add( new UI.Break() );
	//document.addEventListener( 'mouseup', onMouseUp,
	var objectRiftButton = new UI.Button( 'Push to Rift' ).
		setWidth('100%').
		onClick( function () {
			//viewport.classList.add('fullscreen')
		} );

		objectRiftButton.dom.addEventListener( 'mousedown', onMouseDown, false );
		function onMouseDown() {
			viewport.classList.add('fullscreen')
		}

		objectRiftButton.dom.addEventListener( 'mouseup', onMouseUp, false );
		function onMouseUp() {
			viewport.classList.remove('fullscreen')
		}
	objectRiftButton.dom.className = 'Button Rift';

	var objectUUIDRow = new UI.Panel();

	objectUUIDRow.add( objectRiftButton );
	container.add( objectUUIDRow );
	container.add( new UI.Break() );

	return container;

}

