/**
 * @author Mikael Emtinger
 */

THREE.VertexAnimatedMesh = function( geometry, materials ) {

	THREE.Mesh.call( this, geometry, materials );
	
	this.time = 0;
	this.keyInterpolation = 0.5;
	this.keyA = 0;
	this.keyB = 1;
	this.length = geometry.vertexKeys[ geometry.vertexKeys.length - 1 ].time;
	this.isPlaying = false;
	
	this.animationHandlerAPI = {};
	this.animationHandlerAPI.that = this;
	this.animationHandlerAPI.update = this.updateTime;			// this is to not override Object3D.update
}


THREE.VertexAnimatedMesh.prototype = new THREE.Mesh();
THREE.VertexAnimatedMesh.prototype.constructor = THREE.VertexAnimatedMesh;


/*
 * Update time (called through this.animationHandlerAPI by AnimationHandler.updste)
 */

THREE.VertexAnimatedMesh.prototype.updateTime = function( deltaTimeMS ) {

	// update time

	var that = this.that;

	that.time = ( that.time + deltaTimeMS ) % that.length;
	that.time = Math.max( 0, that.time );
	
	
	// find keys and calculate interpolation
	
	var k = 0,
		keys = that.geometry.vertexKeys,
		kl = keys.length;
		
	while( keys[ k ].time <= that.time && k < kl ) {
		
		k++;
	}
	
	if( k !== kl ) {
		
		that.keyA = k - 1;
		that.keyB = k;
		that.keyInterpolation = ( that.time - keys[ that.keyA ].time ) / ( keys[ that.keyB ].time - keys[ that.keyA ].time );
	
	} else {
		
		that.keyA = 0;
		that.keyB = 1;
		that.keyInterpolation = 0;
	}
}


/*
 * Play
 */

THREE.VertexAnimatedMesh.prototype.play = function( startTimeMS ) {
	
	this.time = Math.max( 0, startTimeMS % this.length );
	
	THREE.AnimationHandler.addToUpdate( this.animationHandlerAPI );	
}


/*
 * Stop
 */

THREE.VertexAnimatedMesh.prototype.stop = function() {
	
	this.time = 0;
	THREE.AnimationHandler.removeFromUpdate( this.animationHandlerAPI );
}
