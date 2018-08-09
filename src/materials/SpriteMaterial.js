import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *	uvOffset: new THREE.Vector2(),
 *	uvScale: new THREE.Vector2()
 * }
 */

class SpriteMaterial extends Material {

	constructor( parameters ) {

		super();

		this.type = 'SpriteMaterial';

		this.color = new Color( 0xffffff );
		this.map = null;

		this.rotation = 0;

		this.lights = false;
		this.transparent = true;

		this.setValues( parameters );

	}

}



SpriteMaterial.prototype.isSpriteMaterial = true;

SpriteMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );
	this.map = source.map;

	this.rotation = source.rotation;

	return this;

};


export { SpriteMaterial };
