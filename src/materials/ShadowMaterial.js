import { Material } from './Material.js';
import { Color } from '../math/Color.js';

class ShadowMaterial extends Material {

	static get type() {

		return 'ShadowMaterial';

	}

	constructor( parameters ) {

		super();

		this.isShadowMaterial = true;

		this.color = new Color( 0x000000 );
		this.transparent = true;

		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.fog = source.fog;

		return this;

	}

}

export { ShadowMaterial };
