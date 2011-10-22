/*
 *	@author zz85 / http://twitter.com/blurspline
 *
 *	Scales a geometry by vector
 */

// Scale from 0,0,0 with (x,y,z)
THREE.ScaleModifier = function( scale /*Vector3*/ ) {
	this.scale = scale;
};

THREE.ScaleModifier.prototype.constructor = THREE.ScaleModifier;

THREE.ScaleModifier.prototype.modify = function ( geometry ) {
	
	geometry.applyMatrix( new THREE.Matrix4().setScale( this.scale.x, this.scale.y, this.scale.z ) );
	
};