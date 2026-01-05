
import { UIPanel, UIRow, UIText } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function SidebarSettingsImport( editor ) {

	const strings = editor.strings;
	const config = editor.config;

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/settings/import' ).toUpperCase() ) );
	container.add( headerRow );

	//

	const gltfSceneRow = new UIRow();
	container.add( gltfSceneRow );

	gltfSceneRow.add( new UIText( strings.getKey( 'sidebar/settings/import/gltf/scene' ) ).setWidth( '180px' ).setClass( 'Label' ) );

	const gltfSceneBoolean = new UIBoolean( config.getKey( 'settings/import/gltf/scene' ) );
	gltfSceneBoolean.onChange( function () {

		const value = this.getValue();

		config.setKey( 'settings/import/gltf/scene', value );

	} );

	gltfSceneRow.add( gltfSceneBoolean );

	return container;

}

export { SidebarSettingsImport };
