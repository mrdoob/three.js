import { UIBreak, UIPanel, UIRow, UIText, UIListbox, UIButton } from './libs/ui.js';

import { SetMaterialCommand } from './commands/SetMaterialCommand.js';

function SidebarProjectMaterials( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/materials' ).toUpperCase() ) );

	container.add( headerRow );

	const listbox = new UIListbox();
	container.add( listbox );

	container.add( new UIBreak() );

	const buttonsRow = new UIRow();
	container.add( buttonsRow );

	const assignMaterial = new UIButton( strings.getKey( 'sidebar/project/Assign' ) );
	assignMaterial.onClick( function () {

		const selectedObject = editor.selected;

		if ( selectedObject !== null ) {

			const oldMaterial = selectedObject.material;

			// only passing materials to objects with a material property (e.g. avoid assigning material to THREE.Group)

			if ( oldMaterial !== undefined ) {

				const material = editor.getMaterialById( parseInt( listbox.getValue() ) );

				if ( material !== undefined ) {

					editor.removeMaterial( oldMaterial );
					editor.execute( new SetMaterialCommand( editor, selectedObject, material ) );
					editor.addMaterial( material );

				}

			}

		}

	} );
	buttonsRow.add( assignMaterial );

	// Signals

	function refreshMaterialBrowserUI() {

		listbox.setItems( Object.values( editor.materials ) );

	}

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			const index = Object.values( editor.materials ).indexOf( object.material );
			listbox.selectIndex( index );

		}

	} );

	signals.materialAdded.add( refreshMaterialBrowserUI );
	signals.materialChanged.add( refreshMaterialBrowserUI );
	signals.materialRemoved.add( refreshMaterialBrowserUI );

	return container;

}

export { SidebarProjectMaterials };
