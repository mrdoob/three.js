/**
 * @author Mikael Emtinger
 */
 
THREE.LensFlare = function ( material, size ) {

	THREE.Object3D.call( this );

	this.positionScreen = new THREE.Vector3();
	this.lensFlares = [];
	this.customUpdateCallback = undefined;

	this.addLensFlare( material, size, 0 );
};

THREE.LensFlare.prototype = new THREE.Object3D();
THREE.LensFlare.prototype.constructor = THREE.LensFlare;
THREE.LensFlare.prototype.supr = THREE.Object3D.prototype;


/*
 * Add: adds another flare 
 */

THREE.LensFlare.prototype.add = function( material, size, distance ) {
	
	distance = Math.min( distance, Math.max( 0, distance ));

	lensFlares.push( { material: material, size: size, distance: distance, position: new THREE.Vector3() } );
}


/*
 * Update lens flares update positions on all flares based on the screen position
 * Set myLensFlare.customUpdateCallback to alter the flares in your project specific way.
 */

THREE.LensFlare.updateLensFlares = function() {
	
	// todo: update lens halo positions here
}












