Sidebar.Script = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.CollapsiblePanel();
	container.setCollapsed( editor.config.getKey( 'ui/sidebar/script/collapsed' ) );
	container.onCollapsedChange( function ( boolean ) {

		editor.config.setKey( 'ui/sidebar/script/collapsed', boolean );

	} );
	container.setDisplay( 'none' );

	container.addStatic( new UI.Text( 'Script' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );

	var scriptsRow = new UI.Panel();
	container.add( scriptsRow );

	// source

	var timeout;

	var scriptSourceRow = new UI.Panel();
	var scriptSource = new UI.TextArea( 'javascript' ).setWidth( '240px' ).setHeight( '180px' ).setFontSize( '12px' );
	scriptSource.onKeyUp( function () {

		clearTimeout( timeout );

		timeout = setTimeout( function () {

			var object = editor.selected;
			var source = scriptSource.getValue();

			try {

				var script = new Function( 'scene', 'time', source ).bind( object.clone() );
				script( new THREE.Scene(), 0 );

				scriptSource.dom.classList.add( 'success' );
				scriptSource.dom.classList.remove( 'fail' );

			} catch ( error ) {

				scriptSource.dom.classList.remove( 'success' );
				scriptSource.dom.classList.add( 'fail' );

				return;

			}

			object.script = new THREE.Script( source );

			editor.signals.objectChanged.dispatch( object );

		}, 500 );

	} );	

	scriptSourceRow.add( scriptSource );

	container.add( scriptSourceRow );

	//

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

			if ( object.script !== undefined ) {

				scriptSource.setValue( object.script.source );

			} else {

				scriptSource.setValue( '' );

			}

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
