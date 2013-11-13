Menubar.Edit = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setTextContent( 'Edit' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// clone

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Clone' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.addObject( object );
		editor.select( object );

	} );
	options.add( option );

	// delete

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Delete' );
	option.onClick( function () {

		editor.removeObject( editor.selected );
		editor.deselect();

	} );
	options.add( option );

	options.add( new UI.HorizontalRule() );

	// convert to BufferGeometry

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Convert' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.geometry instanceof THREE.Geometry ) {

			if ( object.parent === undefined ) return; // avoid flattening the camera or scene

			if ( confirm( 'Convert ' + object.name + ' to BufferGeometry?' ) === false ) return;

			delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

			object.geometry = THREE.BufferGeometryUtils.fromGeometry( object.geometry );

			editor.signals.objectChanged.dispatch( object );

		}

	} );
	options.add( option );

	// flatten

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Flatten' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid flattening the camera or scene

		if ( confirm( 'Flatten ' + object.name + '?' ) === false ) return;

		delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

		var geometry = object.geometry.clone();
		geometry.applyMatrix( object.matrix );

		object.geometry = geometry;

		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

		editor.signals.objectChanged.dispatch( object );

	} );
	options.add( option );


	//

	return container;

}
