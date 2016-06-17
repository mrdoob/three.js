/**
 * @author bhouston / http://clara.io/
 *
 */

THREE.MeshCubeMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	this.type = 'MeshCubeMaterial';

	this.envMap = null;
	this.envMapIntensity = 1.0;

	this.roughness = 0.0;

	this.depthTest = false;
	this.depthWrite = false;
	this.side = THREE.BackSide;

	this.lights = false;

	this.setValues( parameters );

};

THREE.MeshCubeMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.MeshCubeMaterial.prototype.constructor = THREE.MeshCubeMaterial;

THREE.MeshCubeMaterial.prototype.copy = function ( source ) {

	THREE.Material.prototype.copy.call( this, source );

	this.envMap = source.envMap;
	this.envMapIntensity = source.envMapIntensity;

	this.roughness = source.roughness;

	return this;

};
