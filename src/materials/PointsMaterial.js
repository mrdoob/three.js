import { Material } from './Material.js';
import { Color } from '../math/Color.js';

class PointsMaterial extends Material {

	static get type() {

		return 'PointsMaterial';

	}

	constructor( parameters ) {

		super();

		this.isPointsMaterial = true;

		this.color = new Color( 0xffffff );

		this.map = null;

		this.alphaMap = null;

		this.size = 1;
		this.sizeAttenuation = true;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.size = source.size;
		this.sizeAttenuation = source.sizeAttenuation;

		this.fog = source.fog;

		return this;

	}

}

export { PointsMaterial };
