Menubar.Edit = function ( editor ) {

	// event handlers

	// function onUndoOptionClick () {

	// 	console.log( 'UNDO not implemented yet' );

	// }

	// function onRedoOptionClick () {

	// 	console.log( 'REDO not implemented yet' );

	// }

	function onCloneOptionClick () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.addObject( object );
		editor.select( object );

	}

	function onDeleteOptionClick () {

		var parent = editor.selected.parent;
		editor.removeObject( editor.selected );
		editor.select( parent );

	}

	function onConvertOptionClick () {

		// convert to BufferGeometry
		
		var object = editor.selected;

		if ( object.geometry instanceof THREE.Geometry ) {

			if ( object.parent === undefined ) return; // avoid flattening the camera or scene

			if ( confirm( 'Convert ' + object.name + ' to BufferGeometry?' ) === false ) return;

			object.geometry = new THREE.BufferGeometry().fromGeometry( object.geometry );

			editor.signals.objectChanged.dispatch( object );

		}

	}

	function onFlattenOptionClick () {

		var object = editor.selected;

		if ( object.parent === undefined ) return; // avoid flattening the camera or scene

		if ( confirm( 'Flatten ' + object.name + '?' ) === false ) return;

		var geometry = object.geometry.clone();
		geometry.applyMatrix( object.matrix );


		object.geometry = geometry;

		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );
		
		object.geometry.buffersNeedUpdate = true;
		editor.signals.objectChanged.dispatch( object );

	}

	// configure menu contents

	var createOption = UI.MenubarHelper.createOption;
	var createDivider = UI.MenubarHelper.createDivider;

	var menuConfig = [
		// createOption( 'Undo', onUndoOptionClick ),
		// createOption( 'Redo', onRedoOptionClick ),
		// createDivider(),

		createOption( 'Clone', onCloneOptionClick ),
		createOption( 'Delete', onDeleteOptionClick ),
		createDivider(),

		createOption( 'Convert', onConvertOptionClick ),
		createOption( 'Flatten', onFlattenOptionClick )
	];

	var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

	return UI.MenubarHelper.createMenuContainer( 'Edit', optionsPanel );
}
