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
	return this.cloneProperties( scene );

};

THREE.Scene.prototype.cloneProperties = function ( scene ) {

	if ( scene === undefined ) scene = new THREE.Scene();

	THREE.Object3D.prototype.cloneProperties.call( this, scene );

	if ( this.fog !== null ) scene.fog = this.fog.clone();
	if ( this.overrideMaterial !== null ) scene.overrideMaterial = this.overrideMaterial.clone();

	scene.autoUpdate = this.autoUpdate;
	scene.matrixAutoUpdate = this.matrixAutoUpdate;

	return scene;

};
