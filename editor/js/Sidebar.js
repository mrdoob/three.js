import { UITabbedPanel, UISpan } from './libs/ui.js';

import { SidebarScene } from './Sidebar.Scene.js';
import { SidebarProperties } from './Sidebar.Properties.js';
import { SidebarProject } from './Sidebar.Project.js';
import { SidebarSettings } from './Sidebar.Settings.js';

function Sidebar( editor ) {

	const strings = editor.strings;

	const container = new UITabbedPanel();
	container.setId( 'sidebar' );

	const sidebarProperties = new SidebarProperties( editor );

	const scene = new UISpan().add(
		new SidebarScene( editor ),
		sidebarProperties
	);
	const project = new SidebarProject( editor );
	const settings = new SidebarSettings( editor );

	container.addTab( 'scene', strings.getKey( 'sidebar/scene' ), scene );
	container.addTab( 'project', strings.getKey( 'sidebar/project' ), project );
	container.addTab( 'settings', strings.getKey( 'sidebar/settings' ), settings );
	container.select( 'scene' );

	const sidebarPropertiesResizeObserver = new ResizeObserver( function () {

		sidebarProperties.tabsDiv.setWidth( getComputedStyle( container.dom ).width );

	} );

	sidebarPropertiesResizeObserver.observe( container.tabsDiv.dom );

	return container;

}

export { Sidebar };
