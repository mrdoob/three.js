/**
* @author Mark Kellogg - http://www.github.com/mkkellogg
*/

THREE.Particles = THREE.Particles || {};

THREE.Particles.FrameSet = function( timeFrames, valueFrames, isScalar ) {

	this.timeFrames = timeFrames || [];
	this.valueFrames = valueFrames || [];

}

THREE.Particles.FrameSet.prototype.findNextFrameForTimeValue = function( t ) {

	var frameIndex = 0;

	while ( frameIndex < this.timeFrames.length && this.timeFrames[ frameIndex ] < t ) {

		frameIndex = frameIndex + 1;

	}

	return frameIndex;

}

THREE.Particles.FrameSet.prototype.calculateFraction = function( a, b, z ) {

	return ( z - a ) / ( b - a );

}

THREE.Particles.FrameSet.prototype.interpolateFrameValues = function( t, target ) {

	var nextFrameIndex = this.findNextFrameForTimeValue( t );
	var currentFrameIndex = nextFrameIndex - 1;

	if ( nextFrameIndex == 0 ) {

		target.copy( this.valueFrames[ 0 ] );

	} else if ( nextFrameIndex == this.timeFrames.length ) {

		target.copy( this.valueFrames[ currentFrameIndex ] );

	} else {

		var fraction = this.calculateFraction( this.timeFrames[ currentFrameIndex ], this.timeFrames[ nextFrameIndex ], t );

		target.copy( this.valueFrames[ currentFrameIndex ] );
		target.lerp( this.valueFrames[ nextFrameIndex ], fraction );

	}

}
