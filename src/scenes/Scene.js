/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.type = 'Scene';

	this.background = null;
	this.fog = null;
	this.overrideMaterial = null;

	this.autoUpdate = true; // checked by the renderer

};

THREE.Scene.prototype = Object.create( THREE.Object3D.prototype );
THREE.Scene.prototype.constructor = THREE.Scene;

THREE.Scene.prototype.copy = function ( source, recursive ) {

	THREE.Object3D.prototype.copy.call( this, source, recursive );

	if ( source.background !== null ) this.background = source.background.clone();
	if ( source.fog !== null ) this.fog = source.fog.clone();
	if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

	this.autoUpdate = source.autoUpdate;
	this.matrixAutoUpdate = source.matrixAutoUpdate;

	return this;

};
