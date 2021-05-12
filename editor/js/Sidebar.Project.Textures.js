import { UIPanel, UIListbox } from './libs/ui.js';
import { TexturePropertiesPanel } from './Properties.Texture.js';

function SidebarProjectTextures( editor ) {

	var signals = editor.signals;

	var container = new UIPanel();
	container.setBorderTop( '0' );

	// Texture List Box
	var listbox = new UIListbox();
	listbox.onChange( function ( ) {

		var texture = editor.textures[ listbox.getValue() ];
		texturePropertiesPanel.setTexture( texture );
		if ( texture ) {

			texturePropertiesPanel.setDisplay( '' );

		} else {

			texturePropertiesPanel.setDisplay( 'none' );

		}

	} );
	container.add( listbox );

	var texturePropertiesPanel = new TexturePropertiesPanel( editor );

	container.add( texturePropertiesPanel );

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
