/**
 * @author mrdoob / http://mrdoob.com/
 */

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

	var source = new Sidebar.Script.Editor( editor );
	container.add( source );

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

			/*
			var scripts = editor.scripts[ object.uuid ];

			if ( scripts !== undefined ) {

				scriptSource.setValue( scripts[ 0 ] );

			} else {

				scriptSource.setValue( '' );

			}
			*/

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
