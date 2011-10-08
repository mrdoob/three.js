/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.fog = null;
	this.overrideMaterial = null;

	this.matrixAutoUpdate = false;

};

THREE.Scene.prototype = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;

// DEPRECATED

THREE.Scene.prototype.addChild = function ( child ) {

	console.warn( 'DEPRECATED: Scene.addChild() is now Scene.add().' );
	this.add( child );

}

THREE.Scene.prototype.addObject = function ( child ) {

	console.warn( 'DEPRECATED: Scene.addObject() is now Scene.add().' );
	this.add( child );

}

THREE.Scene.prototype.addLight = function ( child ) {

	console.warn( 'DEPRECATED: Scene.addLight() is now Scene.add().' );
	this.add( child );

}

THREE.Scene.prototype.removeChild = function ( child ) {

	console.warn( 'DEPRECATED: Scene.removeChild() is now Scene.remove().' );
	this.remove( child );

}

THREE.Scene.prototype.removeObject = function ( child ) {

	console.warn( 'DEPRECATED: Scene.removeObject() is now Scene.remove().' );
	this.remove( child );

}

THREE.Scene.prototype.removeLight = function ( child ) {

	console.warn( 'DEPRECATED: Scene.removeLight() is now Scene.remove().' );
	this.remove( child );

}
