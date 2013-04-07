THREE.EllipsoidGeometry = function ( width, height, depth, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

  THREE.SphereGeometry.call( this, width * 0.5, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );

	this.applyMatrix( new THREE.Matrix4().makeScale( 1.0, height/width, depth/width ) );

};

THREE.EllipsoidGeometry.prototype = Object.create( THREE.Geometry.prototype );
