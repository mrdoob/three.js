import * as THREE from 'three';

import { UIButton, UICheckbox, UIDiv, UINumber, UIRow, UISelect, UIText } from './libs/ui.js';
import { renderToCanvas } from './libs/ui.three.js';

class TextureParametersDialog {

	constructor( editor, texture ) {

		this.editor = editor;

		this.strings = editor.strings;
		this.texture = texture;

		const dom = new UIDiv();
		dom.setClass( 'Dialog' );
		this.dom = dom.dom;

		const background = new UIDiv();
		background.setClass( 'Dialog-background' );
		background.dom.addEventListener( 'click', () => this.cancel() );
		dom.add( background );

		const content = new UIDiv();
		content.setClass( 'Dialog-content TextureParametersDialog-content' );
		dom.add( content );

		// Title

		const titleBar = new UIDiv();
		titleBar.setClass( 'Dialog-title' );
		titleBar.setTextContent( this.strings.getKey( 'dialog/texture/title' ) );
		content.add( titleBar );

		// Body (split into preview + form)

		const body = new UIDiv();
		body.setClass( 'Dialog-body TextureParametersDialog-body' );
		content.add( body );

		const split = new UIDiv();
		split.setClass( 'TextureParametersDialog-split' );
		body.add( split );

		// Preview

		const previewWrapper = new UIDiv();
		previewWrapper.setClass( 'TextureParametersDialog-preview' );
		split.add( previewWrapper );

		previewWrapper.add( createGroupHeading( this.strings.getKey( 'dialog/texture/group/preview' ) ) );

		const previewCanvas = document.createElement( 'canvas' );
		previewCanvas.width = 400;
		previewCanvas.height = 400;
		previewWrapper.dom.appendChild( previewCanvas );

		this.previewCanvas = previewCanvas;
		this.previewContext = previewCanvas.getContext( '2d' );
		this.previewTexture = texture.clone();

		const updatePreview = () => this.updatePreview();

		// Form

		const form = new UIDiv();
		form.setClass( 'TextureParametersDialog-form' );
		split.add( form );

		// Mapping group

		form.add( createGroupHeading( this.strings.getKey( 'dialog/texture/group/mapping' ) ) );

		this.mapping = new UISelect().setOptions( {
			[ THREE.UVMapping ]: 'UV',
			[ THREE.EquirectangularReflectionMapping ]: 'Equirectangular Reflection',
			[ THREE.EquirectangularRefractionMapping ]: 'Equirectangular Refraction',
			[ THREE.CubeReflectionMapping ]: 'Cube Reflection',
			[ THREE.CubeRefractionMapping ]: 'Cube Refraction',
			[ THREE.CubeUVReflectionMapping ]: 'CubeUV Reflection'
		} ).setValue( texture.mapping ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/mapping' ), this.mapping ) );

		const wrapOptions = {
			[ THREE.RepeatWrapping ]: 'Repeat',
			[ THREE.ClampToEdgeWrapping ]: 'Clamp To Edge',
			[ THREE.MirroredRepeatWrapping ]: 'Mirrored Repeat'
		};

		this.wrapS = new UISelect().setOptions( wrapOptions ).setValue( texture.wrapS ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/wrapS' ), this.wrapS ) );

		this.wrapT = new UISelect().setOptions( wrapOptions ).setValue( texture.wrapT ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/wrapT' ), this.wrapT ) );

		// Filtering group

		form.add( createGroupHeading( this.strings.getKey( 'dialog/texture/group/filtering' ) ) );

		this.minFilter = new UISelect().setOptions( {
			[ THREE.NearestFilter ]: 'Nearest',
			[ THREE.NearestMipmapNearestFilter ]: 'Nearest Mipmap Nearest',
			[ THREE.NearestMipmapLinearFilter ]: 'Nearest Mipmap Linear',
			[ THREE.LinearFilter ]: 'Linear',
			[ THREE.LinearMipmapNearestFilter ]: 'Linear Mipmap Nearest',
			[ THREE.LinearMipmapLinearFilter ]: 'Linear Mipmap Linear'
		} ).setValue( texture.minFilter ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/minFilter' ), this.minFilter ) );

		this.magFilter = new UISelect().setOptions( {
			[ THREE.NearestFilter ]: 'Nearest',
			[ THREE.LinearFilter ]: 'Linear'
		} ).setValue( texture.magFilter ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/magFilter' ), this.magFilter ) );

		this.anisotropy = new UINumber( texture.anisotropy ).setPrecision( 0 ).setRange( 1, 16 ).setNudge( 1 ).setStep( 1 ).setWidth( '60px' ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/anisotropy' ), this.anisotropy ) );

		// Transform group

		form.add( createGroupHeading( this.strings.getKey( 'dialog/texture/group/transform' ) ) );

		this.offsetX = new UINumber( texture.offset.x ).setWidth( '60px' ).onChange( updatePreview );
		this.offsetY = new UINumber( texture.offset.y ).setWidth( '60px' ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/offset' ), this.offsetX, this.offsetY ) );

		this.repeatX = new UINumber( texture.repeat.x ).setWidth( '60px' ).onChange( updatePreview );
		this.repeatY = new UINumber( texture.repeat.y ).setWidth( '60px' ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/repeat' ), this.repeatX, this.repeatY ) );

		this.centerX = new UINumber( texture.center.x ).setWidth( '60px' ).onChange( updatePreview );
		this.centerY = new UINumber( texture.center.y ).setWidth( '60px' ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/center' ), this.centerX, this.centerY ) );

		this.rotation = new UINumber( texture.rotation * THREE.MathUtils.RAD2DEG ).setStep( 10 ).setNudge( 0.1 ).setUnit( '°' ).setWidth( '60px' ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/rotation' ), this.rotation ) );

		// Color group

		form.add( createGroupHeading( this.strings.getKey( 'dialog/texture/group/color' ) ) );

		this.premultiplyAlpha = new UICheckbox( texture.premultiplyAlpha ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/premultiplyAlpha' ), this.premultiplyAlpha ) );

		this.colorSpace = new UISelect().setOptions( {
			[ THREE.NoColorSpace ]: 'No Color Space',
			[ THREE.SRGBColorSpace ]: 'sRGB',
			[ THREE.LinearSRGBColorSpace ]: 'Linear sRGB'
		} ).setValue( texture.colorSpace ).onChange( updatePreview );
		form.add( createRow( this.strings.getKey( 'dialog/texture/colorSpace' ), this.colorSpace ) );

		updatePreview();

		// Buttons

		const buttonsRow = new UIDiv();
		buttonsRow.setClass( 'Dialog-buttons' );
		body.add( buttonsRow );

		const okButton = new UIButton( this.strings.getKey( 'dialog/ok' ) );
		okButton.setWidth( '80px' );
		okButton.onClick( () => this.confirm() );
		buttonsRow.add( okButton );

		const cancelButton = new UIButton( this.strings.getKey( 'dialog/cancel' ) );
		cancelButton.setWidth( '80px' );
		cancelButton.setMarginLeft( '8px' );
		cancelButton.onClick( () => this.cancel() );
		buttonsRow.add( cancelButton );

		// Promise handlers

		this.resolve = null;
		this.reject = null;

	}

	show() {

		document.body.appendChild( this.dom );

		return new Promise( ( resolve, reject ) => {

			this.resolve = resolve;
			this.reject = reject;

		} );

	}

	getCurrentParameters() {

		return {
			mapping: parseInt( this.mapping.getValue() ),
			wrapS: parseInt( this.wrapS.getValue() ),
			wrapT: parseInt( this.wrapT.getValue() ),
			magFilter: parseInt( this.magFilter.getValue() ),
			minFilter: parseInt( this.minFilter.getValue() ),
			anisotropy: this.anisotropy.getValue(),
			offset: { x: this.offsetX.getValue(), y: this.offsetY.getValue() },
			repeat: { x: this.repeatX.getValue(), y: this.repeatY.getValue() },
			center: { x: this.centerX.getValue(), y: this.centerY.getValue() },
			rotation: this.rotation.getValue() * THREE.MathUtils.DEG2RAD,
			premultiplyAlpha: this.premultiplyAlpha.getValue(),
			colorSpace: this.colorSpace.getValue()
		};

	}

	updatePreview() {

		applyParameters( this.previewTexture, this.getCurrentParameters() );

		const rendered = renderToCanvas( this.previewTexture );

		const canvas = this.previewCanvas;
		const context = this.previewContext;
		context.clearRect( 0, 0, canvas.width, canvas.height );

		if ( rendered.width === 0 || rendered.height === 0 ) return;

		const scale = Math.min( canvas.width / rendered.width, canvas.height / rendered.height );
		const w = rendered.width * scale;
		const h = rendered.height * scale;
		context.drawImage( rendered, ( canvas.width - w ) / 2, ( canvas.height - h ) / 2, w, h );

	}

	confirm() {

		const result = this.getCurrentParameters();

		this.previewTexture.dispose();
		this.dom.remove();

		if ( this.resolve ) this.resolve( result );

	}

	cancel() {

		this.previewTexture.dispose();
		this.dom.remove();

		if ( this.reject ) this.reject( new Error( 'Texture parameters edit cancelled' ) );

	}

}

function createRow( label, ...inputs ) {

	const row = new UIRow();
	row.add( new UIText( label ).setClass( 'Label' ) );

	for ( const input of inputs ) {

		row.add( input );

	}

	return row;

}

function createGroupHeading( label ) {

	const heading = new UIText( label );
	heading.setClass( 'TextureParametersDialog-groupHeading' );
	heading.setStyle( 'display', [ 'block' ] );
	return heading;

}

function applyParameters( texture, p ) {

	texture.mapping = p.mapping;
	texture.wrapS = p.wrapS;
	texture.wrapT = p.wrapT;
	texture.magFilter = p.magFilter;
	texture.minFilter = p.minFilter;
	texture.anisotropy = p.anisotropy;
	texture.offset.set( p.offset.x, p.offset.y );
	texture.repeat.set( p.repeat.x, p.repeat.y );
	texture.center.set( p.center.x, p.center.y );
	texture.rotation = p.rotation;
	texture.premultiplyAlpha = p.premultiplyAlpha;
	texture.colorSpace = p.colorSpace;
	texture.needsUpdate = true;

}

export { TextureParametersDialog };
