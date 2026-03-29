import { UIRow, UIText, UICheckbox, UIButton } from './libs/ui.js';

class GLTFImportDialog {

	constructor( strings ) {

		this.strings = strings;

		const dom = document.createElement( 'div' );
		dom.className = 'Dialog';
		this.dom = dom;

		const background = document.createElement( 'div' );
		background.className = 'Dialog-background';
		background.addEventListener( 'click', () => this.cancel() );
		dom.appendChild( background );

		const content = document.createElement( 'div' );
		content.className = 'Dialog-content';
		dom.appendChild( content );

		// Title

		const titleBar = document.createElement( 'div' );
		titleBar.className = 'Dialog-title';
		titleBar.textContent = strings.getKey( 'dialog/gltf/title' );
		content.appendChild( titleBar );

		// Body

		const body = document.createElement( 'div' );
		body.className = 'Dialog-body';
		content.appendChild( body );

		// As Scene Checkbox

		const asSceneRow = new UIRow();
		body.appendChild( asSceneRow.dom );

		this.asSceneCheckbox = new UICheckbox( false );
		asSceneRow.add( this.asSceneCheckbox );

		asSceneRow.add( new UIText( strings.getKey( 'dialog/gltf/asScene' ) ).setMarginLeft( '6px' ) );

		// Buttons

		const buttonsRow = document.createElement( 'div' );
		buttonsRow.className = 'Dialog-buttons';
		body.appendChild( buttonsRow );

		const okButton = new UIButton( strings.getKey( 'dialog/ok' ) );
		okButton.setWidth( '80px' );
		okButton.onClick( () => this.confirm() );
		buttonsRow.appendChild( okButton.dom );

		const cancelButton = new UIButton( strings.getKey( 'dialog/cancel' ) );
		cancelButton.setWidth( '80px' );
		cancelButton.setMarginLeft( '8px' );
		cancelButton.onClick( () => this.cancel() );
		buttonsRow.appendChild( cancelButton.dom );

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

	confirm() {

		const result = {
			asScene: this.asSceneCheckbox.getValue()
		};

		this.dom.remove();

		if ( this.resolve ) {

			this.resolve( result );

		}

	}

	cancel() {

		this.dom.remove();

		if ( this.reject ) {

			this.reject( new Error( 'Import cancelled' ) );

		}

	}

}

export { GLTFImportDialog };
