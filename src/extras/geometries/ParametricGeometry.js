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

	var stackCount = stacks + 1;
	var sliceCount = slices + 1;
	
	for ( i = 0; i <= stacks; i ++ ) {

		v = i / stacks;

		for ( j = 0; j <= slices; j ++ ) {

			u = j / slices;

			p = func( u, v );
			verts.push( p );

		}
	}

	var a, b, c, d;
	var uva, uvb, uvc, uvd;

	for ( i = 0; i < stacks; i ++ ) {
		for ( j = 0; j < slices; j ++ ) {

			a = i * stackCount + j;
			b = i * stackCount + j + 1;
			c = (i + 1) * stackCount + j;
			d = (i + 1) * stackCount + j + 1;

			uva = new THREE.UV( i / slices, j / stacks );
			uvb = new THREE.UV( i / slices, ( j + 1 ) / stacks );
			uvc = new THREE.UV( ( i + 1 ) / slices, j / stacks );
			uvd = new THREE.UV( ( i + 1 ) / slices, ( j + 1 ) / stacks );

			faces.push( new THREE.Face3( a, b, c ) );
			faces.push( new THREE.Face3( b, d, c ) );

			uvs.push( [ uva, uvb, uvc ] );
			uvs.push( [ uvb, uvd, uvc ] );
		}
		
	}

	console.log(this);

	// magic bullet
	var diff = this.mergeVertices();
	console.log('removed ', diff, ' vertices by merging')
	
	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.ParametricGeometry.prototype = new THREE.Geometry();
THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry;
