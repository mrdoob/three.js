import { Material } from './Material';
import { Color } from '../math/Color';

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

function SpriteMaterial ( parameters ) {
	this.isSpriteMaterial = this.isMaterial = true;

	Material.call( this );

	this.type = 'SpriteMaterial';

	this.color = new Color( 0xffffff );
	this.map = null;

	this.rotation = 0;

	this.fog = false;
	this.lights = false;

	this.setValues( parameters );

};

SpriteMaterial.prototype = Object.create( Material.prototype );
SpriteMaterial.prototype.constructor = SpriteMaterial;

SpriteMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );
	this.map = source.map;

	this.rotation = source.rotation;

	return this;

};


export { SpriteMaterial };