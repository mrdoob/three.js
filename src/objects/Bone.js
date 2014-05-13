/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Bone = function( belongsToSkin ) {

	THREE.Object3D.call( this );

	this.skin = belongsToSkin;

	this.accumulatedRotWeight = 0;
	this.accumulatedPosWeight = 0;
	this.accumulatedSclWeight = 0;

};

THREE.Bone.prototype = Object.create( THREE.Object3D.prototype );

THREE.Bone.prototype.update = function ( forceUpdate ) {

	// update local

	if ( this.matrixAutoUpdate ) {

		forceUpdate |= this.updateMatrix();

	}

	// update skin matrix

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

		// Reset weights to be re-accumulated in the next frame

		this.accumulatedRotWeight = 0;
		this.accumulatedPosWeight = 0;
		this.accumulatedSclWeight = 0;

	}

	// update children

	for ( var i = 0, l = this.children.length; i < l; i ++ ) {

		this.children[ i ].update( forceUpdate );

	}

};

