import { Material } from './Material';
import { BackSide } from '../constants';

/**
 * @author bhouston / https://clara.io
 *
 * parameters = {
 *
 * }
 */

function SkyboxMaterial( parameters ) {

	Material.call( this );

	this.type = 'SkyboxMaterial';

	this.envMap = null;
	this.envMapIntensity = 1.0;

	this.roughness = 0.0;

	this.depthTest = false;
	this.depthWrite = false;
	this.side = BackSide;

	this.lights = false;

	this.setValues( parameters );

}

SkyboxMaterial.prototype = Object.create( Material.prototype );
SkyboxMaterial.prototype.constructor = SkyboxMaterial;

SkyboxMaterial.prototype.isSkyboxMaterial = true;

SkyboxMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.envMap = source.envMap;
	this.envMapIntensity = source.envMapIntensity;

	this.roughness = source.roughness;

	return this;

};

export { SkyboxMaterial };
