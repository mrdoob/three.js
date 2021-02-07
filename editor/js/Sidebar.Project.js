import { UIPanel, UIRow, UIInput, UICheckbox, UIText, UISpan } from './libs/ui.js';

import { SidebarProjectMaterials } from './Sidebar.Project.Materials.js';
import { SidebarProjectRenderer } from './Sidebar.Project.Renderer.js';

function SidebarProject( editor ) {

	var config = editor.config;
	var strings = editor.strings;

	var container = new UISpan();

	var projectsettings = new UIPanel();
	projectsettings.setBorderTop( '0' );
	projectsettings.setPaddingTop( '20px' );

	container.add( projectsettings );

	// Title

	var titleRow = new UIRow();
	var title = new UIInput( config.getKey( 'project/title' ) ).setLeft( '100px' ).setWidth( '150px' ).onChange( function () {

		config.setKey( 'project/title', this.getValue() );

	} );

	titleRow.add( new UIText( strings.getKey( 'sidebar/project/title' ) ).setWidth( '90px' ) );
	titleRow.add( title );

	projectsettings.add( titleRow );

	// Editable

	var editableRow = new UIRow();
	var editable = new UICheckbox( config.getKey( 'project/editable' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/editable', this.getValue() );

	} );

	editableRow.add( new UIText( strings.getKey( 'sidebar/project/editable' ) ).setWidth( '90px' ) );
	editableRow.add( editable );

	projectsettings.add( editableRow );

	// WebVR

	var vrRow = new UIRow();
	var vr = new UICheckbox( config.getKey( 'project/vr' ) ).setLeft( '100px' ).onChange( function () {

		config.setKey( 'project/vr', this.getValue() );

	} );

	vrRow.add( new UIText( strings.getKey( 'sidebar/project/vr' ) ).setWidth( '90px' ) );
	vrRow.add( vr );

	projectsettings.add( vrRow );

	//

	container.add( new SidebarProjectMaterials( editor ) );
	container.add( new SidebarProjectRenderer( editor ) );

	return container;

}

export { SidebarProject };
