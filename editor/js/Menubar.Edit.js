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

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Undo' );
	option.onClick( function () {

		editor.history.undo();

	} );
	options.add( option );

	// Redo

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Redo' );
	option.onClick( function () {

		editor.history.redo();

	} );
	options.add( option );

	// ---

	options.add( new UI.HorizontalRule() );

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

		var object = editor.selected;

		if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		var parent = object.parent;
		editor.removeObject( object );
		editor.select( parent );

	} );
	options.add( option );

	// Minify shaders

	var option = new UI.Panel();
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

		root.traverse( function ( object ) {

			var material = object.material;

			if ( material instanceof THREE.ShaderMaterial ) {

				try {

					var shader = glslprep.minifyGlsl( [
							material.vertexShader, material.fragmentShader ] );

					material.vertexShader = shader[ 0 ];
					material.fragmentShader = shader[ 1 ];

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

		window.alert( nMaterialsChanged +
				" material(s) were changed.\n" + errors.join( "\n" ) );

	} );
	options.add( option );


	return container;

};
