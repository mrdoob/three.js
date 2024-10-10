import { LineBasicMaterial } from './LineBasicMaterial.js';

class LineDashedMaterial extends LineBasicMaterial {

	static get type() {

		return 'LineDashedMaterial';

	}

	constructor( parameters ) {

		super();

		this.isLineDashedMaterial = true;

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

}

export { LineDashedMaterial };
