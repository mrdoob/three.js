/**
* @author Mark Kellogg - http://www.github.com/mkkellogg
*/

THREE.Particles = THREE.Particles || {};

THREE.Particles.RangeType = Object.freeze( {

	Cube: 1,
	Sphere: 2,
	Plane: 3

} );

THREE.Particles.Constants = Object.freeze( {

	VerticesPerParticle: 6,
	DegreesToRadians: Math.PI / 180.0

} );


THREE.Particles.Random = THREE.Particles.Random || {};

THREE.Particles.Random.getRandomVectorCube = function( vector, offset, range, edgeClamp ) {

	var x = Math.random() - 0.5;
	var y = Math.random() - 0.5;
	var z = Math.random() - 0.5;
	var w = Math.random() - 0.5;

	vector.set( x, y, z, w );

	if ( edgeClamp ) {

		var max = Math.max ( Math.abs( vector.x ), Math.max ( Math.abs( vector.y ), Math.abs( vector.z ) ) );
		vector.multiplyScalar( 1.0 / max );

	}

	vector.multiplyVectors( range, vector );
	vector.addVectors( offset, vector );

}

THREE.Particles.Random.getRandomVectorSphere = function( vector, offset, range, edgeClamp ) {

	var x = Math.random() - 0.5;
	var y = Math.random() - 0.5;
	var z = Math.random() - 0.5;
	var w = Math.random() - 0.5;

	vector.set( x, y, z, w );
	vector.normalize();

	vector.multiplyVectors( vector, range );

	if ( ! edgeClamp ) {

		var adjust = Math.random() * 2.0 - 1.0;
		vector.multiplyScalar( adjust );

	}

	vector.addVectors( vector, offset );

}

THREE.Particles.SingularVector = function( x ) {

	this.x = x;

}


THREE.Particles.SingularVector.prototype.copy = function( dest ) {

	this.x = dest.x;

}

THREE.Particles.SingularVector.prototype.set = function( x ) {

	this.x = x;

}

THREE.Particles.SingularVector.prototype.normalize = function() {

	//return this;

}

THREE.Particles.SingularVector.prototype.multiplyScalar = function( x ) {

	this.x *= x;

}

THREE.Particles.SingularVector.prototype.lerp = function( dest, f ) {

	this.x = this.x + f * ( dest.x - this.x );

}

THREE.Particles.SingularVector.prototype.addVectors = function( vector, offset ) {

	vector.x += offset;

}

THREE.Particles.SingularVector.prototype.multiplyVectors = function( vector, rangeVector ) {

	vector.x *= rangeVector.x;

}

