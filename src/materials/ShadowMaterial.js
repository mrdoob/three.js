import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * parameters = {
 *  color: <THREE.Color>
 * }
 */

class ShadowMaterial extends Material {

	constructor( parameters ) {

		super();

		Object.defineProperty( this, 'isShadowMaterial', { value: true } );

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

export { ShadowMaterial };
