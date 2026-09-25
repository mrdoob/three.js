import { Module } from './Module.js';
import { rgbToHsv, hsvToRgb } from '../LUTMath.js';

const _tempRgb = [ 0, 0, 0 ];

export class SaturationModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'saturation' ) {

		super( id, 'Saturation', {
			saturation: params.saturation ?? 1.0
		} );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.saturationControl = this.createSliderControl( {
			key: 'saturation',
			label: 'Saturation',
			min: 0,
			max: 2.0,
			step: 0.01,
			def: 1.0
		} );

		card.appendChild( this.saturationControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		const { saturation } = this.params;

		if ( saturation === 1.0 ) {

			target[ 0 ] = r;
			target[ 1 ] = g;
			target[ 2 ] = b;
			return target;

		}

		const [ h, origS, origV ] = rgbToHsv( Math.max( 0, r ), Math.max( 0, g ), Math.max( 0, b ) );
		let s = origS * saturation;
		s = Math.max( 0, Math.min( 1, s ) );
		const v = Math.max( 0, Math.min( 1, origV ) );

		const [ nr, ng, nb ] = hsvToRgb( h, s, v );
		target[ 0 ] = nr;
		target[ 1 ] = ng;
		target[ 2 ] = nb;
		return target;

	}

	reset() {

		this.params.saturation = 1.0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.saturationControl._setValue( this.params.saturation );

	}

}
