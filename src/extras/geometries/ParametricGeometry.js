/**
 * @author zz85 / https://github.com/zz85
 * Parametric Surfaces Geometry
 * based on the brilliant article by @prideout http://prideout.net/blog/?p=44
 */

THREE.ParametricGeometry = function ( slices, stacks, func ) {

	THREE.Geometry.call( this );

	var verts = this.vertices;
	var faces = this.faces;
	var uvs = this.faceVertexUvs[ 0 ];

	var face3 = true;

	var i, il, j, p;
	var u, v;

	for ( i = 0; i <= stacks; i ++ ) {

		v = i / stacks;

		for ( j = 0; j <= slices; j ++ ) {

			u = j / slices;

			p = func( u, v );
			verts.push( p );

		}
	}

	var v = 0, next;
	var a, b, c, d;
	var uva, uvb, ubc, uvd;

	// Some UV / Face orientation work needs to be done here...
	for ( i = 0; i < stacks; i ++ ) {
		for ( j = 0; j < slices; j ++ ) {

			a = i * stacks + j;
			b = i * stacks + j + 1;
			c = (i + 1) * stacks + j;
			d = (i + 1) * stacks + j + 1;

			uva = new THREE.UV( i / slices, j / stacks );
			uvb = new THREE.UV( i / slices, ( j + 1 ) / stacks );
			uvc = new THREE.UV( ( i + 1 ) / slices, j / stacks );
			uvd = new THREE.UV( ( i + 1 ) / slices, ( j + 1 ) / stacks );


			faces.push( new THREE.Face3( a, b, c ) );
			faces.push( new THREE.Face3( b, d, c ) );

			uvs.push( [ uva, ubc, uvc ] );
			uvs.push( [ uvb, uvd, uvc ] );
		}
		
	}

	// magic bullet
	// this.mergeVertices();

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.ParametricGeometry.prototype = new THREE.Geometry();
THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry;
