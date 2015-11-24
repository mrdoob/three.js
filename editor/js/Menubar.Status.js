/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Status = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu right' );

	var checkbox = new UI.Checkbox( editor.config.getKey( 'autosave' ) );
	checkbox.onChange( function () {

		var value = this.getValue();

		editor.config.setKey( 'autosave', value );

		if ( value === true ) {

			editor.signals.sceneGraphChanged.dispatch();

		}

	} );
	container.add( checkbox );

	var text = new UI.Text( 'autosave' );
	text.setClass( 'title' );
	container.add( text );

	editor.signals.savingStarted.add( function () {

		text.setTextDecoration( 'underline' );

	} );

	editor.signals.savingFinished.add( function () {

		text.setTextDecoration( 'none' );

	} );

	var version = new UI.Text( 'r' + THREE.REVISION );
	version.setClass( 'title' );
	version.setOpacity( 0.5 );
	container.add( version );

	return container;

};
