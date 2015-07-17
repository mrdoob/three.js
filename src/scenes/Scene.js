/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.type = 'Scene';

	this.fog = null;
	this.overrideMaterial = null;

	this.autoUpdate = true; // checked by the renderer

};

THREE.Scene.prototype = Object.create( THREE.Object3D.prototype );
THREE.Scene.prototype.constructor = THREE.Scene;

THREE.Scene.prototype.clone = function () {

	var scene = new THREE.Scene();
	return scene._copyFrom( this );

};

THREE.Scene.prototype._copyFrom = function ( source ) {

	THREE.Object3D.prototype._copyFrom.call( this, source );

	if ( source.fog !== null ) this.fog = source.fog.clone();
	if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

	this.autoUpdate = source.autoUpdate;
	this.matrixAutoUpdate = source.matrixAutoUpdate;

	return this;

};
