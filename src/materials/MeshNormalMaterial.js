/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  shading: Constants.FlatShading,
 *  blending: Constants.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

module.exports = MeshNormalMaterial;

var Material = require( "../materials/Material" );

function MeshNormalMaterial( parameters ) {

	Material.call( this, parameters );

	this.type = "MeshNormalMaterial";

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.morphTargets = false;

	this.setValues( parameters );

}

MeshNormalMaterial.prototype = Object.create( Material.prototype );
MeshNormalMaterial.prototype.constructor = MeshNormalMaterial;

MeshNormalMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;

	return this;

};
