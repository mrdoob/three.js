import { UIPanel, UIRow, UIText, UIListbox, UIInput, UINumber, UICheckbox, UISelect } from './libs/ui.js';
import { SetTextureValueCommand } from './commands/SetTextureValueCommand.js';
import { SetTextureVectorCommand } from './commands/SetTextureVectorCommand.js';

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

	// encoding
	var encodingRow = new UIRow();

	var encoding = new UISelect().setOptions( {

		3000: strings.getKey( 'sidebar/texture/encoding/linear' ),
		3001: strings.getKey( 'sidebar/texture/encoding/srgb' ),
		3007: strings.getKey( 'sidebar/texture/encoding/gamma' ),
		3002: strings.getKey( 'sidebar/texture/encoding/rgbe' ),
		3003: strings.getKey( 'sidebar/texture/encoding/logluv' ),
		3004: strings.getKey( 'sidebar/texture/encoding/rbgm7' ),
		3005: strings.getKey( 'sidebar/texture/encoding/rgbm16' ),
		3006: strings.getKey( 'sidebar/texture/encoding/rgbd' ),
		3200: strings.getKey( 'sidebar/texture/encoding/basicdepthpacking' ),
		3201: strings.getKey( 'sidebar/texture/encoding/rgbapacking' ),

	} ).setWidth( '150px' ).setFontSize( '14px' ).onChange( update );

	encodingRow.add( new UIText( strings.getKey( 'sidebar/texture/encoding' ) ).setWidth( '90px' ) );
	encodingRow.add( encoding );

	propertiesContainer.add( encodingRow );

	// magFilter
	var magFilterRow = new UIRow();
	var magFilter = new UISelect().setOptions( {
		1003: strings.getKey( 'sidebar/texture/magfilter/nearest' ),
		1006: strings.getKey( 'sidebar/texture/magfilter/linear' )
	} ).setWidth( '150px' ).setFontSize( '14px' );

	magFilterRow.add( new UIText( strings.getKey( 'sidebar/texture/magFilter' ) ).setWidth( '90px' ) );
	magFilterRow.add( magFilter );
	propertiesContainer.add( magFilterRow );

	// minFilter
	var minFilterRow = new UIRow();
	var minFilter = new UISelect().setOptions( {
		1003: strings.getKey( 'sidebar/texture/minfilter/nearest' ),
		1004: strings.getKey( 'sidebar/texture/minfilter/nearestmipmapnearest' ),
		1005: strings.getKey( 'sidebar/texture/minfilter/nearestmipmaplinear' ),
		1006: strings.getKey( 'sidebar/texture/minfilter/linear' ),
		1007: strings.getKey( 'sidebar/texture/minfilter/linearmipmapnearest' ),
		1008: strings.getKey( 'sidebar/texture/minfilter/linearmipmaplinear' ),
	} ).setWidth( '150px' ).setFontSize( '14px' );

	minFilterRow.add( new UIText( strings.getKey( 'sidebar/texture/minFilter' ) ).setWidth( '90px' ) );
	minFilterRow.add( minFilter );
	propertiesContainer.add( minFilterRow );

	// flip
	var flipRow = new UIRow();
	var flipYEnabled = new UICheckbox( false ).onChange( update );

	flipRow.add( new UIText( strings.getKey( 'sidebar/texture/flipY' ) ).setWidth( '90px' ) );
	flipRow.add( flipYEnabled );

	propertiesContainer.add( flipRow );

	// wrapS
	var wrapSRow = new UIRow();
	var wrapS = new UISelect().setOptions( {
		1000: strings.getKey( 'sidebar/texture/wrapping/repeat' ),
		1001: strings.getKey( 'sidebar/texture/wrapping/calmptoedge' ),
		1002: strings.getKey( 'sidebar/texture/wrapping/mirroredrepeat' ),
	} ).setWidth( '150px' ).setFontSize( '14px' ).onChange( update );

	wrapSRow.add( new UIText( strings.getKey( 'sidebar/texture/wrapS' ) ).setWidth( '90px' ) );
	wrapSRow.add( wrapS );

	propertiesContainer.add( wrapSRow );

	// wrapT
	var wrapTRow = new UIRow();
	var wrapT = new UISelect().setOptions( {
		1000: strings.getKey( 'sidebar/texture/wrapping/repeat' ),
		1001: strings.getKey( 'sidebar/texture/wrapping/calmptoedge' ),
		1002: strings.getKey( 'sidebar/texture/wrapping/mirroredrepeat' ),
	} ).setWidth( '150px' ).setFontSize( '14px' ).onChange( update );

	wrapTRow.add( new UIText( strings.getKey( 'sidebar/texture/wrapT' ) ).setWidth( '90px' ) );
	wrapTRow.add( wrapT );
	propertiesContainer.add( wrapTRow );

	// center
	var centerRow = new UIRow();
	var centerX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( update );
	var centerY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( update );

	centerRow.add( new UIText( strings.getKey( 'sidebar/texture/center' ) ).setWidth( '90px' ) );
	centerRow.add( centerX );
	centerRow.add( centerY );

	propertiesContainer.add( centerRow );

	// offset
	var offsetRow = new UIRow();
	var offsetX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );
	var offsetY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );

	offsetRow.add( new UIText( strings.getKey( 'sidebar/texture/offset' ) ).setWidth( '90px' ) );
	offsetRow.add( offsetX );
	offsetRow.add( offsetY );

	propertiesContainer.add( offsetRow );

	// repeat
	var repeatRow = new UIRow();
	var repeatX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );
	var repeatY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );

	repeatRow.add( new UIText( strings.getKey( 'sidebar/texture/repeat' ) ).setWidth( '90px' ) );
	repeatRow.add( repeatX );
	repeatRow.add( repeatY );
	propertiesContainer.add( repeatRow );

	// rotation
	var rotationRow = new UIRow();
	var rotationX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );
	var rotationY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );

	rotationRow.add( new UIText( strings.getKey( 'sidebar/texture/rotation' ) ).setWidth( '90px' ) );
	rotationRow.add( rotationX );
	rotationRow.add( rotationY );

	propertiesContainer.add( rotationRow );

	// premultiplyAlpha
	var premultiplyAlphaRow = new UIRow();
	var premultiplyAlpha = new UICheckbox( false ).onChange( update );

	premultiplyAlphaRow.add( new UIText( strings.getKey( 'sidebar/texture/premultiplyAlpha' ) ).setWidth( '150px' ) );
	premultiplyAlphaRow.add( premultiplyAlpha );
	propertiesContainer.add( premultiplyAlphaRow );

	// functions

	function update( ) {

		var texture = selectedTexture;

		if ( texture === null ) return;

		if ( texture.name !== undefined && texture.name !== textureName.getValue() ) {

			editor.execute( new SetTextureValueCommand( editor, texture, 'name', textureName.getValue() ) );

		}

		if ( texture.encoding !== parseInt( encoding.getValue() ) ) {

			editor.execute( new SetTextureValueCommand( editor, texture, 'encoding', parseInt( encoding.getValue() ) ) );

		}

		if ( texture.wrapS !== parseInt( wrapS.getValue() ) ) {

			editor.execute( new SetTextureValueCommand( editor, texture, 'wrapS', parseInt( wrapS.getValue() ) ) );

		}

		if ( texture.wrapT !== parseInt( wrapT.getValue() ) ) {

			editor.execute( new SetTextureValueCommand( editor, texture, 'wrapT', parseInt( wrapT.getValue() ) ) );

		}

		if ( texture.flipY !== flipYEnabled.getValue() ) {

			editor.execute( new SetTextureValueCommand( editor, texture, 'flipY', flipYEnabled.getValue() ) );

		}

		if ( texture.premultiplyAlpha !== premultiplyAlpha.getValue() ) {

			editor.execute( new SetTextureValueCommand( editor, texture, 'premultiplyAlpha', premultiplyAlpha.getValue() ) );

		}

		if ( texture.offset.x !== offsetX.getValue() || texture.offset.y !== offsetY.getValue() ) {

			const value = [
				offsetX.getValue(),
				offsetY.getValue(),
			];
			editor.execute( new SetTextureVectorCommand( editor, texture, 'offset', value ) );

		}

		if ( texture.center.x !== centerX.getValue() || texture.center.y !== centerY.getValue() ) {

			const value = [
				centerX.getValue(),
				centerY.getValue(),
			];
			editor.execute( new SetTextureVectorCommand( editor, texture, 'center', value ) );

		}

		if ( texture.repeat.x !== repeatX.getValue() || texture.repeat.y !== repeatY.getValue() ) {

			const value = [
				repeatX.getValue(),
				repeatY.getValue(),
			];
			editor.execute( new SetTextureVectorCommand( editor, texture, 'repeat', value ) );

		}

		refreshPropertiesUI();

	}

	function refreshPropertiesUI( ) {

		if ( selectedTexture === null ) return;

		textureName.setValue( selectedTexture.name );

		encoding.setValue( selectedTexture.encoding );
		magFilter.setValue( selectedTexture.magFilter );
		minFilter.setValue( selectedTexture.minFilter );

		// Update the wrapping
		wrapS.setValue( selectedTexture.wrapS );
		wrapT.setValue( selectedTexture.wrapT );

		offsetX.setValue( selectedTexture.offset.x );
		offsetY.setValue( selectedTexture.offset.y );

		centerX.setValue( selectedTexture.center.x );
		centerY.setValue( selectedTexture.center.y );

		repeatX.setValue( selectedTexture.repeat.x );
		repeatY.setValue( selectedTexture.repeat.y );

		flipYEnabled.setValue( selectedTexture.flipY );

		premultiplyAlpha.setValue( selectedTexture.premultiplyAlpha );

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
