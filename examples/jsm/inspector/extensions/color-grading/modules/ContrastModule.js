import { Module } from './Module.js';

const _tempRgb = [ 0, 0, 0 ];

export class ContrastModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'contrast' ) {

		super( id, 'Contrast & Pivot', {
			contrast: params.contrast ?? 1.0,
			contrastPivot: params.contrastPivot ?? 0.5
		} );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.contrastControl = this.createSliderControl( {
			key: 'contrast',
			label: 'Contrast',
			min: 0.2,
			max: 2.0,
			step: 0.01,
			def: 1.0
		} );

		this.pivotControl = this.createSliderControl( {
			key: 'contrastPivot',
			label: 'Pivot',
			min: 0.1,
			max: 0.9,
			step: 0.01,
			def: 0.5
		} );

		card.appendChild( this.contrastControl );
		card.appendChild( this.pivotControl );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		const { contrast, contrastPivot } = this.params;

		if ( contrast === 1.0 ) {

			target[ 0 ] = r;
			target[ 1 ] = g;
			target[ 2 ] = b;
			return target;

		}

		target[ 0 ] = contrastPivot + ( r - contrastPivot ) * contrast;
		target[ 1 ] = contrastPivot + ( g - contrastPivot ) * contrast;
		target[ 2 ] = contrastPivot + ( b - contrastPivot ) * contrast;
		return target;

	}

	reset() {

		this.params.contrast = 1.0;
		this.params.contrastPivot = 0.5;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.contrastControl._setValue( this.params.contrast );
		this.pivotControl._setValue( this.params.contrastPivot );

	}

}
