/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Script.Editor = function ( editor ) {

	var timeout;

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

			editor.scripts[ object.uuid ] = [ source ];

			editor.signals.objectChanged.dispatch( object );

		}, 500 );

	} );

	return scriptSource;

}
