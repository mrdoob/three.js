/**
 * @author mrdoob / http://mrdoob.com/
 */

var Sidebar = function ( editor ) {

	var strings = editor.strings;

	var container = new UI.Panel();
	container.setId( 'sidebar' );

	//

	var sceneTab = new UI.Text( strings.getKey( 'sidebar/scene' ) ).setTextTransform( 'uppercase' );
	sceneTab.onClick( function () { select( 'SCENE' ) } );

	var projectTab = new UI.Text( strings.getKey( 'sidebar/project' ) ).setTextTransform( 'uppercase' );
	projectTab.onClick( function () { select( 'PROJECT' ) } );

	var settingsTab = new UI.Text( strings.getKey( 'sidebar/settings' ) ).setTextTransform( 'uppercase' );
	settingsTab.onClick( function () { select( 'SETTINGS' ) } );

	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( sceneTab, projectTab, settingsTab );
	container.add( tabs );

	//

	var scene = new UI.Span().add(
		new Sidebar.Scene( editor ),
		new Sidebar.Properties( editor ),
		new Sidebar.Animation( editor ),
		new Sidebar.Script( editor )
	);
	container.add( scene );

	var project = new UI.Span().add(
		new Sidebar.Project( editor )
	);
	container.add( project );

	var settings = new UI.Span().add(
		new Sidebar.Settings( editor ),
		new Sidebar.History( editor )
	);
	container.add( settings );

	//

	function select( section ) {

		sceneTab.setClass( '' );
		projectTab.setClass( '' );
		settingsTab.setClass( '' );

		scene.setDisplay( 'none' );
		project.setDisplay( 'none' );
		settings.setDisplay( 'none' );

		switch ( section ) {
			case 'SCENE':
				sceneTab.setClass( 'selected' );
				scene.setDisplay( '' );
				break;
			case 'PROJECT':
				projectTab.setClass( 'selected' );
				project.setDisplay( '' );
				break;
			case 'SETTINGS':
				settingsTab.setClass( 'selected' );
				settings.setDisplay( '' );
				break;
		}

	}

	select( 'SCENE' );

	return container;

};
