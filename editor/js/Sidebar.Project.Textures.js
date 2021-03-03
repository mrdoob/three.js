import { UIBreak, UIPanel, UIRow, UIText, UIListbox } from './libs/ui.js';

function SidebarProjectTextures( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/project/textures' ).toUpperCase() ) );

	container.add( headerRow );

	var listbox = new UIListbox();
	container.add( listbox );

	container.add( new UIBreak() );

	var buttonsRow = new UIRow();
	container.add( buttonsRow );

	// Signals

	function refreshMaterialBrowserUI() {

		listbox.setItems( Object.values( editor.materials ) );

	}

	signals.textureAdded.add( refreshMaterialBrowserUI );
	signals.textureChanged.add( refreshMaterialBrowserUI );
	signals.textureRemoved.add( refreshMaterialBrowserUI );

	return container;

}

export { SidebarProjectTextures };
