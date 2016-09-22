import { Material } from './Material';

/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

function MeshNormalMaterial( parameters ) {

	Material.call( this, parameters );

	this.type = 'MeshNormalMaterial';

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false;
	this.lights = false;
	this.morphTargets = false;

	this.setValues( parameters );

}

MeshNormalMaterial.prototype = Object.create( Material.prototype );
MeshNormalMaterial.prototype.constructor = MeshNormalMaterial;

MeshNormalMaterial.prototype.isMeshNormalMaterial = true;

MeshNormalMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;

	return this;

};


export { MeshNormalMaterial };
