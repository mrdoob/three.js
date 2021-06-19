import { LineBasicMaterial } from './LineBasicMaterial.js';

/**
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *
 *  scale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>
 * }
 */

class LineDashedMaterial extends LineBasicMaterial {

	constructor( parameters ) {

		super();

		this.type = 'LineDashedMaterial';

		this.scale = 1;
		this.dashSize = 3;
		this.gapSize = 1;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.scale = source.scale;
		this.dashSize = source.dashSize;
		this.gapSize = source.gapSize;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.scale !== undefined ) data.scale = this.scale;
		if ( this.dashSize !== undefined ) data.dashSize = this.dashSize;
		if ( this.gapSize !== undefined ) data.gapSize = this.gapSize;

		return data;

	}

}

LineDashedMaterial.prototype.isLineDashedMaterial = true;

export { LineDashedMaterial };
