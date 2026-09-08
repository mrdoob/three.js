import { Module } from './Module.js';
import { rgbToHsv, hsvToRgb } from '../LUTMath.js';

const _tempRgb = [ 0, 0, 0 ];

export class VibranceModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'vibrance' ) {

		super( id, 'Vibrance', {
			vibrance: params.vibrance ?? 0
		} );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.vibranceControl = this.createSliderControl( {
			key: 'vibrance',
			label: 'Vibrance',
			min: - 1.0,
			max: 1.0,
			step: 0.01,
			def: 0
		} );

		card.appendChild( this.vibranceControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		const { vibrance } = this.params;

		if ( vibrance === 0 ) {

			target[ 0 ] = r;
			target[ 1 ] = g;
			target[ 2 ] = b;
			return target;

		}

		const [ h, origS, origV ] = rgbToHsv( Math.max( 0, r ), Math.max( 0, g ), Math.max( 0, b ) );
		let s = origS + ( vibrance > 0 ? ( 1 - origS ) : origS ) * vibrance * 0.5;
		s = Math.max( 0, Math.min( 1, s ) );
		const v = Math.max( 0, Math.min( 1, origV ) );

		const [ nr, ng, nb ] = hsvToRgb( h, s, v );
		target[ 0 ] = nr;
		target[ 1 ] = ng;
		target[ 2 ] = nb;
		return target;

	}

	reset() {

		this.params.vibrance = 0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.vibranceControl._setValue( this.params.vibrance );

	}

}
