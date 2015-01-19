/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel().setClass( 'Panel tab' );

	container.add( new UI.Radio( 'tabs' ).setId( 'tab-script' ) );
	container.add( new UI.Label( 'Script' ).setFor( 'tab-script' ) );

	var containercontent = new UI.Panel().setClass( 'Panel' ).setClass( 'Content tab-content' ).setId( 'tab-content-script' );

    /*
	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/script/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/script/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Script' ).setTextTransform( 'uppercase' ) );
	containercontent.add( new UI.Break() );
    */

	//

	var scriptsContainer = new UI.Panel();
	containercontent.add( scriptsContainer );

	var newScript = new UI.Button( 'New' );
	newScript.onClick( function () {

		var script = { name: '', source: 'function update( event ) {}' };
		editor.addScript( editor.selected, script );

	} );
	containercontent.add( newScript );

	/*
	var loadScript = new UI.Button( 'Load' );
	loadScript.setMarginLeft( '4px' );
	container.add( loadScript );
	*/

	//

	function update() {

		scriptsContainer.clear();

		var object = editor.selected;
		var scripts = editor.scripts[ object.uuid ];

		if ( scripts !== undefined ) {

			for ( var i = 0; i < scripts.length; i ++ ) {

				( function ( object, script ) {

					var name = new UI.Input( script.name ).setWidth( '130px' ).setFontSize( '12px' );
					name.onChange( function () {

						script.name = this.getValue();

						signals.scriptChanged.dispatch();

					} );
					scriptsContainer.add( name );

					var edit = new UI.Button( 'Edit' );
					edit.setMarginLeft( '4px' );
					edit.onClick( function () {

						signals.editScript.dispatch( object, script );

					} );
					scriptsContainer.add( edit );

					var remove = new UI.Button( 'Remove' );
					remove.setMarginLeft( '4px' );
					remove.onClick( function () {

						if ( confirm( 'Are you sure?' ) ) {

							editor.removeScript( editor.selected, script );

						}

					} );
					scriptsContainer.add( remove );
					
					scriptsContainer.add( new UI.Break() );

				} )( object, scripts[ i ] )

			}

            // containercontent.add( scriptsContainer );
		}

	}

	// signals

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			//containercontent.setDisplay( 'block' );

			update();

		} else {

			containercontent.setDisplay( 'none' );

		}

	} );

	signals.scriptAdded.add( update );
	signals.scriptRemoved.add( update );

	container.add( containercontent );

	return container;

};
