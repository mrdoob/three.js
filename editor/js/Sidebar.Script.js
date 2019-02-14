/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Script = function ( editor ) {

	var strings = editor.strings;

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text( strings.getKey( 'sidebar/script' ) ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );
	container.add( new UI.Break() );

	//

	var scriptsContainer = new UI.Row();
	container.add( scriptsContainer );

	var newScript = new UI.Button( strings.getKey( 'sidebar/script/new' ) );
	newScript.onClick( function () {

		var script = { name: '', source: 'function update( event ) {}' };
		editor.execute( new AddScriptCommand( editor, editor.selected, script ) );

	} );
	container.add( newScript );

	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	var fileInput = document.createElement( 'input' );
	fileInput.multiple = true;
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( ) {

		editor.loader.loadFiles( fileInput.files, onScriptLoad );
		form.reset();

	} );
	form.appendChild( fileInput );

	var loadScript = new UI.Button( strings.getKey( 'sidebar/script/load' ) ).setMarginLeft( '4px' );
	loadScript.onClick( function () {

		fileInput.click();

	} );
	container.add( loadScript );

	//

	function update() {

		scriptsContainer.clear();
		scriptsContainer.setDisplay( 'none' );

		var object = editor.selected;

		if ( object === null ) {

			return;

		}

		var scripts = editor.scripts[ object.uuid ];

		if ( scripts !== undefined && scripts.length > 0 ) {

			scriptsContainer.setDisplay( 'block' );

			for ( var i = 0; i < scripts.length; i ++ ) {

				( function ( object, script ) {

					var name = new UI.Input( script.name ).setWidth( '100px' ).setFontSize( '12px' );
					name.onChange( function () {

						editor.execute( new SetScriptValueCommand( editor, editor.selected, script, 'name', this.getValue() ) );

					} );
					scriptsContainer.add( name );

					var edit = new UI.Button( strings.getKey( 'sidebar/script/edit' ) );
					edit.setMarginLeft( '4px' );
					edit.onClick( function () {

						signals.editScript.dispatch( object, script );

					} );
					scriptsContainer.add( edit );

					var remove = new UI.Button( strings.getKey( 'sidebar/script/remove' ) );
					remove.setMarginLeft( '4px' );
					remove.onClick( function () {

						if ( confirm( 'Are you sure?' ) ) {

							editor.execute( new RemoveScriptCommand( editor, editor.selected, script ) );

						}

					} );
					scriptsContainer.add( remove );

					var save = new UI.Button( strings.getKey( 'sidebar/script/save' ) );
					save.setMarginLeft( '4px' );
					save.onClick( function () {

						var link = document.createElement( 'a' );
						link.style.display = 'none';
						document.body.appendChild( link );

						var output;
						try {

							output = JSON.stringify( script, null, '\t' );
							output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

						} catch ( e ) {

							output = JSON.stringify( script );

						}
						output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
						link.href = URL.createObjectURL( new Blob( [ output ], { type: 'application/json' } ) );
						link.download = 'script.js';
						link.click();
						document.body.removeChild( link );

					} );
					scriptsContainer.add( save );

					scriptsContainer.add( new UI.Break() );

				} )( object, scripts[ i ] );

			}

		}

	}

	function onScriptLoad( data ) {

		editor.execute( new AddScriptCommand( editor.selected, data ) );

	}

	// signals

	signals.objectSelected.add( function ( object ) {

		if ( object !== null && editor.camera !== object ) {

			container.setDisplay( 'block' );

			update();

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.scriptAdded.add( update );
	signals.scriptRemoved.add( update );
	signals.scriptChanged.add( update );

	return container;

};
