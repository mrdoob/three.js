import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *  linecap: "round",
 *  linejoin: "round"
 * }
 */

function LineBasicMaterial( parameters ) {

	Material.call( this );

	this.type = 'LineBasicMaterial';

	this.color = new Color( 0xffffff );

	this.linewidth = 1;
	this.linecap = 'round';
	this.linejoin = 'round';

	this.lights = false;

	this.setValues( parameters );

}

LineBasicMaterial.prototype = Object.create( Material.prototype );
LineBasicMaterial.prototype.constructor = LineBasicMaterial;

LineBasicMaterial.prototype.isLineBasicMaterial = true;

LineBasicMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	if ( source.color !== undefined ) this.color.copy( source.color );

	if ( source.linewidth !== undefined ) this.linewidth = source.linewidth;
	if ( source.linecap !== undefined ) this.linecap = source.linecap;
	if ( source.linejoin !== undefined ) this.linejoin = source.linejoin;

	return this;

};


export { LineBasicMaterial };
