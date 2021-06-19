import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 *  alphaMap: new THREE.Texture( <Image> ),
 *  rotation: <float>,
 *  sizeAttenuation: <bool>
 * }
 */

class SpriteMaterial extends Material {

	constructor( parameters ) {

		super();

		this.type = 'SpriteMaterial';

		this.color = new Color( 0xffffff );

		this.map = null;

		this.alphaMap = null;

		this.rotation = 0;

		this.sizeAttenuation = true;

		this.transparent = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.rotation = source.rotation;

		this.sizeAttenuation = source.sizeAttenuation;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.rotation !== 0 ) data.rotation = this.rotation;

		return data;

	}

}

SpriteMaterial.prototype.isSpriteMaterial = true;

export { SpriteMaterial };
