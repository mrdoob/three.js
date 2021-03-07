import { UIPanel, UIRow, UIText, UIListbox, UIInput } from './libs/ui.js';

function SidebarProjectTextures( editor ) {

	var signals = editor.signals;
	var strings = editor.strings;

	var selectedTexture = null;

	var container = new UIPanel();

	// Texture List Box
	var listbox = new UIListbox();
	listbox.onChange( function ( ) {

		var texture = editor.textures[ listbox.getValue() ];

		if ( texture ) {

			selectedTexture = texture;
			propertiesContainer.setDisplay( '' );
			refreshPropertiesUI();

		} else {

			selectedTexture = null;
			propertiesContainer.setDisplay( 'none' );
			refreshPropertiesUI();

		}

	} );
	container.add( listbox );

	// Properties Container
	var propertiesContainer = new UIPanel();
	propertiesContainer.setPaddingLeft( 0 ).setPaddingRight( 0 );
	propertiesContainer.setDisplay( 'none' );

	container.add( propertiesContainer );

	// name

	var textureRowName = new UIRow();
	var textureName = new UIInput().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.execute( /* */ );

	} );
	textureName.setValue( '' );

	textureRowName.add( new UIText( strings.getKey( 'sidebar/texture/name' ) ).setWidth( '90px' ) );
	textureRowName.add( textureName );

	propertiesContainer.add( textureRowName );

	// anisotropy
	var anisotropyRow = new UIRow();
	anisotropyRow.add( new UIText( strings.getKey( 'sidebar/texture/anisotropy' ) ).setWidth( '90px' ) );

	// center
	var centerRow = new UIRow();
	centerRow.add( new UIText( strings.getKey( 'sidebar/texture/center' ) ).setWidth( '90px' ) );

	propertiesContainer.add( centerRow );

	// encoding
	var encodingRow = new UIRow();
	encodingRow.add( new UIText( strings.getKey( 'sidebar/texture/encoding' ) ).setWidth( '90px' ) );

	propertiesContainer.add( encodingRow );

	// flip
	var flipRow = new UIRow();
	flipRow.add( new UIText( strings.getKey( 'sidebar/texture/flipY' ) ).setWidth( '90px' ) );

	propertiesContainer.add( flipRow );

	// format
	var formatRow = new UIRow();
	formatRow.add( new UIText( strings.getKey( 'sidebar/texture/format' ) ).setWidth( '90px' ) );

	propertiesContainer.add( formatRow );

	// magFilter
	var magFilterRow = new UIRow();
	magFilterRow.add( new UIText( strings.getKey( 'sidebar/texture/magFilter' ) ).setWidth( '90px' ) );

	propertiesContainer.add( magFilterRow );

	// minFilter
	var minFilterRow = new UIRow();
	minFilterRow.add( new UIText( strings.getKey( 'sidebar/texture/minFilter' ) ).setWidth( '90px' ) );

	propertiesContainer.add( minFilterRow );

	// offset
	var offsetRow = new UIRow();
	offsetRow.add( new UIText( strings.getKey( 'sidebar/texture/offset' ) ).setWidth( '90px' ) );

	propertiesContainer.add( offsetRow );

	// premultiplyAlpha
	var premultiplyAlphaRow = new UIRow();
	premultiplyAlphaRow.add( new UIText( strings.getKey( 'sidebar/texture/premultiplyAlpha' ) ).setWidth( '150px' ) );

	propertiesContainer.add( premultiplyAlphaRow );

	// repeat
	var repeatRow = new UIRow();
	repeatRow.add( new UIText( strings.getKey( 'sidebar/texture/repeat' ) ).setWidth( '90px' ) );

	propertiesContainer.add( repeatRow );

	// rotation
	var rotationRow = new UIRow();
	rotationRow.add( new UIText( strings.getKey( 'sidebar/texture/rotation' ) ).setWidth( '90px' ) );

	propertiesContainer.add( rotationRow );

	// type
	var typeRow = new UIRow();
	typeRow.add( new UIText( strings.getKey( 'sidebar/texture/type' ) ).setWidth( '90px' ) );

	propertiesContainer.add( typeRow );

	// unpackAlignment
	var unpackAlignmentRow = new UIRow();
	unpackAlignmentRow.add( new UIText( strings.getKey( 'sidebar/texture/unpackAlignment' ) ).setWidth( '150px' ) );

	propertiesContainer.add( unpackAlignmentRow );

	// wrapS
	var wrapSRow = new UIRow();
	wrapSRow.add( new UIText( strings.getKey( 'sidebar/texture/wrapS' ) ).setWidth( '90px' ) );

	propertiesContainer.add( wrapSRow );

	// wrapT
	var wrapTRow = new UIRow();
	wrapTRow.add( new UIText( strings.getKey( 'sidebar/texture/wrapT' ) ).setWidth( '90px' ) );

	propertiesContainer.add( wrapTRow );

	// functions

	function update( ) {
		//
	}

	function refreshPropertiesUI( ) {

		if ( selectedTexture === null ) return;

		textureName.setValue( selectedTexture.name );

	}

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
