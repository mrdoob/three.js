/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://exocortex.com
 */

THREE.SphereGeometry = function ( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	//THREE.Geometry.call( this );

	radius = radius || 50;

	widthSegments = Math.max( 3, Math.floor( widthSegments || 8 ) );
	heightSegments = Math.max( 2, Math.floor( heightSegments || 6 ) );

	phiStart = THREE.Math.clamp( phiStart || 0, 0, Math.PI * 2 );
	phiLength = THREE.Math.clamp( phiLength || Math.PI * 2, 0, Math.PI * 2 - phiStart );

	thetaStart = THREE.Math.clamp( thetaStart || 0, 0, Math.PI );
	thetaLength = THREE.Math.clamp( thetaLength || Math.PI, 0, Math.PI - thetaStart );

	var inverseHeightSegments = 1.0 / heightSegments;
	var points = [];

	for( var i = 0, il = heightSegments; i <= il; i ++ ) {
		
		var theta = thetaStart + i * inverseHeightSegments * thetaLength;

		var pt = new THREE.Vector3(
			radius * Math.sin( theta ),
			0,
			radius * Math.cos( theta )
		);

		points.push( pt );
	}

	THREE.LatheGeometry.call( this, points, widthSegments, phiStart, phiLength );

	//this.mergeVertices();

	// remember these because well, someone at some time wanted to remember them.
	this.radius = radius;
	this.widthSegments = widthSegments;
	this.heightSegments = heightSegments;

    this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.SphereGeometry.prototype = Object.create( THREE.Geometry.prototype );
