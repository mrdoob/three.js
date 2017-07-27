/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <THREE.Color>,
 *  opacity: <float>
 * }
 */

import { Material } from './Material';
import { Color } from '../math/Color';

function ShadowMaterial( parameters ) {

	Material.call( this );

	this.type = 'ShadowMaterial';

	this.color = new Color( 0x000000 );
	this.opacity = 1.0;

	this.lights = true;
	this.transparent = true;

	this.setValues( parameters );

}

ShadowMaterial.prototype = Object.create( Material.prototype );
ShadowMaterial.prototype.constructor = ShadowMaterial;

ShadowMaterial.prototype.isShadowMaterial = true;


export { ShadowMaterial };
