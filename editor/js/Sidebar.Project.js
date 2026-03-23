import { UISpan } from './libs/ui.js';

import { SidebarProjectApp } from './Sidebar.Project.App.js';
import { SidebarProjectRenderer } from './Sidebar.Project.Renderer.js';
import { SidebarProjectResources } from './Sidebar.Project.Resources.js';

function SidebarProject( editor ) {

	const container = new UISpan();

	container.add( new SidebarProjectRenderer( editor ) );

	container.add( new SidebarProjectApp( editor ) );

	container.add( new SidebarProjectResources( editor ) );

	return container;

}

export { SidebarProject };
