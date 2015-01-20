/**
 * @author mrdoob / http://mrdoob.com/
 */

var Sidebar = function ( editor ) {

	var container = new UI.Panel().setClass( 'Panel tabs' ).setId( 'sidebar' );

	var tabs = [
		'Renderer',
		'Scene',
		'Object3D',
		'Geometry',
		'Material',
		'Animation',
		'Script'
	];

	for ( var i = 0; i < tabs.length; i ++ ) {

		var name = tabs[ i ];

		var tab = new UI.Panel().setTitle( name ).setClass( 'Panel tab' );

		if ( i === 0 ) {
			tab.add( new UI.Radio( 'tabs' ).setId( 'tab-' + name ).setCheck() );
		}
		else {
			tab.add( new UI.Radio( 'tabs' ).setId( 'tab-' + name ) );
		}

		tab.add( new UI.Label( name ).setFor( 'tab-' + name ) );

		var r = new UI.Panel().setClass( 'Panel' ).setClass( 'Content tab-content' ).setId( 'tab-content-' + name );

		r.add( new Sidebar[name]( editor ) );

		tab.add( r );

		container.add( tab );

	}

	return container;

};
