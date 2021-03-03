import { UITabbedPanel } from './libs/ui.js';

import { SidebarProjectMaterials } from './Sidebar.Project.Materials.js';
import { SidebarProjectTextures } from './Sidebar.Project.Textures.js';

function SidebarProjectAssets( editor ) {

	var strings = editor.strings;

	var container = new UITabbedPanel();
	container.setId( 'assets' );

	container.addTab( 'materials', strings.getKey( 'sidebar/assets/materials' ), new SidebarProjectMaterials( editor ) );
	container.addTab( 'textures', strings.getKey( 'sidebar/assets/textures' ), new SidebarProjectTextures( editor ) );

	return container;

}

export { SidebarProjectAssets };
