import { Module } from './Module.js';

const _tempRgb = [ 0, 0, 0 ];

export class OutputModule extends Module {

	constructor( params = {}, onChange = null ) {

		const initialFileName = params.fileName || 'My Color Grading';

		super( 'output', 'Output', {
			fileName: initialFileName
		} );

		this.dragAndDrop = false;

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card output-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset() ) );

		// File Name input control
		const nameBox = document.createElement( 'div' );
		nameBox.className = 'param-control lut-param-box';
		nameBox.style.cssText = 'width: 100%; box-sizing: border-box;';

		this.nameInput = document.createElement( 'input' );
		this.nameInput.type = 'text';
		this.nameInput.className = 'lut-input lut-text-input';
		this.nameInput.style.cssText = 'width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); border: 1px solid rgba(74,74,90,0.5); border-radius: 4px; color: #e0e0e0; font-size: 11px; padding: 4px 6px; font-family: var(--font-family, sans-serif); text-align: center; outline: none; transition: border-color 0.15s;';
		this.nameInput.value = this.params.fileName;
		this.nameInput.placeholder = 'LUT name...';

		this.nameInput.onfocus = () => {

			this.nameInput.style.borderColor = 'var(--color-accent, #00aaff)';

		};

		this.nameInput.onblur = () => {

			this.nameInput.style.borderColor = 'rgba(74,74,90,0.5)';

		};

		this.nameInput.oninput = () => {

			const raw = this.nameInput.value;
			this.params.fileName = raw || 'LUT3D';
			this.onParamChange();

		};

		nameBox.appendChild( this.nameInput );
		card.appendChild( nameBox );

		const infoBox = document.createElement( 'div' );
		infoBox.className = 'lut-output-info';
		infoBox.style.cssText = 'display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px 0 2px 0;';

		this.resVal = document.createElement( 'span' );
		this.resVal.style.cssText = 'font-size: 11px; color: var(--text-secondary, #9a9aab); font-weight: 400; letter-spacing: 0.2px;';
		this.resVal.textContent = '3D LUT / TSL';

		infoBox.appendChild( this.resVal );
		card.appendChild( infoBox );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		target[ 0 ] = r;
		target[ 1 ] = g;
		target[ 2 ] = b;
		return target;

	}

	reset() {

		this.params.fileName = 'My Color Grading';
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		if ( this.nameInput ) {

			this.nameInput.value = this.params.fileName;

		}

	}

}
