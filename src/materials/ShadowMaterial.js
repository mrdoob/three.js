/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <THREE.Color>
 * }
 */

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

}




ShadowMaterial.prototype.isShadowMaterial = true;

ShadowMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	return this;

};


export { ShadowMaterial };
