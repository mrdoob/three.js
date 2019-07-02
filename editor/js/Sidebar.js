/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIPanel, UIDiv, UISpan, UIText } from './libs/ui.js';

import { SidebarScene } from './Sidebar.Scene.js';
import { SidebarProperties } from './Sidebar.Properties.js';
import { SidebarScript } from './Sidebar.Script.js';
import { SidebarAnimation } from './Sidebar.Animation.js';
import { SidebarProject } from './Sidebar.Project.js';
import { SidebarHistory } from './Sidebar.History.js';
import { SidebarSettings } from './Sidebar.Settings.js';

var Sidebar = function ( editor ) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setId( 'sidebar' );

	//

	var sceneTab = new UIText( strings.getKey( 'sidebar/scene' ) ).setTextTransform( 'uppercase' );
	sceneTab.onClick( function () {

		select( 'SCENE' );

	} );

	var projectTab = new UIText( strings.getKey( 'sidebar/project' ) ).setTextTransform( 'uppercase' );
	projectTab.onClick( function () {

		select( 'PROJECT' );

	 } );

	var settingsTab = new UIText( strings.getKey( 'sidebar/settings' ) ).setTextTransform( 'uppercase' );
	settingsTab.onClick( function () {

		select( 'SETTINGS' );

	 } );

	var tabs = new UIDiv();
	tabs.setId( 'tabs' );
	tabs.add( sceneTab, projectTab, settingsTab );
	container.add( tabs );

	//

	var scene = new UISpan().add(
		new SidebarScene( editor ),
		new SidebarProperties( editor ),
		new SidebarAnimation( editor ),
		new SidebarScript( editor )
	);
	container.add( scene );

	var project = new UISpan().add(
		new SidebarProject( editor )
	);
	container.add( project );

	var settings = new UISpan().add(
		new SidebarSettings( editor ),
		new SidebarHistory( editor )
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

export { Sidebar };
