import { UIPanel, UIRow, UIInput, UICheckbox, UIText, UIListbox, UISpan, UIButton } from './libs/ui.js';

import { SidebarProjectRenderer } from './Sidebar.Project.Renderer.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

function SidebarProject( editor ) {

	var config = editor.config;
	var signals = editor.signals;
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

	// Renderer

	container.add( new SidebarProjectRenderer( editor ) );

	// Materials

	var materials = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/materials' ).toUpperCase() ) );

	materials.add( headerRow );

	var listbox = new UIListbox();
	materials.add( listbox );

	var buttonsRow = new UIRow();
	buttonsRow.setPadding( '10px 0px' );
	materials.add( buttonsRow );

	/*
	var addButton = new UI.Button().setLabel( 'Add' ).setMarginRight( '5px' );
	addButton.onClick( function () {

		editor.addMaterial( new THREE.MeshStandardMaterial() );

	} );
	buttonsRow.add( addButton );
	*/

	var assignMaterial = new UIButton().setLabel( strings.getKey( 'sidebar/project/Assign' ) ).setMargin( '0px 5px' );
	assignMaterial.onClick( function () {

		var selectedObject = editor.selected;

		if ( selectedObject !== null ) {

			var oldMaterial = selectedObject.material;

			// only assing materials to objects with a material property (e.g. avoid assigning material to THREE.Group)

			if ( oldMaterial !== undefined ) {

				var material = editor.getMaterialById( parseInt( listbox.getValue() ) );

				if ( material !== undefined ) {

					editor.removeMaterial( oldMaterial );
					editor.execute( new SetMaterialCommand( editor, selectedObject, material ) );
					editor.addMaterial( material );

				}

			}

		}

	} );
	buttonsRow.add( assignMaterial );

	container.add( materials );

	// signals

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			var index = Object.values( editor.materials ).indexOf( object.material );
			listbox.selectIndex( index );

		}

	} );

	signals.materialAdded.add( refreshMaterialBrowserUI );
	signals.materialChanged.add( refreshMaterialBrowserUI );
	signals.materialRemoved.add( refreshMaterialBrowserUI );

	function refreshMaterialBrowserUI() {

		listbox.setItems( Object.values( editor.materials ) );

	}

	return container;

}

export { SidebarProject };
