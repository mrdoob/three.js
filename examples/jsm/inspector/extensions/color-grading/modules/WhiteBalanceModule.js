import { Module } from './Module.js';

const _tempRgb = [ 0, 0, 0 ];

export class WhiteBalanceModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'whiteBalance' ) {

		super( id, 'White Balance', {
			temperature: params.temperature ?? 0,
			tint: params.tint ?? 0
		} );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.temperatureControl = this.createSliderControl( {
			key: 'temperature',
			label: 'Temp (K)',
			min: - 100,
			max: 100,
			step: 1,
			def: 0
		} );

		this.tintControl = this.createSliderControl( {
			key: 'tint',
			label: 'Tint',
			min: - 100,
			max: 100,
			step: 1,
			def: 0
		} );

		card.appendChild( this.temperatureControl );
		card.appendChild( this.tintControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		const { temperature, tint } = this.params;

		if ( temperature === 0 && tint === 0 ) {

			target[ 0 ] = r;
			target[ 1 ] = g;
			target[ 2 ] = b;
			return target;

		}

		const temp = temperature / 100;
		const t = tint / 100;

		target[ 0 ] = r + temp * 0.1;
		target[ 1 ] = g - t * 0.1;
		target[ 2 ] = b - temp * 0.1;

		return target;

	}

	reset() {

		this.params.temperature = 0;
		this.params.tint = 0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.temperatureControl._setValue( this.params.temperature );
		this.tintControl._setValue( this.params.tint );

	}

}
