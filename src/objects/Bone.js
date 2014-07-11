/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

THREE.Bone = function ( belongsToSkin ) {

	THREE.Object3D.call( this );

	this.skin = belongsToSkin;

	this.accumulatedRotWeight = 0;
	this.accumulatedPosWeight = 0;
	this.accumulatedSclWeight = 0;

};

THREE.Bone.prototype = Object.create( THREE.Object3D.prototype );

THREE.Bone.prototype.updateMatrixWorld = function ( force ) {

	THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

	// Reset weights to be re-accumulated in the next frame

	this.accumulatedRotWeight = 0;
	this.accumulatedPosWeight = 0;
	this.accumulatedSclWeight = 0;

};

