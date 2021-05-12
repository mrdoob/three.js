import { SetTextureValueCommand } from './commands/SetTextureValueCommand.js';
import { SetTextureVectorCommand } from './commands/SetTextureVectorCommand.js';
import { UICheckbox, UIInput, UINumber, UIPanel, UIRow, UISelect, UIText } from './libs/ui.js';
import { UITexture } from './libs/ui.three.js';

class TexturePropertiesPanel extends UIPanel {

	constructor( editor ) {

		super();
		var that = this;
		this.editor = editor;
		that.selectedTexture = null;

		// Preview
		var previewRow = new UIRow();

		this.preview = new UITexture();
		this.preview.dom.childNodes[ 0 ].width = this.preview.dom.childNodes[ 0 ].height = 32;
		previewRow.add( this.preview );

		this.textureUUID = new UIInput().setWidth( '170px' ).setFontSize( '12px' ).setDisabled( true );
		previewRow.add( this.textureUUID );

		this.add( previewRow );

		// name

		var textureRowName = new UIRow();
		this.textureName = new UIInput().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

			if ( that.selectedTexture === null ) return;

			editor.execute( new SetTextureValueCommand( editor, that.selectedTexture, 'name', that.textureName.getValue() ) );

			that.refreshPropertiesUI( );

		} );
		this.textureName.setValue( '' );

		textureRowName.add( new UIText( editor.strings.getKey( 'sidebar/texture/name' ) ).setWidth( '90px' ) );
		textureRowName.add( this.textureName );

		this.add( textureRowName );

		// encoding
		var encodingRow = new UIRow();
		this.encoding = new UISelect().setOptions( {

			3000: editor.strings.getKey( 'sidebar/texture/encoding/linear' ),
			3001: editor.strings.getKey( 'sidebar/texture/encoding/srgb' ),
			3007: editor.strings.getKey( 'sidebar/texture/encoding/gamma' ),
			3002: editor.strings.getKey( 'sidebar/texture/encoding/rgbe' ),
			3003: editor.strings.getKey( 'sidebar/texture/encoding/logluv' ),
			3004: editor.strings.getKey( 'sidebar/texture/encoding/rbgm7' ),
			3005: editor.strings.getKey( 'sidebar/texture/encoding/rgbm16' ),
			3006: editor.strings.getKey( 'sidebar/texture/encoding/rgbd' ),
			3200: editor.strings.getKey( 'sidebar/texture/encoding/basicdepthpacking' ),
			3201: editor.strings.getKey( 'sidebar/texture/encoding/rgbapacking' ),

		} ).setWidth( '150px' ).setFontSize( '14px' ).onChange( update );

		encodingRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/encoding' ) ).setWidth( '90px' ) );
		encodingRow.add( this.encoding );

		this.add( encodingRow );

		// magFilter
		var magFilterRow = new UIRow();
		this.magFilter = new UISelect().setOptions( {
			1003: editor.strings.getKey( 'sidebar/texture/magfilter/nearest' ),
			1006: editor.strings.getKey( 'sidebar/texture/magfilter/linear' )
		} ).setWidth( '150px' ).setFontSize( '14px' );

		magFilterRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/magFilter' ) ).setWidth( '90px' ) );
		magFilterRow.add( this.magFilter );

		this.add( magFilterRow );

		// minFilter
		var minFilterRow = new UIRow();
		this.minFilter = new UISelect().setOptions( {
			1003: editor.strings.getKey( 'sidebar/texture/minfilter/nearest' ),
			1004: editor.strings.getKey( 'sidebar/texture/minfilter/nearestmipmapnearest' ),
			1005: editor.strings.getKey( 'sidebar/texture/minfilter/nearestmipmaplinear' ),
			1006: editor.strings.getKey( 'sidebar/texture/minfilter/linear' ),
			1007: editor.strings.getKey( 'sidebar/texture/minfilter/linearmipmapnearest' ),
			1008: editor.strings.getKey( 'sidebar/texture/minfilter/linearmipmaplinear' ),
		} ).setWidth( '150px' ).setFontSize( '14px' );

		minFilterRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/minFilter' ) ).setWidth( '90px' ) );
		minFilterRow.add( this.minFilter );

		this.add( minFilterRow );

		// flip
		var flipRow = new UIRow();
		this.flipYEnabled = new UICheckbox( false ).onChange( update );

		flipRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/flipY' ) ).setWidth( '90px' ) );
		flipRow.add( this.flipYEnabled );

		this.add( flipRow );

		// wrapS
		var wrapSRow = new UIRow();
		this.wrapS = new UISelect().setOptions( {
			1000: editor.strings.getKey( 'sidebar/texture/wrapping/repeat' ),
			1001: editor.strings.getKey( 'sidebar/texture/wrapping/calmptoedge' ),
			1002: editor.strings.getKey( 'sidebar/texture/wrapping/mirroredrepeat' ),
		} ).setWidth( '150px' ).setFontSize( '14px' ).onChange( update );

		wrapSRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/wrapS' ) ).setWidth( '90px' ) );
		wrapSRow.add( this.wrapS );

		this.add( wrapSRow );

		// wrapT
		var wrapTRow = new UIRow();
		this.wrapT = new UISelect().setOptions( {
			1000: editor.strings.getKey( 'sidebar/texture/wrapping/repeat' ),
			1001: editor.strings.getKey( 'sidebar/texture/wrapping/calmptoedge' ),
			1002: editor.strings.getKey( 'sidebar/texture/wrapping/mirroredrepeat' ),
		} ).setWidth( '150px' ).setFontSize( '14px' ).onChange( update );

		wrapTRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/wrapT' ) ).setWidth( '90px' ) );
		wrapTRow.add( this.wrapT );
		this.add( wrapTRow );

		// center
		var centerRow = new UIRow();
		this.centerX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( update );
		this.centerY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1 ).onChange( update );

		centerRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/center' ) ).setWidth( '90px' ) );
		centerRow.add( this.centerX );
		centerRow.add( this.centerY );

		this.add( centerRow );

		// offset
		var offsetRow = new UIRow();
		this.offsetX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );
		this.offsetY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );

		offsetRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/offset' ) ).setWidth( '90px' ) );
		offsetRow.add( this.offsetX );
		offsetRow.add( this.offsetY );

		this.add( offsetRow );

		// repeat
		var repeatRow = new UIRow();
		this.repeatX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );
		this.repeatY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );

		repeatRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/repeat' ) ).setWidth( '90px' ) );
		repeatRow.add( this.repeatX );
		repeatRow.add( this.repeatY );
		this.add( repeatRow );

		// rotation
		var rotationRow = new UIRow();
		this.rotationX = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );
		this.rotationY = new UINumber( 0 ).setWidth( '30px' ).setRange( 0, 1000 ).onChange( update );

		rotationRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/rotation' ) ).setWidth( '90px' ) );
		rotationRow.add( this.rotationX );
		rotationRow.add( this.rotationY );

		this.add( rotationRow );

		// premultiplyAlpha
		var premultiplyAlphaRow = new UIRow();
		this.premultiplyAlpha = new UICheckbox( false ).onChange( update );

		premultiplyAlphaRow.add( new UIText( editor.strings.getKey( 'sidebar/texture/premultiplyAlpha' ) ).setWidth( '150px' ) );
		premultiplyAlphaRow.add( this.premultiplyAlpha );
		this.add( premultiplyAlphaRow );

		function update( ) {

			var texture = that.selectedTexture;

			if ( texture === null ) return;

			if ( texture.name !== undefined && texture.name !== that.textureName.getValue() ) {

				editor.execute( new SetTextureValueCommand( editor, texture, 'name', that.textureName.getValue() ) );

			}

			if ( texture.encoding !== parseInt( that.encoding.getValue() ) ) {

				editor.execute( new SetTextureValueCommand( editor, texture, 'encoding', parseInt( that.encoding.getValue() ) ) );

			}

			if ( texture.wrapS !== parseInt( that.wrapS.getValue() ) ) {

				editor.execute( new SetTextureValueCommand( editor, texture, 'wrapS', parseInt( that.wrapS.getValue() ) ) );

			}

			if ( texture.wrapT !== parseInt( that.wrapT.getValue() ) ) {

				editor.execute( new SetTextureValueCommand( editor, texture, 'wrapT', parseInt( that.wrapT.getValue() ) ) );

			}

			if ( texture.flipY !== that.flipYEnabled.getValue() ) {

				editor.execute( new SetTextureValueCommand( editor, texture, 'flipY', that.flipYEnabled.getValue() ) );

			}

			if ( texture.premultiplyAlpha !== that.premultiplyAlpha.getValue() ) {

				editor.execute( new SetTextureValueCommand( editor, texture, 'premultiplyAlpha', that.premultiplyAlpha.getValue() ) );

			}

			if ( texture.offset.x !== that.offsetX.getValue() || texture.offset.y !== that.offsetY.getValue() ) {

				const value = [
					that.offsetX.getValue(),
					that.offsetY.getValue(),
				];
				editor.execute( new SetTextureVectorCommand( editor, texture, 'offset', value ) );

			}

			if ( texture.center.x !== that.centerX.getValue() || texture.center.y !== that.centerY.getValue() ) {

				const value = [
					that.centerX.getValue(),
					that.centerY.getValue(),
				];
				editor.execute( new SetTextureVectorCommand( editor, texture, 'center', value ) );

			}

			if ( texture.repeat.x !== that.repeatX.getValue() || texture.repeat.y !== that.repeatY.getValue() ) {

				const value = [
					that.repeatX.getValue(),
					that.repeatY.getValue(),
				];
				editor.execute( new SetTextureVectorCommand( editor, texture, 'repeat', value ) );

			}

			that.refreshPropertiesUI();

		}

	}

	setTexture( texture ) {

		this.selectedTexture = texture;

		this.refreshPropertiesUI( );

	}

	refreshPropertiesUI( ) {

		if ( this.selectedTexture === null ) return;

		this.textureUUID.setValue( this.selectedTexture.uuid );

		this.preview.setValue( this.selectedTexture );

		this.textureName.setValue( this.selectedTexture.name );

		this.encoding.setValue( this.selectedTexture.encoding );
		this.magFilter.setValue( this.selectedTexture.magFilter );
		this.minFilter.setValue( this.selectedTexture.minFilter );

		// Update the wrapping
		this.wrapS.setValue( this.selectedTexture.wrapS );
		this.wrapT.setValue( this.selectedTexture.wrapT );

		this.offsetX.setValue( this.selectedTexture.offset.x );
		this.offsetY.setValue( this.selectedTexture.offset.y );

		this.centerX.setValue( this.selectedTexture.center.x );
		this.centerY.setValue( this.selectedTexture.center.y );

		this.repeatX.setValue( this.selectedTexture.repeat.x );
		this.repeatY.setValue( this.selectedTexture.repeat.y );

		this.flipYEnabled.setValue( this.selectedTexture.flipY );

		this.premultiplyAlpha.setValue( this.selectedTexture.premultiplyAlpha );

	}

}

export { TexturePropertiesPanel };
