import { Module } from './Module.js';
import {
	NoToneMapping,
	LinearToneMapping,
	ReinhardToneMapping,
	CineonToneMapping,
	ACESFilmicToneMapping,
	AgXToneMapping,
	NeutralToneMapping
} from 'three/webgpu';

const _tempRgb = [ 0, 0, 0 ];

export class RendererModule extends Module {

	constructor( params = {}, onChange = null, onRendererChange = null ) {

		const initialToneMapping = params.toneMapping ?? NoToneMapping;
		const initialExposure = params.exposure ?? 1.0;

		super( 'renderer', 'Renderer', {
			toneMapping: initialToneMapping,
			exposure: initialExposure
		} );

		this.dragAndDrop = false;

		this.defaultToneMapping = initialToneMapping;
		this.defaultExposure = initialExposure;

		this.onChange = onChange;
		this.onRendererChange = onRendererChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card renderer-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset() ) );

		// 1. Tone Mapping Dropdown
		const tmBox = document.createElement( 'div' );
		tmBox.className = 'param-control lut-param-box';

		const tmTop = document.createElement( 'div' );
		tmTop.className = 'lut-param-top';

		const tmLabel = document.createElement( 'span' );
		tmLabel.className = 'lut-param-label';
		tmLabel.textContent = 'Tone Mapping';

		this.toneMappingSelect = document.createElement( 'select' );
		this.toneMappingSelect.className = 'lut-select lut-select-compact';

		const toneMappingModes = [
			{ name: 'None', value: NoToneMapping },
			{ name: 'Linear', value: LinearToneMapping },
			{ name: 'Reinhard', value: ReinhardToneMapping },
			{ name: 'Cineon', value: CineonToneMapping },
			{ name: 'ACES Filmic', value: ACESFilmicToneMapping },
			{ name: 'AgX', value: AgXToneMapping },
			{ name: 'Neutral', value: NeutralToneMapping }
		];

		toneMappingModes.forEach( mode => {

			const opt = document.createElement( 'option' );
			opt.value = mode.value;
			opt.textContent = mode.name;
			if ( mode.value === this.params.toneMapping ) opt.selected = true;
			this.toneMappingSelect.appendChild( opt );

		} );

		this.toneMappingSelect.onchange = ( e ) => {

			this.params.toneMapping = parseInt( e.target.value, 10 );
			if ( this.onRendererChange ) this.onRendererChange( this );

		};

		tmTop.appendChild( tmLabel );
		tmTop.appendChild( this.toneMappingSelect );
		tmBox.appendChild( tmTop );
		card.appendChild( tmBox );

		// 2. Exposure Control
		const expBox = document.createElement( 'div' );
		expBox.className = 'param-control value-slider lut-param-box';

		const expTop = document.createElement( 'div' );
		expTop.className = 'lut-param-top';

		const expLabel = document.createElement( 'span' );
		expLabel.className = 'lut-param-label';
		expLabel.textContent = 'Exposure';

		this.exposureNumInput = document.createElement( 'input' );
		this.exposureNumInput.type = 'number';
		this.exposureNumInput.min = '0.1';
		this.exposureNumInput.max = '5.0';
		this.exposureNumInput.step = '0.05';
		this.exposureNumInput.value = this.params.exposure.toFixed( 2 );
		this.exposureNumInput.className = 'lut-num-input';

		this.exposureSlider = document.createElement( 'input' );
		this.exposureSlider.type = 'range';
		this.exposureSlider.className = 'inspector-slider';
		this.exposureSlider.min = '0.1';
		this.exposureSlider.max = '5.0';
		this.exposureSlider.step = '0.05';
		this.exposureSlider.value = this.params.exposure;

		const onExpChange = ( val ) => {

			this.params.exposure = val;
			if ( this.onRendererChange ) this.onRendererChange( this );

		};

		this.exposureSlider.oninput = () => {

			const val = parseFloat( this.exposureSlider.value );
			this.exposureNumInput.value = val.toFixed( 2 );
			onExpChange( val );

		};

		this.exposureNumInput.onchange = () => {

			const val = Math.max( 0.1, Math.min( 5.0, parseFloat( this.exposureNumInput.value ) || 1.0 ) );
			this.exposureNumInput.value = val.toFixed( 2 );
			this.exposureSlider.value = val;
			onExpChange( val );

		};

		let isDragging = false;
		let startX = 0;
		let startVal = 1.0;

		this.exposureNumInput.onmousedown = ( e ) => {

			if ( document.activeElement === this.exposureNumInput ) return;

			isDragging = true;
			startX = e.clientX;
			startVal = parseFloat( this.exposureSlider.value );

			const onMouseMove = ( moveEvent ) => {

				if ( ! isDragging ) return;
				const deltaX = moveEvent.clientX - startX;
				const newVal = Math.max( 0.1, Math.min( 5.0, startVal + deltaX * 0.01 ) );

				this.exposureNumInput.value = newVal.toFixed( 2 );
				this.exposureSlider.value = newVal;
				onExpChange( newVal );

			};

			const onMouseUp = () => {

				isDragging = false;
				window.removeEventListener( 'mousemove', onMouseMove );
				window.removeEventListener( 'mouseup', onMouseUp );

			};

			window.addEventListener( 'mousemove', onMouseMove );
			window.addEventListener( 'mouseup', onMouseUp );

		};

		expTop.appendChild( expLabel );
		expTop.appendChild( this.exposureNumInput );
		expBox.appendChild( expTop );
		expBox.appendChild( this.exposureSlider );
		card.appendChild( expBox );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		target[ 0 ] = r;
		target[ 1 ] = g;
		target[ 2 ] = b;
		return target;

	}

	reset() {

		this.params.toneMapping = this.defaultToneMapping;
		this.params.exposure = this.defaultExposure;
		this.updateUI();

		if ( this.onRendererChange ) this.onRendererChange( this );

	}

	updateUI() {

		this.toneMappingSelect.value = String( this.params.toneMapping );
		this.exposureNumInput.value = this.params.exposure.toFixed( 2 );
		this.exposureSlider.value = String( this.params.exposure );

	}

	fromJSON( json ) {

		if ( json && json.params ) {

			if ( json.params.toneMapping !== undefined ) this.params.toneMapping = json.params.toneMapping;
			if ( json.params.exposure !== undefined ) this.params.exposure = json.params.exposure;

		}

		this.updateUI();

		if ( this.onRendererChange ) this.onRendererChange( this );

	}

}
