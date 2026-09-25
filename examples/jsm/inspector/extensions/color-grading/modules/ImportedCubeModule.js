import { Module } from './Module.js';
import { sample3DLUT } from '../LUTMath.js';

const _tempRgb = [ 0, 0, 0 ];

export class ImportedCubeModule extends Module {

	constructor( id, cubeInfo = {}, onChange = null, onRemove = null ) {

		super( id, cubeInfo.title || 'Imported LUT', {
			title: cubeInfo.title || 'Imported LUT',
			size: cubeInfo.size ?? 32,
			dataLines: cubeInfo.dataLines || cubeInfo.data || [],
			weight: cubeInfo.weight ?? 1.0
		} );

		this.onChange = onChange;
		this.onRemove = onRemove;

		const card = document.createElement( 'div' );
		card.className = 'lut-card lut-imported-cube-card';

		card.appendChild( this.createCardHeader(
			this.name,
			() => this.reset(),
			this.onRemove ? () => this.onRemove( this.id ) : null
		) );

		const body = document.createElement( 'div' );
		body.style.cssText = 'display: flex; flex-direction: column; gap: 8px; width: 100%;';

		const infoLabel = document.createElement( 'div' );
		infoLabel.style.cssText = 'font-size: 10px; color: var(--text-secondary, #9a9aab); text-align: center; font-weight: 500;';
		infoLabel.textContent = `3D LUT Size: ${this.params.size}³`;
		body.appendChild( infoLabel );

		this.weightControl = this.createSliderControl( {
			key: 'weight',
			label: 'Mix Weight',
			min: 0,
			max: 1.0,
			step: 0.01,
			def: 1.0
		} );

		body.appendChild( this.weightControl );
		card.appendChild( body );

		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		const { dataLines, size, weight } = this.params;

		if ( dataLines.length === 0 ) {

			target[ 0 ] = r;
			target[ 1 ] = g;
			target[ 2 ] = b;
			return target;

		}

		const [ lr, lg, lb ] = sample3DLUT( r, g, b, size, dataLines );

		target[ 0 ] = r * ( 1 - weight ) + lr * weight;
		target[ 1 ] = g * ( 1 - weight ) + lg * weight;
		target[ 2 ] = b * ( 1 - weight ) + lb * weight;
		return target;

	}

	reset() {

		this.params.weight = 1.0;
		this.updateUI();
		this.onParamChange();

	}

	updateUI() {

		this.weightControl._setValue( this.params.weight );

	}

}
