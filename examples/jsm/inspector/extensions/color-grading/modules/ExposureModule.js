import { Module } from './Module.js';

const _tempRgb = [ 0, 0, 0 ];

export class ExposureModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'exposure' ) {

		super( id, 'Exposure', {
			exposure: params.exposure ?? 0
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

		card.appendChild( this.exposureControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		let cr = r;
		let cg = g;
		let cb = b;

		const { exposure } = this.params;

		if ( exposure !== 0 ) {

			const factor = Math.pow( 2, exposure );
			cr *= factor;
			cg *= factor;
			cb *= factor;

		}

		target[ 0 ] = cr;
		target[ 1 ] = cg;
		target[ 2 ] = cb;
		return target;

	}

	reset() {

		this.params.exposure = 0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.exposureControl._setValue( this.params.exposure );

	}

}
