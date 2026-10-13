import { Module } from './Module.js';
import { rgbToHsv, hsvToRgb } from '../LUTMath.js';

const _tempRgb = [ 0, 0, 0 ];

export class ExposureHueModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'exposureHue' ) {

		super( id, 'Exposure & Hue', {
			exposure: params.exposure ?? 0,
			brightness: params.brightness ?? 0,
			hueShift: params.hueShift ?? 0
		} );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.exposureControl = this.createSliderControl( {
			key: 'exposure',
			label: 'Exposure',
			min: - 3,
			max: 3,
			step: 0.05,
			def: 0
		} );

		this.hueShiftControl = this.createSliderControl( {
			key: 'hueShift',
			label: 'Hue (°)',
			min: - 180,
			max: 180,
			step: 1,
			def: 0
		} );

		card.appendChild( this.exposureControl );
		card.appendChild( this.hueShiftControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		let cr = r;
		let cg = g;
		let cb = b;

		const { exposure, brightness, hueShift } = this.params;

		if ( exposure !== 0 ) {

			const factor = Math.pow( 2, exposure );
			cr *= factor;
			cg *= factor;
			cb *= factor;

		}

		if ( brightness !== 0 ) {

			cr += brightness;
			cg += brightness;
			cb += brightness;

		}

		if ( hueShift !== 0 ) {

			const [ origH, s, v ] = rgbToHsv( Math.max( 0, cr ), Math.max( 0, cg ), Math.max( 0, cb ) );
			let h = ( origH + hueShift / 360 ) % 1;
			if ( h < 0 ) h += 1;

			const [ nr, ng, nb ] = hsvToRgb( h, s, v );
			cr = nr;
			cg = ng;
			cb = nb;

		}

		target[ 0 ] = cr;
		target[ 1 ] = cg;
		target[ 2 ] = cb;
		return target;

	}

	reset() {

		this.params.exposure = 0;
		this.params.brightness = 0;
		this.params.hueShift = 0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.exposureControl._setValue( this.params.exposure );
		this.hueShiftControl._setValue( this.params.hueShift );

	}

}
