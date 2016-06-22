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

	// Undo

	var undo = new UI.Row();
	undo.setClass( 'option' );
	undo.setTextContent( 'Undo (Ctrl+Z)' );
	undo.onClick( function () {

		editor.undo();

	} );
	options.add( undo );

	// Redo

	var redo = new UI.Row();
	redo.setClass( 'option' );
	redo.setTextContent( 'Redo (Ctrl+Shift+Z)' );
	redo.onClick( function () {

		editor.redo();

	} );
	options.add( redo );

	// Clear History

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Clear History' );
	option.onClick( function () {

		if ( confirm( 'The Undo/Redo History will be cleared. Are you sure?' ) ) {

			editor.history.clear();

		}

	} );
	options.add( option );


	editor.signals.historyChanged.add( function () {

		var history = editor.history;

		undo.setClass( 'option' );
		redo.setClass( 'option' );

		if ( history.undos.length == 0 ) {

			undo.setClass( 'inactive' );

		}

		if ( history.redos.length == 0 ) {

			redo.setClass( 'inactive' );

		}

	} );

	// ---

	options.add( new UI.HorizontalRule() );

	// Clone

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Clone' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object.parent === null ) return; // avoid cloning the camera or scene

		object = object.clone();

		editor.execute( new AddObjectCommand( object ) );

	} );
	options.add( option );

	// Delete

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Delete (Del)' );
	option.onClick( function () {

		var object = editor.selected;

		if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		var parent = object.parent;
		if ( parent === undefined ) return; // avoid deleting the camera or scene

		editor.execute( new RemoveObjectCommand( object ) );

	} );
	options.add( option );

	// Minify shaders

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Minify Shaders' );
	option.onClick( function() {

		var root = editor.selected || editor.scene;

		var errors = [];
		var nMaterialsChanged = 0;

		var path = [];

		function getPath ( object ) {

			path.length = 0;

			var parent = object.parent;
			if ( parent !== undefined ) getPath( parent );

			path.push( object.name || object.uuid );

			return path;

		}

		var cmds = [];
		root.traverse( function ( object ) {

			var material = object.material;

			if ( material instanceof THREE.ShaderMaterial ) {

				try {

					var shader = glslprep.minifyGlsl( [
							material.vertexShader, material.fragmentShader ] );

					cmds.push( new SetMaterialValueCommand( object, 'vertexShader', shader[ 0 ] ) );
					cmds.push( new SetMaterialValueCommand( object, 'fragmentShader', shader[ 1 ] ) );

					++nMaterialsChanged;

				} catch ( e ) {

					var path = getPath( object ).join( "/" );

					if ( e instanceof glslprep.SyntaxError )

						errors.push( path + ":" +
								e.line + ":" + e.column + ": " + e.message );

					else {

						errors.push( path +
								": Unexpected error (see console for details)." );

						console.error( e.stack || e );

					}

				}

			}

		} );

		if ( nMaterialsChanged > 0 ) {

			editor.execute( new MultiCmdsCommand( cmds ), 'Minify Shaders' );

		}

		window.alert( nMaterialsChanged +
				" material(s) were changed.\n" + errors.join( "\n" ) );

	} );
	options.add( option );


	return container;

};
