import { UIPanel, UIRow, UIText, UIListbox, UIInput, UINumber, UICheckbox, UISelect } from './libs/ui.js';
import { SetTextureValueCommand } from './commands/SetTextureValueCommand.js';

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

		if ( selectedTexture === null ) return;

		editor.execute( new SetTextureValueCommand( editor, selectedTexture, 'name', textureName.getValue() ) );

		refreshPropertiesUI( );
		refreshTextureBrowserUI( );

	} );
	textureName.setValue( '' );

	textureRowName.add( new UIText( strings.getKey( 'sidebar/texture/name' ) ).setWidth( '90px' ) );
	textureRowName.add( textureName );

	propertiesContainer.add( textureRowName );

	// anisotropy
	var anisotropyRow = new UIRow();
	var anisotropy = new UINumber( 0.5 ).setWidth( '60px' ).setRange( 0, 1 ).onChange( function ( ) {



	} );
	anisotropyRow.add( new UIText( strings.getKey( 'sidebar/texture/anisotropy' ) ).setWidth( '90px' ) );
	anisotropyRow.add( anisotropy );

	propertiesContainer.add( anisotropyRow );

	// encoding
	var encodingRow = new UIRow();

	var encoding = new UISelect().setOptions( {

		0: strings.getKey( 'sidebar/textures/encoding/linear' ),
		1: strings.getKey( 'sidebar/textures/encoding/srgb' ),
		2: strings.getKey( 'sidebar/textures/encoding/gamma' ),
		3: strings.getKey( 'sidebar/textures/encoding/rgbe' ),
		4: strings.getKey( 'sidebar/textures/encoding/logluv' ),
		5: strings.getKey( 'sidebar/textures/encoding/rbgm7' ),
		6: strings.getKey( 'sidebar/textures/encoding/rgbm16' ),
		7: strings.getKey( 'sidebar/textures/encoding/rgbd' ),
		8: strings.getKey( 'sidebar/textures/encoding/basicdepthpacking' ),
		9: strings.getKey( 'sidebar/textures/encoding/rgbapacking' ),

	} ).setWidth( '150px' ).setFontSize( '14px' );

	encodingRow.add( new UIText( strings.getKey( 'sidebar/texture/encoding' ) ).setWidth( '90px' ) );
	encodingRow.add( encoding );

	propertiesContainer.add( encodingRow );

	// flip
	var flipRow = new UIRow();
	var flipYEnabled = new UICheckbox( false ).onChange( function ( ) {

	} );

	flipRow.add( new UIText( strings.getKey( 'sidebar/texture/flipY' ) ).setWidth( '90px' ) );
	flipRow.add( flipYEnabled );

	propertiesContainer.add( flipRow );

	// format
	var formatRow = new UIRow();
	var format = new UISelect().setOptions( {

	} ).setWidth( '150px' ).setFontSize( '14px' );
	formatRow.add( new UIText( strings.getKey( 'sidebar/texture/format' ) ).setWidth( '90px' ) );
	formatRow.add( format );
	propertiesContainer.add( formatRow );

	// magFilter
	var magFilterRow = new UIRow();
	var magFilter = new UISelect().setOptions( {

	} ).setWidth( '150px' ).setFontSize( '14px' );

	magFilterRow.add( new UIText( strings.getKey( 'sidebar/texture/magFilter' ) ).setWidth( '90px' ) );
	magFilterRow.add( magFilter );
	propertiesContainer.add( magFilterRow );

	// minFilter
	var minFilterRow = new UIRow();
	var minFilter = new UISelect().setOptions( {

	} ).setWidth( '150px' ).setFontSize( '14px' );

	minFilterRow.add( new UIText( strings.getKey( 'sidebar/texture/minFilter' ) ).setWidth( '90px' ) );
	minFilterRow.add( minFilter );
	propertiesContainer.add( minFilterRow );

	// wrapS
	var wrapSRow = new UIRow();
	var wrapS = new UISelect().setOptions( {

	} ).setWidth( '150px' ).setFontSize( '14px' );

	wrapSRow.add( new UIText( strings.getKey( 'sidebar/texture/wrapS' ) ).setWidth( '90px' ) );
	wrapSRow.add( wrapS );

	propertiesContainer.add( wrapSRow );

	// wrapT
	var wrapTRow = new UIRow();
	var wrapT = new UISelect().setOptions( {

	} ).setWidth( '150px' ).setFontSize( '14px' );

	wrapTRow.add( new UIText( strings.getKey( 'sidebar/texture/wrapT' ) ).setWidth( '90px' ) );
	wrapTRow.add( wrapT );
	propertiesContainer.add( wrapTRow );

	// center
	var centerRow = new UIRow();
	var centerX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );
	var centerY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );

	centerRow.add( new UIText( strings.getKey( 'sidebar/texture/center' ) ).setWidth( '90px' ) );
	centerRow.add( centerX );
	centerRow.add( centerY );

	propertiesContainer.add( centerRow );

	// offset
	var offsetRow = new UIRow();
	var offsetX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );
	var offsetY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );

	offsetRow.add( new UIText( strings.getKey( 'sidebar/texture/offset' ) ).setWidth( '90px' ) );
	offsetRow.add( offsetX );
	offsetRow.add( offsetY );

	propertiesContainer.add( offsetRow );

	// repeat
	var repeatRow = new UIRow();
	var repeatX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );
	var repeatY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );

	repeatRow.add( new UIText( strings.getKey( 'sidebar/texture/repeat' ) ).setWidth( '90px' ) );
	repeatRow.add( repeatX );
	repeatRow.add( repeatY );
	propertiesContainer.add( repeatRow );

	// rotation
	var rotationRow = new UIRow();
	var rotationX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );
	var rotationY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );

	rotationRow.add( new UIText( strings.getKey( 'sidebar/texture/rotation' ) ).setWidth( '90px' ) );
	rotationRow.add( rotationX );
	rotationRow.add( rotationY );

	propertiesContainer.add( rotationRow );

	// premultiplyAlpha
	var premultiplyAlphaRow = new UIRow();
	var premultiplyAlpha = new UICheckbox( false ).onChange( function ( ) {

	} );

	premultiplyAlphaRow.add( new UIText( strings.getKey( 'sidebar/texture/premultiplyAlpha' ) ).setWidth( '150px' ) );
	premultiplyAlphaRow.add( premultiplyAlpha );
	propertiesContainer.add( premultiplyAlphaRow );

	// type
	var typeRow = new UIRow();
	var type = new UISelect().setOptions( {

	} ).setWidth( '150px' ).setFontSize( '14px' );

	typeRow.add( new UIText( strings.getKey( 'sidebar/texture/type' ) ).setWidth( '90px' ) );
	typeRow.add( type );
	propertiesContainer.add( typeRow );

	// unpackAlignment
	var unpackAlignmentRow = new UIRow();
	var unpackAlignment = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( function ( ) {

	} );

	unpackAlignmentRow.add( new UIText( strings.getKey( 'sidebar/texture/unpackAlignment' ) ).setWidth( '150px' ) );
	unpackAlignmentRow.add( unpackAlignment );

	propertiesContainer.add( unpackAlignmentRow );

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
