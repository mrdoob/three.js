/**
 * @author oosmoxiecode
 * @author mrdoob / http://mrdoob.com/
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3DLite/src/away3dlite/primitives/Torus.as?r=2888
 * @author bhouston / http://exocortex.com
 */

THREE.TorusGeometry = function ( radius, tube, radialSegments, tubularSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	radius = radius || 100;
	tube = tube || 40;

	radialSegments = Math.max( radialSegments || 8, 3 );
	tubularSegments = Math.max( tubularSegments || 6, 3 );

	phiStart = THREE.Math.clamp( phiStart || 0, 0, Math.PI * 2 );
	phiLength = THREE.Math.clamp( phiLength || Math.PI * 2, 0, Math.PI * 2 - phiStart );

	thetaStart = THREE.Math.clamp( thetaStart || 0, 0, Math.PI * 2 );
	thetaLength = THREE.Math.clamp( thetaLength || Math.PI * 2, 0, Math.PI * 2 - thetaStart );

	var inverseTubularSegments = 1.0 / tubularSegments;
	var points = [];

	for ( var i = 0, il = tubularSegments; i <= il; i ++ ) {

		var theta = thetaStart + i * inverseTubularSegments * thetaLength;

		var pt = new THREE.Vector3(
			radius + tube * Math.cos( theta ),
			0,
			tube * Math.sin( theta )
		);

		points.push( pt );
	}

	console.log( points );
	THREE.LatheGeometry.call( this, points, radialSegments, phiStart, phiLength );

	// remembering these, not sure why though.
    this.radius = radius;
	this.tube = tube;
	this.radialSegments = radialSegments;
	this.tubularSegments = tubularSegments;

	this.phiStart = phiStart;
	this.phiLength = phiLength;

	this.thetaStart = thetaStart;
	this.thetaLength = thetaLength;


    this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius + tube );

};

THREE.TorusGeometry.prototype = Object.create( THREE.Geometry.prototype );
