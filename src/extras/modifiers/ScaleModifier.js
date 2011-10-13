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
	var i,il;
	var scale = this.scale, v;
	for (i=0,il=geometry.vertices.length;i<il;i++) {
	
		v = geometry.vertices[i].position;
		v.multiplySelf(scale);
	
	}

	geometry.computeCentroids();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

};