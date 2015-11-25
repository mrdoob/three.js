/**
 * @author mrdoob / http://mrdoob.com/
 */

var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'sidebar' );

	//

	var tabScene = new UI.Text( 'SCENE' ).onClick( onClick );
	var tabProject = new UI.Text( 'PROJECT' ).onClick( onClick );

	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( tabScene, tabProject );
	container.add( tabs );

	function onClick( event ) {

		select( event.target.textContent );

	}

	//

	var scene = new UI.Span().add(
		new Sidebar.Scene( editor ),
		new Sidebar.Object3D( editor ),
		new Sidebar.Geometry( editor ),
		new Sidebar.Material( editor ),
		new Sidebar.Animation( editor ),
		new Sidebar.Script( editor )
	);
	container.add( scene );

	var project = new UI.Span().add(
		new Sidebar.Project( editor ),
		new Sidebar.History( editor )
	);
	container.add( project );

	function select( section ) {

		switch ( section ) {
			case 'SCENE':
				tabScene.setClass( 'selected' );
				tabProject.setClass( '' );
				project.setDisplay( 'none' );
				scene.setDisplay( '' );
				break;
			case 'PROJECT':
				tabScene.setClass( '' );
				tabProject.setClass( 'selected' );
				project.setDisplay( '' );
				scene.setDisplay( 'none' );
				break;
		}

	}

	select( 'SCENE' );

	return container;

};
