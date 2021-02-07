import { UITabbedPanel, UISpan } from './libs/ui.js';

import { SidebarScene } from './Sidebar.Scene.js';
import { SidebarProperties } from './Sidebar.Properties.js';
import { SidebarScript } from './Sidebar.Script.js';
import { SidebarAnimation } from './Sidebar.Animation.js';
import { SidebarProject } from './Sidebar.Project.js';
import { SidebarSettings } from './Sidebar.Settings.js';
import { SidebarSettingsShortcuts } from './Sidebar.Settings.Shortcuts.js';
import { SidebarSettingsHistory } from './Sidebar.Settings.History.js';

function Sidebar( editor ) {

	var strings = editor.strings;

	var container = new UITabbedPanel();
	container.setId( 'sidebar' );

	var scene = new UISpan().add(
		new SidebarScene( editor ),
		new SidebarProperties( editor ),
		new SidebarAnimation( editor ),
		new SidebarScript( editor )
	);

	var project = new SidebarProject( editor );

	var settings = new UISpan().add(
		new SidebarSettings( editor ),
		new SidebarSettingsShortcuts( editor ),
		new SidebarSettingsHistory( editor )
	);

	container.addTab( 'scene', strings.getKey( 'sidebar/scene' ), scene );
	container.addTab( 'project', strings.getKey( 'sidebar/project' ), project );
	container.addTab( 'settings', strings.getKey( 'sidebar/settings' ), settings );
	container.select( 'scene' );

	return container;

}

export { Sidebar };
