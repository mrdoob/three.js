import { Module } from './Module.js';

const _tempRgb = [ 0, 0, 0 ];

export class BrightnessModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'brightness' ) {

		super( id, 'Brightness', {
			brightness: params.brightness ?? 0
		} );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.brightnessControl = this.createSliderControl( {
			key: 'brightness',
			label: 'Brightness',
			min: - 1,
			max: 1,
			step: 0.02,
			def: 0
		} );

		card.appendChild( this.brightnessControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		let cr = r;
		let cg = g;
		let cb = b;

		const { brightness } = this.params;

		if ( brightness !== 0 ) {

			cr += brightness;
			cg += brightness;
			cb += brightness;

		}

		target[ 0 ] = cr;
		target[ 1 ] = cg;
		target[ 2 ] = cb;
		return target;

	}

	reset() {

		this.params.brightness = 0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.brightnessControl._setValue( this.params.brightness );

	}

}
