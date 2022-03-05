import { Material } from './Material.js';
import { Color } from '../math/Color.js';

class ShadowMaterial extends Material {

	constructor( parameters ) {

		super();

		this.type = 'ShadowMaterial';

		this.color = new Color( 0x000000 );
		this.transparent = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		return this;

	}

}

ShadowMaterial.prototype.isShadowMaterial = true;

export { ShadowMaterial };
