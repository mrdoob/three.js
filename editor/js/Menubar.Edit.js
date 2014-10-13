/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Edit = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Edit' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Clone

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

	// Delete

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Delete' );
	option.onClick( function () {

		var parent = editor.selected.parent;
		editor.removeObject( editor.selected );
		editor.select( parent );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Flatten

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Flatten' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid flattening the camera or scene

		if ( confirm( 'Flatten ' + object.name + '?' ) === false ) return;

		var geometry = object.geometry;

		geometry.applyMatrix( object.matrix );
		geometry.verticesNeedUpdate = true;
		geometry.normalsNeedUpdate = true;

		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

		editor.signals.objectChanged.dispatch( object );

	} );
	options.add( option );

	return container;

};
