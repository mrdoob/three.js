import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>
 * }
 */

function PointsMaterial( parameters ) {

	Material.call( this );

	this.type = 'PointsMaterial';

	this.color = new Color( 0xffffff );

	this.map = null;

	this.size = 1;
	this.sizeAttenuation = true;

	this.lights = false;

	this.setValues( parameters );

}

PointsMaterial.prototype = Object.create( Material.prototype );
PointsMaterial.prototype.constructor = PointsMaterial;

PointsMaterial.prototype.isPointsMaterial = true;

PointsMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	if ( source.color !== undefined ) this.color.copy( source.color );

	if ( source.map !== undefined ) this.map = source.map;

	if ( source.size !== undefined ) this.size = source.size;
	if ( source.sizeAttenuation !== undefined ) this.sizeAttenuation = source.sizeAttenuation;

	return this;

};


export { PointsMaterial };
