import { UIBreak, UIPanel, UIRow, UIText, UIListbox } from './libs/ui.js';

function SidebarProjectTextures( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var container = new UIPanel();

	var listbox = new UIListbox();
	container.add( listbox );

	container.add( new UIBreak() );

	// Signals

	function refreshTextureBrowserUI() {

		listbox.setItems( Object.values( editor.textures ) );

	}

	signals.textureAdded.add( refreshTextureBrowserUI );
	signals.textureChanged.add( refreshTextureBrowserUI );
	signals.textureRemoved.add( refreshTextureBrowserUI );

	return container;

}

export { SidebarProjectTextures };
