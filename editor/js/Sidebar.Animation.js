/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Animation = function ( editor ) {

	var signals = editor.signals;

	var options = {};
	var possibleAnimations = {};

	var container = new UI.Panel();
	container.setDisplay( 'none' );

	container.add( new UI.Text( 'Animation' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break() );
	container.add( new UI.Break() );

	var animationsRow = new UI.Row();
	container.add( animationsRow );

	return container;

};
